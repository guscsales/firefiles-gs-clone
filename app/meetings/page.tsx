import { AppPageContent } from '@/packages/ui/app-components/app-page-content';
import { AppPageHeader } from '@/packages/ui/app-components/app-page-header';

export default function MeetingsPage() {
  return (
    <>
      <AppPageHeader breadcrumbs={[{ label: 'Meetings' }]} />
      <AppPageContent>
        <p className="text-muted-foreground">No meetings yet.</p>
      </AppPageContent>
    </>
  );
}
