import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Folders, Briefcase, Mail, Settings, Menu, Bell } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Engineers", href: "/engineers", icon: Users },
    { label: "Categories", href: "/categories", icon: Folders },
    { label: "Projects", href: "/projects", icon: Briefcase },
    { label: "Contact Requests", href: "/contact-requests", icon: Mail },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r bg-card hidden md:flex">
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                IH
              </div>
              <span className="font-semibold text-lg tracking-tight">InteriorHub</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2 py-4">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h2 className="font-semibold text-lg hidden sm:block">
                {navItems.find(i => i.href === location)?.label || "InteriorHub"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold border border-primary/20">
                A
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background/50">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}