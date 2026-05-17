'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/packages/ui/core-components/tabs';
import type { MeetingDetail } from '../_hooks/use-meeting-detail';
import { MeetingSummaryTab } from './meeting-summary-tab';
import { MeetingTranscriptionTab } from './meeting-transcription-tab';

export function MeetingTabs({ meeting }: { meeting: MeetingDetail }) {
  return (
    <Tabs defaultValue="summary">
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="transcription">Transcription</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        <MeetingSummaryTab
          summary={meeting.summary}
          actionItems={meeting.actionItems}
        />
      </TabsContent>
      <TabsContent value="transcription">
        <MeetingTranscriptionTab transcriptOutput={meeting.transcriptOutput} />
      </TabsContent>
    </Tabs>
  );
}
