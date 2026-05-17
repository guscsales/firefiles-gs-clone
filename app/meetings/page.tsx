import { AppPageContent } from '@/packages/ui/app-components/app-page-content';
import { AppPageHeader } from '@/packages/ui/app-components/app-page-header';
import { PageSectionHeader } from '@/packages/ui/app-components/page-section-header';
import { MeetingsTable } from './_components/meetings-table';
import { UploadMeetingDialog } from './_components/upload-meeting-dialog';

export default function MeetingsPage() {
  return (
    <>
      <AppPageHeader breadcrumbs={[{ label: 'Meetings' }]} />
      <AppPageContent>
        <PageSectionHeader
          eyebrow="Your Meetings"
          title="Meetings"
          description="See all your meetings that are ready or processing. Enter in some of them to have more details."
          actions={<UploadMeetingDialog />}
        />
        <MeetingsTable />
      </AppPageContent>
    </>
  );
}
