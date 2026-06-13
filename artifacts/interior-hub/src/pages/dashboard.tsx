import { useState, useEffect } from "react";
import {
  Users, Clock, Briefcase, Folders,
  CheckCircle2, XCircle, UserPlus, FileImage,
  MessageSquare, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { mockStats, mockActivity } from "@/data/mock";
import type { DashboardStats, ActivityItem } from "@/types";
import { format } from "date-fns";

// ─── Data source (replace with real API call) ────────────────────────────────
function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setData(mockStats); setIsLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);
  return { data, isLoading };
}

function useDashboardActivity() {
  const [data, setData] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      setData([...mockActivity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);
  return { data, isLoading };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Platform overview and recent activity.</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-10 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
          ))
        ) : stats ? (
          <>
            <StatCard title="Total Engineers" value={stats.totalEngineers} icon={Users} sub="All registered" />
            <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={Clock} sub="Awaiting review" accent="amber" />
            <StatCard title="Total Projects" value={stats.totalProjects} icon={Briefcase} sub="Uploaded portfolios" />
            <StatCard title="Categories" value={stats.totalCategories} icon={Folders} sub="Active categories" />
          </>
        ) : (
          <div className="col-span-4 text-center text-sm text-muted-foreground py-8">Failed to load stats.</div>
        )}
      </div>

      {/* Activity + status breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity feed — 2/3 width */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No activity yet.</p>
            ) : (
              <div className="space-y-5">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <ActivityIcon type={item.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{item.message}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.relatedName && (
                          <span className="text-xs text-muted-foreground truncate">{item.relatedName}</span>
                        )}
                        {item.relatedName && <span className="text-xs text-muted-foreground">·</span>}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(item.timestamp), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engineer status breakdown — 1/3 width */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Engineer Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : stats ? (
              <div className="space-y-5">
                <StatusBar
                  label="Approved"
                  value={stats.approvedEngineers}
                  total={stats.totalEngineers}
                  color="bg-emerald-500"
                  textColor="text-emerald-700"
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                />
                <StatusBar
                  label="Pending"
                  value={stats.pendingApprovals}
                  total={stats.totalEngineers}
                  color="bg-amber-500"
                  textColor="text-amber-700"
                  icon={<Clock className="h-3.5 w-3.5" />}
                />
                <StatusBar
                  label="Disabled"
                  value={stats.disabledEngineers}
                  total={stats.totalEngineers}
                  color="bg-red-500"
                  textColor="text-red-700"
                  icon={<XCircle className="h-3.5 w-3.5" />}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title, value, icon: Icon, sub, accent,
}: {
  title: string; value: number; icon: React.ElementType; sub: string; accent?: "amber";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent === "amber" ? "bg-amber-100" : "bg-primary/10"}`}>
          <Icon className={`h-4 w-4 ${accent === "amber" ? "text-amber-600" : "text-primary"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function StatusBar({
  label, value, total, color, textColor, icon,
}: {
  label: string; value: number; total: number; color: string; textColor: string; icon: React.ReactNode;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1.5 font-medium ${textColor}`}>
          {icon} {label}
        </span>
        <span className="text-foreground font-semibold">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const base = "h-4 w-4";
  switch (type) {
    case "engineer_signup": return <UserPlus className={`${base} text-blue-500`} />;
    case "project_added": return <FileImage className={`${base} text-indigo-500`} />;
    case "engineer_approved": return <CheckCircle2 className={`${base} text-emerald-500`} />;
    case "engineer_disabled": return <XCircle className={`${base} text-red-500`} />;
    case "contact_request": return <MessageSquare className={`${base} text-amber-500`} />;
    default: return <Activity className={`${base} text-muted-foreground`} />;
  }
}
