'use client';

import { useQuery } from '@tanstack/react-query';

type MeetingDetail = {
  id: string;
  title: string;
  status: 'processing' | 'ready' | 'failed';
  summary: string | null;
  actionItems: { text: string }[] | null;
  transcriptOutput: {
    transcriptionText: string;
    segments: {
      id: number;
      start: number;
      end: number;
      text: string;
    }[];
    durationSeconds: number;
    detectedLanguage: string;
  } | null;
  errorMessage: string | null;
  createdAt: string;
};

async function _fetchMeeting(
  id: string
): Promise<{ meeting: MeetingDetail } | null> {
  const response = await fetch(`/api/meetings/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch meeting');
  }

  return response.json();
}

export function useMeetingDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['meeting', id],
    queryFn: () => _fetchMeeting(id)
  });

  return {
    meeting: data?.meeting,
    notFound: data === null,
    isLoading,
    error
  };
}

export type { MeetingDetail };
