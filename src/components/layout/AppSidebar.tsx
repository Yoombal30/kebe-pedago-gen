 import React from 'react';
 import { useLocation, useNavigate } from 'react-router-dom';
 import {
   Bot, BookOpen, Settings, FileText, Wand2, Upload, HelpCircle,
   Info, LifeBuoy, History, Layout, BarChart3, Database, GraduationCap,
   Home, MessageSquare, FolderOpen, Zap
 } from 'lucide-react';
 import {
   Sidebar,
   SidebarContent,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarFooter,
   SidebarSeparator,
   useSidebar,
 } from '@/components/ui/sidebar';
 import { Badge } from '@/components/ui/badge';
 import { cn } from '@/lib/utils';
 
 interface NavItem {
   id: string;
   label: string;
   icon: React.ComponentType<{ className?: string }>;
   badge?: string;
 }
 
 interface NavGroup {
   label: string;
   items: NavItem[];
 }
 
 const navigationGroups: NavGroup[] = [
   {
     label: 'Principal',
     items: [
       { id: 'dashboard', label: 'Accueil', icon: Home },
       { id: 'chat', label: 'Chat IA', icon: MessageSquare, badge: 'Cloud' },
     ],
   },
   {
     label: 'Création',
     items: [
       { id: 'templates', label: 'Templates', icon: Layout },
       { id: 'generator', label: 'Générateur', icon: Wand2 },
       { id: 'norm-generator', label: 'Cours Normatif', icon: GraduationCap },
     ],
   },
   {
     label: 'Contenu',
     items: [
       { id: 'modules', label: 'Modules', icon: BookOpen },
       { id: 'documents', label: 'Documents', icon: Upload },
       { id: 'qcm', label: 'QCM', icon: HelpCircle },
     ],
   },
   {
     label: 'Normes',
     items: [
       { id: 'norms', label: 'Explorateur', icon: Database },
     ],
   },
   {
     label: 'Suivi',
     items: [
       { id: 'history', label: 'Historique', icon: History },
       { id: 'analytics', label: 'Statistiques', icon: BarChart3 },
     ],
   },
   {
     label: 'Système',
     items: [
       { id: 'guide', label: 'Guide', icon: LifeBuoy },
       { id: 'status', label: 'État', icon: Info },
       { id: 'admin', label: 'Administration', icon: Settings },
     ],
   },
 ];
 
 interface AppSidebarProps {
   activeTab: string;
   onTabChange: (tab: string) => void;
 }
 
 export const AppSidebar: React.FC<AppSidebarProps> = ({ activeTab, onTabChange }) => {
   const { state } = useSidebar();
   const isCollapsed = state === 'collapsed';
 
   return (
     <Sidebar collapsible="icon" className="border-r border-sidebar-border">
       <SidebarHeader className="p-4">
         <div className={cn(
           "flex items-center gap-3 transition-all duration-200",
           isCollapsed && "justify-center"
         )}>
           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
             <Bot className="h-5 w-5" />
           </div>
           {!isCollapsed && (
             <div className="flex flex-col">
               <span className="font-bold text-sidebar-foreground">Professeur KEBE</span>
               <span className="text-xs text-sidebar-foreground/60">v5.1 Cloud</span>
             </div>
           )}
         </div>
       </SidebarHeader>
 
       <SidebarSeparator />
 
       <SidebarContent className="px-2">
         {navigationGroups.map((group, index) => (
           <SidebarGroup key={group.label}>
             <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase tracking-wider text-[10px] font-semibold">
               {group.label}
             </SidebarGroupLabel>
             <SidebarGroupContent>
               <SidebarMenu>
                 {group.items.map((item) => {
                   const Icon = item.icon;
                   const isActive = activeTab === item.id;
                   
                   return (
                     <SidebarMenuItem key={item.id}>
                       <SidebarMenuButton
                         onClick={() => onTabChange(item.id)}
                         isActive={isActive}
                         tooltip={item.label}
                         className={cn(
                           "transition-all duration-200",
                           isActive && "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                         )}
                       >
                         <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                         <span className="flex-1">{item.label}</span>
                         {item.badge && !isCollapsed && (
                           <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-0">
                             {item.badge}
                           </Badge>
                         )}
                       </SidebarMenuButton>
                     </SidebarMenuItem>
                   );
                 })}
               </SidebarMenu>
             </SidebarGroupContent>
           </SidebarGroup>
         ))}
       </SidebarContent>
 
       <SidebarFooter className="p-4">
         {!isCollapsed && (
           <div className="rounded-lg bg-sidebar-accent/50 p-3 text-center">
             <div className="flex items-center justify-center gap-2 text-xs text-sidebar-foreground/70">
               <Zap className="h-3 w-3 text-primary" />
               <span>Mode robuste actif</span>
             </div>
           </div>
         )}
       </SidebarFooter>
     </Sidebar>
   );
 };