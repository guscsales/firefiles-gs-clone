'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/packages/ui/core-components/toaster';

async function _uploadMeetingFn(formData: FormData) {
  const response = await fetch('/api/meetings', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.[0]?.message ?? 'Failed to upload meeting';
    throw new Error(message);
  }

  return data;
}

export function useMeeting() {
  const queryClient = useQueryClient();

  const { mutateAsync: uploadMeeting, isPending: isPendingUploadMeeting } =
    useMutation({
      mutationFn: _uploadMeetingFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['meetings'] });
        toast.success('Meeting uploaded successfully');
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    });

  return { uploadMeeting, isPendingUploadMeeting };
}
