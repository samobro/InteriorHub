import { useState, useEffect, useMemo } from "react";
import { ImageOff, Calendar, User, Tag, X } from "lucide-react";
import { format } from "date-fns";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/pagination-bar";
import { EmptyState } from "@/components/empty-state";
import { mockProjects, mockProjectDetails, mockCategories, mockEngineers } from "@/data/mock";
import type { Project, ProjectDetail } from "@/types";

const PAGE_SIZE = 8;

// ─── Data source (replace with real API calls) ───────────────────────────────
function useProjects(categoryId: string, engineerId: string, page: number) {
  const [isLoading, setIsLoading] = useState(true);

  const filtered = useMemo(() => {
    let list = mockProjects;
    if (categoryId !== "all") list = list.filter((p) => p.categoryId === parseInt(categoryId));
    if (engineerId !== "all") list = list.filter((p) => p.engineerId === parseInt(engineerId));
    return list;
  }, [categoryId, engineerId]);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [categoryId, engineerId, page]);

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const data = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return { data, isLoading, totalCount, totalPages };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Projects() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [engineerFilter, setEngineerFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => { setPage(1); }, [categoryFilter, engineerFilter]);

  const { data, isLoading, totalCount, totalPages } = useProjects(categoryFilter, engineerFilter, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-1 text-sm">Browse all projects uploaded by engineers. Read-only view.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {mockCategories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={engineerFilter} onValueChange={setEngineerFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All Engineers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Engineers</SelectItem>
            {mockEngineers.filter((e) => e.status === "approved").map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>{e.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(categoryFilter !== "all" || engineerFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-9 px-3"
            onClick={() => { setCategoryFilter("all"); setEngineerFilter("all"); }}
          >
            <X className="mr-1.5 h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          {totalCount} project{totalCount !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border bg-card shadow-sm">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title="No projects found"
          description="Try adjusting the filters to see more projects."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalCount > PAGE_SIZE && (
        <PaginationBar
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Project Detail Dialog */}
      <ProjectDetailDialog
        project={selectedProject}
        open={selectedProject !== null}
        onOpenChange={(o) => !o && setSelectedProject(null)}
      />
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      className="group rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-left w-full"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        {project.coverImageUrl && !imgError ? (
          <img
            src={project.coverImageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge className="text-xs bg-black/50 text-white border-none backdrop-blur-sm">
            {project.categoryName}
          </Badge>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{project.engineerName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{format(new Date(project.createdAt), "MMM d, yyyy")}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Project Detail Dialog ────────────────────────────────────────────────────

function ProjectDetailDialog({
  project, open, onOpenChange,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const detail: ProjectDetail | null = project ? (mockProjectDetails[project.id] ?? { ...project, description: null, images: project.coverImageUrl ? [project.coverImageUrl] : [], engineerEmail: "" }) : null;

  useEffect(() => { setImgIdx(0); }, [project]);

  if (!project || !detail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg pr-8">{detail.title}</DialogTitle>
        </DialogHeader>

        {/* Image carousel */}
        {detail.images.length > 0 && (
          <div className="space-y-2">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={detail.images[imgIdx]}
                alt={`${detail.title} — image ${imgIdx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
              />
            </div>
            {detail.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {detail.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-14 w-20 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className="flex items-center gap-1.5">
            <Tag className="h-3 w-3" /> {detail.categoryName}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5">
            <User className="h-3 w-3" /> {detail.engineerName}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> {format(new Date(detail.createdAt), "MMM d, yyyy")}
          </Badge>
        </div>

        {/* Description */}
        {detail.description && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Description</p>
            <p className="text-sm leading-relaxed">{detail.description}</p>
          </div>
        )}

        {/* Engineer info */}
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Engineer</p>
          <p className="text-sm font-medium">{detail.engineerName}</p>
          {detail.engineerEmail && (
            <p className="text-xs text-muted-foreground mt-0.5">{detail.engineerEmail}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
