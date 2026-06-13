import { useGetDashboardStats, useGetDashboardActivity } from "@workspace/api-client-react";
import { Users, UserPlus, Folders, Briefcase, Activity, Clock, CheckCircle2, XCircle, FileImage, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetDashboardActivity();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your platform's activity and status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </>
        ) : stats ? (
          <>
            <StatsCard title="Total Engineers" value={stats.totalEngineers} icon={Users} trend="Active designers" />
            <StatsCard title="Pending Approvals" value={stats.pendingApprovals} icon={Clock} trend="Require action" trendColor="text-amber-600" />
            <StatsCard title="Total Projects" value={stats.totalProjects} icon={Briefcase} trend="Uploaded portfolios" />
            <StatsCard title="Categories" value={stats.totalCategories} icon={Folders} trend="Active categories" />
          </>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[1.25rem] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {activity.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={item.id} 
                    className="relative flex items-start gap-4"
                  >
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border shadow-sm">
                      <ActivityIcon type={item.type} />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm font-medium leading-none">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {item.relatedName && <span className="truncate">{item.relatedName}</span>}
                        {item.relatedName && <span>•</span>}
                        <span>{format(new Date(item.timestamp), "MMM d, yyyy h:mm a")}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No recent activity found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Engineer Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : stats ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-medium text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Approved
                    </div>
                    <span className="font-semibold">{stats.approvedEngineers}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${(stats.approvedEngineers / (stats.totalEngineers || 1)) * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-medium text-amber-600">
                      <Clock className="h-4 w-4" />
                      Pending
                    </div>
                    <span className="font-semibold">{stats.pendingApprovals}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${(stats.pendingApprovals / (stats.totalEngineers || 1)) * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-medium text-red-600">
                      <XCircle className="h-4 w-4" />
                      Disabled
                    </div>
                    <span className="font-semibold">{stats.disabledEngineers}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${(stats.disabledEngineers / (stats.totalEngineers || 1)) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, trendColor = "text-muted-foreground" }: any) {
  return (
    <Card className="overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 ${trendColor}`}>{trend}</p>
      </CardContent>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'engineer_signup':
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case 'project_added':
      return <FileImage className="h-4 w-4 text-indigo-500" />;
    case 'engineer_approved':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'engineer_disabled':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'contact_request':
      return <MessageSquare className="h-4 w-4 text-amber-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}