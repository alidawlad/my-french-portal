
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarItem, SidebarProvider, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { NavLink } from '@/components/nav-link';
import { Home, NotebookText, BarChart, Layers } from 'lucide-react';
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
                   <NavLink href="/today">
                    <Home />
                    <span className="group-data-[collapsible=icon]:hidden">Today</span>
                   </NavLink>
                </SidebarItem>
                 <SidebarItem>
                   <NavLink href="/modules">
                    <Layers />
                    <span className="group-data-[collapsible=icon]:hidden">Modules</span>
                   </NavLink>
                </SidebarItem>
                 <SidebarItem>
                   <NavLink href="/rule-book">
                    <NotebookText />
                    <span className="group-data-[collapsible=icon]:hidden">Rule Book</span>
                   </NavLink>
                </SidebarItem>
                 <SidebarItem>
                   <NavLink href="/reports">
                    <BarChart />
                    <span className="group-data-[collapsible=icon]:hidden">Reports</span>
                   </NavLink>
                </SidebarItem>
              </SidebarMenu>
            </SidebarContent>
             <SidebarFooter>
                <SidebarTrigger />
             </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <main className="p-4 md:p-6 transition-[margin-left] group-data-[sidebar-collapsed=icon]:ml-[--sidebar-width-icon]">
                {children}
            </main>
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
