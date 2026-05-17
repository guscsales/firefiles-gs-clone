'use client';

import { Upload } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useMeeting } from '@/app/meetings/_hooks/use-meeting';
import {
  ACCEPT_STRING,
  MAX_FILE_SIZE
} from '@/app/meetings/_validators/meeting-upload';
import { Button } from '@/packages/ui/core-components/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogForm,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/packages/ui/core-components/dialog';
import { InputFileUpload } from '@/packages/ui/core-components/input-file-upload';

type UploadFormValues = {
  file: File[];
};

export function UploadMeetingDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { uploadMeeting, isPendingUploadMeeting } = useMeeting();

  const form = useForm<UploadFormValues>({
    defaultValues: {
      file: []
    }
  });

  const fileValue = form.watch('file');
  const hasFile = fileValue?.length > 0;
  const isLoading = isPending || isPendingUploadMeeting;

  function _handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset();
    }
    setOpen(nextOpen);
  }

  function _handleSubmit(values: UploadFormValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('file', values.file[0]);

      await uploadMeeting(formData);

      form.reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={_handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Upload />
          Upload meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[26.25rem]">
        <DialogForm onSubmit={form.handleSubmit(_handleSubmit)}>
          <DialogHeader>
            <DialogTitle>Upload meeting</DialogTitle>
            <DialogDescription>
              Upload an audio or video file to transcribe.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <InputFileUpload
              name="file"
              control={form.control as never}
              label="Recording file"
              error={form.formState.errors.file?.message}
              required
              fileUploadProps={{
                accept: ACCEPT_STRING,
                maxFiles: 1,
                maxSize: MAX_FILE_SIZE
              }}
              firstLinePlaceholder="Drop audio/video file or browse"
              secondLinePlaceholder="MP3, MP4, WAV, WebM — up to 4.5MB"
            />
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => _handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!hasFile || isLoading}
              handling={isLoading}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogForm>
      </DialogContent>
    </Dialog>
  );
}
