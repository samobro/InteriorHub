import { Link, useLocation } from "wouter";
import { User, Briefcase, Mail, LogOut, Bell } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { mockMyProfile } from "@/data/mock";

const NAV_ITEMS = [
  { label: "My Profile", href: "/engineer/profile", icon: User },
  { label: "My Projects", href: "/engineer/projects", icon: Briefcase },
  { label: "Contact Requests", href: "/engineer/contact-requests", icon: Mail },
];

export function EngineerLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const currentLabel =
    NAV_ITEMS.find((i) => location.startsWith(i.href))?.label ?? "Engineer Portal";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r bg-sidebar hidden md:flex shrink-0">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                IH
              </div>
              <div>
                <div className="font-semibold text-sm tracking-tight text-sidebar-foreground">
                  InteriorHub
                </div>
                <div className="text-xs text-muted-foreground">Engineer Portal</div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2 py-3">
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.startsWith(item.href)}
                    tooltip={item.label}
                    className="rounded-lg"
                  >
                    <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          {/* Bottom: user pill + logout */}
          <div className="mt-auto border-t border-sidebar-border p-3 space-y-1">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {mockMyProfile.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-sidebar-foreground truncate">
                  {mockMyProfile.fullName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {mockMyProfile.email}
                </div>
              </div>
            </div>
            <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </Sidebar>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-13 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <h2 className="font-semibold text-sm hidden sm:block text-foreground">
                {currentLabel}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Bell className="h-3.5 w-3.5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold border border-primary/20">
                {mockMyProfile.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <div className="p-5 md:p-8 max-w-5xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
