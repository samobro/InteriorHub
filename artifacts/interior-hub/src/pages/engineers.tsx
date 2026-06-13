import { useState, useEffect, useMemo } from "react";
import { Search, UserX, UserCheck, Eye, MoreHorizontal, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { PaginationBar } from "@/components/pagination-bar";
import { EmptyState } from "@/components/empty-state";
import { mockEngineers } from "@/data/mock";
import type { Engineer, EngineerStatus } from "@/types";

const PAGE_SIZE = 6;

// ─── Data source (replace with real API call) ────────────────────────────────
function useEngineers(search: string, status: string, page: number) {
  const [isLoading, setIsLoading] = useState(true);
  const filtered = useMemo(() => {
    let list = mockEngineers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.city.toLowerCase().includes(q),
      );
    }
    if (status !== "all") list = list.filter((e) => e.status === status);
    return list;
  }, [search, status]);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, [search, status, page]);

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const data = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return { data, isLoading, totalCount, totalPages };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Engineers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const { data, isLoading, totalCount, totalPages } = useEngineers(search, statusFilter, page);

  // Mock status-update handler — wire to API call when ready
  const handleUpdateStatus = (engineer: Engineer, newStatus: EngineerStatus) => {
    console.log("UPDATE STATUS:", engineer.id, newStatus);
    // TODO: call PATCH /api/engineers/:id/status
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Engineers</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage and approve design professionals on the platform.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or city..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="pl-4">Engineer</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Projects</TableHead>
              <TableHead>Trial Ends</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-36" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                  <TableCell className="pr-4"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={UserX}
                    title="No engineers found"
                    description="Try adjusting your search or filter criteria."
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((engineer) => (
                <TableRow
                  key={engineer.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelectedEngineer(engineer)}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {engineer.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{engineer.fullName}</div>
                        <div className="text-xs text-muted-foreground">{engineer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{engineer.city}</TableCell>
                  <TableCell><StatusBadge status={engineer.status} /></TableCell>
                  <TableCell className="text-center font-medium text-sm">{engineer.projectsCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {engineer.trialEndsAt ? format(new Date(engineer.trialEndsAt), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(engineer.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedEngineer(engineer)}>
                          <Eye className="mr-2 h-4 w-4" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {engineer.status === "pending" && (
                          <DropdownMenuItem className="text-emerald-600 focus:text-emerald-600" onClick={() => handleUpdateStatus(engineer, "approved")}>
                            <UserCheck className="mr-2 h-4 w-4" /> Approve
                          </DropdownMenuItem>
                        )}
                        {engineer.status === "approved" && (
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleUpdateStatus(engineer, "disabled")}>
                            <UserX className="mr-2 h-4 w-4" /> Disable
                          </DropdownMenuItem>
                        )}
                        {engineer.status === "disabled" && (
                          <DropdownMenuItem className="text-emerald-600 focus:text-emerald-600" onClick={() => handleUpdateStatus(engineer, "approved")}>
                            <UserCheck className="mr-2 h-4 w-4" /> Re-enable
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && totalCount > 0 && (
          <div className="border-t px-4 py-2">
            <PaginationBar
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Detail side panel */}
      <EngineerSheet
        engineer={selectedEngineer}
        open={selectedEngineer !== null}
        onOpenChange={(open) => !open && setSelectedEngineer(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

// ─── Engineer Detail Sheet ────────────────────────────────────────────────────

function EngineerSheet({
  engineer, open, onOpenChange, onUpdateStatus,
}: {
  engineer: Engineer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (e: Engineer, s: EngineerStatus) => void;
}) {
  if (!engineer) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-sm overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex flex-col items-center gap-3 pt-4 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {engineer.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-lg">{engineer.fullName}</SheetTitle>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <StatusBadge status={engineer.status} />
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Action buttons */}
        <div className="flex gap-2 mb-6">
          {engineer.status === "pending" && (
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => onUpdateStatus(engineer, "approved")}>
              <UserCheck className="mr-2 h-4 w-4" /> Approve
            </Button>
          )}
          {engineer.status === "approved" && (
            <Button variant="destructive" className="flex-1" onClick={() => onUpdateStatus(engineer, "disabled")}>
              <UserX className="mr-2 h-4 w-4" /> Disable Account
            </Button>
          )}
          {engineer.status === "disabled" && (
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => onUpdateStatus(engineer, "approved")}>
              <UserCheck className="mr-2 h-4 w-4" /> Re-enable
            </Button>
          )}
        </div>

        {/* Info sections */}
        <div className="space-y-5">
          <InfoSection title="Contact">
            <InfoRow icon={Mail} value={engineer.email} />
            <InfoRow icon={Phone} value={engineer.phone ?? "Not provided"} muted={!engineer.phone} />
            <InfoRow icon={MapPin} value={engineer.city} />
          </InfoSection>

          <InfoSection title="Platform">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{engineer.projectsCount}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Projects</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-sm font-semibold">
                  {engineer.trialEndsAt ? format(new Date(engineer.trialEndsAt), "MMM d") : "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Trial ends</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {format(new Date(engineer.createdAt), "MMMM d, yyyy")}
            </div>
          </InfoSection>

          {engineer.bio && (
            <InfoSection title="Biography">
              <p className="text-sm leading-relaxed text-foreground">{engineer.bio}</p>
            </InfoSection>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, value, muted }: { icon: React.ElementType; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className={muted ? "text-muted-foreground" : ""}>{value}</span>
    </div>
  );
}
