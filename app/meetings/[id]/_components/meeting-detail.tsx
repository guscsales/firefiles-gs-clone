'use client';

import { ArrowLeft, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/packages/ui/core-components/skeleton';
import { useMeetingDetail } from '../_hooks/use-meeting-detail';
import { MeetingTabs } from './meeting-tabs';

export function MeetingDetail({ id }: { id: string }) {
  const { meeting, notFound, isLoading } = useMeetingDetail(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    );
  }

  if (notFound || !meeting) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to meetings
        </Link>
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 shadow-sm">
            <FileQuestion className="size-10 text-muted-foreground" />
            <p className="font-sans text-lg font-semibold text-foreground">
              Meeting not found
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              This meeting may have been deleted or the link is invalid.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to meetings
        </Link>
        <h1 className="font-sans text-2xl font-bold text-foreground">
          {meeting.title}
        </h1>
      </div>
      <MeetingTabs meeting={meeting} />
    </div>
  );
}
