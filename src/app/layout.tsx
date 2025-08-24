
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarItem, SidebarMenu, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, NotebookText, BarChart, FlaskConical } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ali Respeaker',
  description: 'FR‑EN‑AR Pronunciation Workbench',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Literata:opsz,wght@24..144,400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
         <SidebarProvider defaultOpen={true}>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 text-primary font-bold size-8 flex items-center justify-center rounded-lg">
                  A
                </div>
                <span className="font-headline font-semibold text-lg group-data-[collapsible=icon]:hidden">Respeaker</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarItem>
                   <Link href="/today" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                    <Home />
                    <span className="group-data-[collapsible=icon]:hidden">Today</span>
                   </Link>
                </SidebarItem>
                 <SidebarItem>
                   <Link href="/modules/pronunciation" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                    <FlaskConical />
                    <span className="group-data-[collapsible=icon]:hidden">Pronunciation</span>
                   </Link>
                </SidebarItem>
                 <SidebarItem>
                   <Link href="/rule-book" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                    <NotebookText />
                    <span className="group-data-[collapsible=icon]:hidden">Rule Book</span>
                   </Link>
                </SidebarItem>
                 <SidebarItem>
                   <Link href="/reports" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                    <BarChart />
                    <span className="group-data-[collapsible=icon]:hidden">Reports</span>
                   </Link>
                </SidebarItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <div className="p-4 md:p-6">
                {children}
            </div>
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
