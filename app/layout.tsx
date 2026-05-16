import './globals.css';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { AppSidebar } from '@/app/_components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider
} from '@/packages/ui/core-components/sidebar';
import { Toaster } from '@/packages/ui/core-components/toaster';
import { fontHeading, fontMono, fontSans } from '@/packages/ui/fonts';
import { QueryProvider } from '@/packages/ui/providers/query-provider';

export const metadata: Metadata = {
  title: 'Firefiles',
  icons: {
    icon: '/favicon.png'
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontHeading.variable} ${fontMono.variable} antialiased`}
      >
        <NuqsAdapter>
          <QueryProvider>
            <TooltipProvider>
              <SidebarProvider
                defaultOpen={sidebarOpen}
                className="h-dvh overflow-hidden"
              >
                <AppSidebar />
                <SidebarInset className="overflow-auto @container">
                  {children}
                </SidebarInset>
              </SidebarProvider>
              <Toaster />
            </TooltipProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
