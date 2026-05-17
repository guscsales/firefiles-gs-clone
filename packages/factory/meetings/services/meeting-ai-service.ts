import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/env';
import {
  getMeetingById,
  updateMeeting
} from '@/packages/factory/meetings/services/meeting-service';
import { transcribeWithWhisper } from '@/packages/factory/meetings/services/meeting-transcription-service';
import { createLoggerClient } from '@/packages/plugins/logger/logger';

const logger = createLoggerClient('meeting-ai-service');

type AiMeetingOutput = {
  title: string;
  summary: string;
  actionItems: { text: string }[];
};

function _validateAiResponse(parsed: unknown): parsed is AiMeetingOutput {
  if (!parsed || typeof parsed !== 'object') return false;
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.title !== 'string' || !obj.title) return false;
  if (typeof obj.summary !== 'string' || !obj.summary) return false;
  if (!Array.isArray(obj.actionItems)) return false;
  return obj.actionItems.every(
    (item: unknown) =>
      item &&
      typeof item === 'object' &&
      typeof (item as { text: unknown }).text === 'string'
  );
}

async function _validateOutputQuality(
  client: Anthropic,
  transcriptionText: string,
  output: AiMeetingOutput
): Promise<{ pass: boolean; reason: string }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: `You are a quality checker for meeting intelligence outputs. You will receive a meeting transcript and an AI-generated analysis of it. Determine if the analysis represents genuine meeting intelligence or if it indicates the transcript was not a real meeting.

Return ONLY a JSON object with:
- "pass": boolean — true if the output contains legitimate meeting intelligence (real title, meaningful summary, relevant action items). false if the output indicates the content is not a meeting, contains refusal language, or the summary describes why extraction failed rather than what was discussed.
- "reason": string — brief explanation of why it passed or failed.

Respond ONLY with valid JSON. No markdown fences.`,
    messages: [
      {
        role: 'user',
        content: `<transcript>\n${transcriptionText.slice(0, 2000)}\n</transcript>\n\n<ai_output>\n${JSON.stringify(output)}\n</ai_output>`
      }
    ]
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return { pass: false, reason: 'Quality check returned no response' };
  }

  try {
    let rawText = textBlock.text.trim();
    const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      rawText = fenceMatch[1].trim();
    }
    const result = JSON.parse(rawText) as { pass: boolean; reason: string };
    return {
      pass: typeof result.pass === 'boolean' ? result.pass : false,
      reason: typeof result.reason === 'string' ? result.reason : 'Unknown'
    };
  } catch {
    return { pass: false, reason: 'Failed to parse quality check response' };
  }
}

async function _processTranscriptionMetadata(
  meetingId: string,
  transcriptionText: string
) {
  const client = new Anthropic({ apiKey: env.AI_API_KEY });

  logger.info(`Processing transcript - ID: ${meetingId}`);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: `<prompt_rules>
  <instructions>
    You are a meeting intelligence assistant. Analyze the following meeting transcript and extract structured information.


    Return a JSON object with exactly these fields:

    1. **title**: A concise, descriptive meeting title (3-8 words). Capture the main topic discussed.

    2. **summary**: A clear summary of what was discussed, decisions made, and key points. Write in past tense. Max 500 words. Plain text, no markdown.

    3. **actionItems**: An array of concrete action items mentioned or implied in the meeting. Each item is an object with a single "text" field containing one specific, actionable task. Omit vague or empty items. If no action items exist, return an empty array.

    Respond ONLY with valid JSON. No markdown fences, no explanation, no extra text.
  </instructions>

  <example_output_format>
  {"title":"Q3 Marketing Budget Review","summary":"The team reviewed...","actionItems":[{"text":"Send revised budget proposal by Friday"},{"text":"Schedule follow-up with design team"}]}
  </example_output_format>
</prompt_rules>`,
    messages: [
      {
        role: 'user',
        content: `<meeting_transcription_text>\n${transcriptionText}\n</meeting_transcription_text>`
      }
    ]
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text block in AI response');
  }

  let parsed: unknown;
  try {
    let rawText = textBlock.text.trim();
    const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      rawText = fenceMatch[1].trim();
    }
    parsed = JSON.parse(rawText);
  } catch {
    await updateMeeting(meetingId, {
      status: 'failed',
      errorMessage: 'Failed to parse AI response as JSON'
    });
    return;
  }

  if (!_validateAiResponse(parsed)) {
    await updateMeeting(meetingId, {
      status: 'failed',
      errorMessage: 'Invalid AI response: missing required fields'
    });
    return;
  }

  logger.info(`Checking quality... - ID: ${meetingId}`);

  const qualityCheck = await _validateOutputQuality(
    client,
    transcriptionText,
    parsed
  );

  logger.info(
    `Quality check response - ID: ${meetingId} - ${JSON.stringify(qualityCheck)}`
  );

  if (!qualityCheck.pass) {
    await updateMeeting(meetingId, {
      status: 'failed',
      errorMessage: `Quality check failed: ${qualityCheck.reason}`
    });
    return;
  }

  await updateMeeting(meetingId, {
    title: parsed.title,
    summary: parsed.summary,
    actionItems: parsed.actionItems,
    status: 'ready'
  });

  logger.info(`Meeting metadata process completed - ID: ${meetingId}`);
}

export async function processMeetingTranscript(
  meetingId: string,
  fileBuffer?: Buffer,
  fileName?: string
) {
  const meeting = await getMeetingById(meetingId);
  if (!meeting) return;

  let transcriptionText: string | undefined;

  const existingTranscript = meeting.transcriptOutput as {
    transcriptionText?: string;
  } | null;

  if (existingTranscript?.transcriptionText) {
    transcriptionText = existingTranscript.transcriptionText;
  } else if (fileBuffer && fileName) {
    try {
      logger.info(`Processing transcription via Whisper - ID: ${meetingId}`);
      const whisperOutput = await transcribeWithWhisper(fileBuffer, fileName);
      await updateMeeting(meetingId, { transcriptOutput: whisperOutput });
      transcriptionText = whisperOutput.transcriptionText;
      logger.info(`Whisper transcription completed - ID: ${meetingId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Whisper transcription failed';
      logger.error('Whisper transcription failed', error);
      await updateMeeting(meetingId, {
        status: 'failed',
        errorMessage: message
      });
      return;
    }
  }

  if (!transcriptionText) {
    await updateMeeting(meetingId, {
      status: 'failed',
      errorMessage: 'Transcript text is empty'
    });
    return;
  }

  try {
    await _processTranscriptionMetadata(meetingId, transcriptionText);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown AI processing error';
    logger.error('AI processing failed', error);
    await updateMeeting(meetingId, {
      status: 'failed',
      errorMessage: message
    });
  }
}
