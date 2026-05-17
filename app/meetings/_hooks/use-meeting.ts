'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/packages/ui/core-components/toaster';

async function _uploadMeetingFn(formData: FormData) {
  const response = await fetch('/api/meetings', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    let message = 'Failed to upload meeting';
    try {
      const data = await response.json();
      message = data?.error?.[0]?.message ?? message;
    } catch {
      if (response.status === 413) {
        message = 'File too large. Please upload a smaller file.';
      }
    }
    throw new Error(message);
  }

  return response.json();
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
