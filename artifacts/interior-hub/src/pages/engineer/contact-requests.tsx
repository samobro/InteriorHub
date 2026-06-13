import { useState, useEffect, useMemo } from "react";
import { Mail, ChevronDown, ChevronUp, Phone, Circle } from "lucide-react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { PaginationBar } from "@/components/pagination-bar";
import { mockMyContactRequests } from "@/data/mock";
import type { EngineerContactRequest } from "@/types";

const PAGE_SIZE = 8;

// ─── Data source (replace with real API call) ────────────────────────────────
function useMyContactRequests() {
  const [data, setData] = useState<EngineerContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      setData(
        [...mockMyContactRequests].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);
  return { data, setData, isLoading };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function EngineerContactRequests() {
  const { data: requests, setData: setRequests, isLoading } = useMyContactRequests();

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => { setPage(1); }, [filter]);

  // Unread count for badge
  const unreadCount = useMemo(
    () => requests.filter((r) => !r.isRead).length,
    [requests],
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return requests.filter((r) => !r.isRead);
    return requests;
  }, [requests, filter]);

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Mark as read + expand — wire to PATCH /api/engineer/contact-requests/:id/read
  const handleRowClick = (req: EngineerContactRequest) => {
    if (!req.isRead) {
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, isRead: true } : r)),
      );
      // TODO: PATCH /api/engineer/contact-requests/:id/read
    }
    setExpandedId((prev) => (prev === req.id ? null : req.id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Requests</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Messages sent to you by potential clients.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterPill>
        <FilterPill active={filter === "unread"} onClick={() => setFilter("unread")}>
          Unread
          {unreadCount > 0 && (
            <Badge className="ml-1.5 text-xs px-1.5 py-0 h-4 bg-primary text-primary-foreground hover:bg-primary">
              {unreadCount}
            </Badge>
          )}
        </FilterPill>
        {!isLoading && (
          <span className="ml-auto text-xs text-muted-foreground">
            {totalCount} request{totalCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="pl-4 w-4" />
              <TableHead>Client</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="pr-4 w-8" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4 w-4"><Skeleton className="h-2 w-2 rounded-full" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-44" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={Mail}
                    title={filter === "unread" ? "No unread requests" : "No contact requests yet"}
                    description={
                      filter === "unread"
                        ? "You've read all your messages."
                        : "When clients reach out through your profile, their messages will appear here."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((req) => (
                <RequestRow
                  key={req.id}
                  request={req}
                  expanded={expandedId === req.id}
                  onClick={() => handleRowClick(req)}
                />
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && totalCount > PAGE_SIZE && (
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
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterPill({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg border px-3 h-8 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {children}
    </button>
  );
}

function RequestRow({
  request, expanded, onClick,
}: {
  request: EngineerContactRequest;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <>
      <TableRow
        className={`cursor-pointer transition-colors ${
          !request.isRead
            ? "bg-primary/[0.03] hover:bg-primary/[0.06]"
            : "hover:bg-muted/20"
        }`}
        onClick={onClick}
      >
        {/* Unread indicator dot */}
        <TableCell className="pl-4 w-4">
          {!request.isRead && (
            <Circle className="h-2 w-2 fill-primary text-primary" />
          )}
        </TableCell>

        {/* Client */}
        <TableCell>
          <div className={`text-sm ${!request.isRead ? "font-semibold" : "font-medium"}`}>
            {request.clientName}
          </div>
          <div className="text-xs text-muted-foreground">{request.clientEmail}</div>
        </TableCell>

        {/* Phone */}
        <TableCell>
          {request.clientPhone ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              {request.clientPhone}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">—</span>
          )}
        </TableCell>

        {/* Message preview */}
        <TableCell className="max-w-xs">
          {request.message ? (
            <span className={`text-sm line-clamp-1 ${!request.isRead ? "text-foreground" : "text-muted-foreground"}`}>
              {request.message}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">No message</span>
          )}
        </TableCell>

        {/* Date */}
        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
          {format(new Date(request.createdAt), "MMM d, yyyy")}
        </TableCell>

        {/* Expand chevron */}
        <TableCell className="pr-4">
          {request.message && (
            <span className="text-muted-foreground">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          )}
        </TableCell>
      </TableRow>

      {/* Expanded message + contact details */}
      {expanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/20 px-4 pb-4 pt-0">
            <div className="space-y-3 pt-1">
              {request.message && (
                <div className="border rounded-lg p-3.5 bg-card text-sm leading-relaxed">
                  {request.message}
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">Email: </span>
                  <a href={`mailto:${request.clientEmail}`} className="text-primary hover:underline">
                    {request.clientEmail}
                  </a>
                </span>
                {request.clientPhone && (
                  <span>
                    <span className="font-medium text-foreground">Phone: </span>
                    <a href={`tel:${request.clientPhone}`} className="text-primary hover:underline">
                      {request.clientPhone}
                    </a>
                  </span>
                )}
                <span>
                  <span className="font-medium text-foreground">Received: </span>
                  {format(new Date(request.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
