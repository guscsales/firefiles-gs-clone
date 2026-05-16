'use client';

import { Trash2, UploadIcon } from 'lucide-react';
import { type Control, Controller } from 'react-hook-form';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList
} from './file-upload';
import { InputWrapper } from './input-wrapper';
import { Label } from './label';
import { toast } from './toaster';

interface InputFileUploadProps
  extends React.ComponentProps<typeof InputWrapper> {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: any control allowed
  control: Control<any>;
  id?: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
  firstLinePlaceholder?: string;
  secondLinePlaceholder?: string;
  variant?: 'full' | 'light';
  fileUploadProps?: React.ComponentProps<typeof FileUpload>;
  hideDropzoneOnReachedMaxFiles?: boolean;
  required?: boolean;
}

export function InputFileUpload({
  name,
  control,
  label,
  error,
  fileUploadProps,
  firstLinePlaceholder,
  secondLinePlaceholder,
  variant = 'full',
  hideDropzoneOnReachedMaxFiles = false,
  required,
  ...props
}: InputFileUploadProps) {
  const maxSizeInMB = fileUploadProps?.maxSize
    ? fileUploadProps?.maxSize / 1024 / 1024
    : 0;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const totalFilesDropped = field?.value?.length || 0;
        const shouldHideDropzone =
          (hideDropzoneOnReachedMaxFiles &&
            totalFilesDropped < (fileUploadProps?.maxFiles ?? 0)) ||
          !hideDropzoneOnReachedMaxFiles;

        return (
          <InputWrapper {...props}>
            {label && (
              <Label htmlFor={props.id} withOptional={required === false}>
                {label}
              </Label>
            )}
            <FileUpload
              value={field.value}
              onValueChange={field.onChange}
              onFileReject={(_, message) => {
                toast.error(message);
              }}
              accept={fileUploadProps?.accept ?? ''}
              maxFiles={fileUploadProps?.maxFiles ?? 0}
              maxSize={fileUploadProps?.maxSize ?? 0}
              {...fileUploadProps}
            >
              {shouldHideDropzone && (
                <>
                  {variant === 'full' && (
                    <FileUploadDropzone error={!!error} {...props}>
                      <UploadIcon className="size-5 text-muted-foreground" />
                      <p className="font-medium text-[0.8125rem]/4 text-input-text">
                        {firstLinePlaceholder || 'Drop file or browse'}
                      </p>
                      <p className="text-[0.6875rem]/[0.875rem] text-muted-foreground">
                        {secondLinePlaceholder ||
                          (fileUploadProps?.maxFiles &&
                          fileUploadProps?.maxFiles > 1
                            ? `up to ${fileUploadProps?.maxFiles} files · ${maxSizeInMB}MB each`
                            : `up to ${maxSizeInMB}MB`)}
                      </p>
                    </FileUploadDropzone>
                  )}
                  {variant === 'light' && (
                    <FileUploadDropzone
                      className="flex-row flex-wrap border-dotted text-center text-sm"
                      error={!!error}
                    >
                      <UploadIcon className="size-4" />
                      <span>
                        {firstLinePlaceholder ||
                          `Drag and drop ${fileUploadProps?.maxFiles && fileUploadProps?.maxFiles > 1 ? 'the files' : 'the file'} here`}{' '}
                        or{' '}
                        <span className="underline underline-offset-2">
                          click to choose{' '}
                          {fileUploadProps?.maxFiles &&
                            fileUploadProps?.maxFiles > 1 &&
                            `the files (${fileUploadProps?.maxFiles})`}
                          {fileUploadProps?.maxFiles &&
                            fileUploadProps?.maxFiles === 1 &&
                            `the file`}
                        </span>
                      </span>
                    </FileUploadDropzone>
                  )}
                </>
              )}
              {field?.value?.length > 0 && (
                <FileUploadList>
                  {field.value.map((file: File, index: number) => (
                    <FileUploadItem
                      key={`file-upload-item-${name}-${index.toString()}`}
                      value={file}
                    >
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemDelete asChild>
                        <button
                          type="button"
                          className="flex size-5 shrink-0 cursor-pointer items-center justify-center text-input-icon-static-fg hover:text-foreground"
                        >
                          <Trash2 className="size-3.5" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  ))}
                </FileUploadList>
              )}
            </FileUpload>
            {error && <div className="text-xs text-destructive">{error}</div>}
          </InputWrapper>
        );
      }}
    />
  );
}
