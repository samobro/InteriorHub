import { useState, useEffect, useMemo } from "react";
import { Mail, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { PaginationBar } from "@/components/pagination-bar";
import { mockContactRequests, mockEngineers } from "@/data/mock";
import type { ContactRequest } from "@/types";

const PAGE_SIZE = 8;

// ─── Data source (replace with real API call) ────────────────────────────────
function useContactRequests(engineerId: string, page: number) {
  const [isLoading, setIsLoading] = useState(true);

  const filtered = useMemo(() => {
    if (engineerId === "all") return [...mockContactRequests];
    return mockContactRequests.filter((r) => r.engineerId === parseInt(engineerId));
  }, [engineerId]);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [engineerId, page]);

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const data = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return { data, isLoading, totalCount, totalPages };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactRequests() {
  const [engineerFilter, setEngineerFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => { setPage(1); }, [engineerFilter]);

  const { data, isLoading, totalCount, totalPages } = useContactRequests(engineerFilter, page);

  // Unique engineers who have received requests
  const engineersWithRequests = useMemo(() => {
    const ids = new Set(mockContactRequests.map((r) => r.engineerId));
    return mockEngineers.filter((e) => ids.has(e.id));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Requests</h1>
        <p className="text-muted-foreground mt-1 text-sm">Overview of client contact requests sent to engineers.</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={engineerFilter} onValueChange={setEngineerFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All Engineers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Engineers</SelectItem>
            {engineersWithRequests.map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>{e.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isLoading && (
          <span className="text-xs text-muted-foreground">{totalCount} request{totalCount !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="pl-4">Client</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="pr-4 w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-44" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-40" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={Mail}
                    title="No contact requests"
                    description="Client requests sent to engineers will appear here."
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((req) => (
                <RequestRow
                  key={req.id}
                  request={req}
                  expanded={expandedId === req.id}
                  onToggle={() => setExpandedId(expandedId === req.id ? null : req.id)}
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

// ─── Request Row ──────────────────────────────────────────────────────────────

function RequestRow({
  request, expanded, onToggle,
}: {
  request: ContactRequest;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow
        className="hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <TableCell className="pl-4">
          <div className="font-medium text-sm">{request.clientName}</div>
          <div className="text-xs text-muted-foreground">{request.clientEmail}</div>
        </TableCell>
        <TableCell>
          <div className="text-sm">{request.engineerName}</div>
          <div className="text-xs text-muted-foreground">{request.engineerEmail}</div>
        </TableCell>
        <TableCell className="max-w-xs">
          {request.message ? (
            <span className="text-sm text-muted-foreground line-clamp-1">{request.message}</span>
          ) : (
            <span className="text-xs text-muted-foreground/60 italic">No message</span>
          )}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(request.createdAt), "MMM d, yyyy")}
        </TableCell>
        <TableCell className="pr-4">
          {request.message && (
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </TableCell>
      </TableRow>
      {expanded && request.message && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/20 pl-4 pr-4 pb-4 pt-0">
            <div className="border rounded-lg p-3 bg-card text-sm leading-relaxed">
              {request.message}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
