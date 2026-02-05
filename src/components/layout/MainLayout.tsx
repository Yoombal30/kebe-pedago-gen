 import React, { useState } from 'react';
 import { Play, PanelLeft } from 'lucide-react';
 import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
 import { Button } from '@/components/ui/button';
 import { AppSidebar } from './AppSidebar';
 import { ThemeLanguageSelector } from '@/components/ThemeLanguageSelector';
 import { OfflineIndicator } from '@/components/OfflineIndicator';
 import { StatusIndicator } from '@/components/StatusIndicator';
 
 interface MainLayoutProps {
   children: React.ReactNode;
   activeTab: string;
   onTabChange: (tab: string) => void;
   onLaunchDemo: () => void;
 }
 
 export const MainLayout: React.FC<MainLayoutProps> = ({
   children,
   activeTab,
   onTabChange,
   onLaunchDemo,
 }) => {
   return (
     <SidebarProvider defaultOpen={true}>
       <div className="min-h-screen flex w-full bg-background">
         <AppSidebar activeTab={activeTab} onTabChange={onTabChange} />
         
         <SidebarInset className="flex flex-col flex-1">
           {/* Header */}
           <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
             <SidebarTrigger className="-ml-1" />
             
             <div className="flex-1" />
             
             <div className="flex items-center gap-3">
               <Button 
                 onClick={onLaunchDemo} 
                 variant="outline" 
                 size="sm" 
                 className="gap-2 hidden md:flex"
               >
                 <Play className="w-4 h-4" />
                 Démo
               </Button>
               <OfflineIndicator />
               <ThemeLanguageSelector />
               <StatusIndicator />
             </div>
           </header>
           
           {/* Main content */}
           <main className="flex-1 overflow-auto">
             {children}
           </main>
         </SidebarInset>
       </div>
     </SidebarProvider>
   );
 };