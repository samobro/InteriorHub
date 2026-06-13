import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, ImageIcon, ImageOff, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/pagination-bar";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { mockMyProjects, mockCategories } from "@/data/mock";
import type { EngineerProject } from "@/types";

const PAGE_SIZE = 6;

// ─── Data source (replace with real API calls) ───────────────────────────────
function useMyProjects() {
  const [data, setData] = useState<EngineerProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setData(mockMyProjects); setIsLoading(false); }, 500);
    return () => clearTimeout(t);
  }, []);
  return { data, setData, isLoading };
}
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectFormValues {
  title: string;
  description: string;
  categoryId: string;
  coverImageUrl: string;
}

const EMPTY_FORM: ProjectFormValues = { title: "", description: "", categoryId: "", coverImageUrl: "" };

export default function EngineerProjects() {
  const { data: projects, setData: setProjects, isLoading } = useMyProjects();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EngineerProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EngineerProject | null>(null);
  const [form, setForm] = useState<ProjectFormValues>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const totalCount = projects.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const pageData = useMemo(
    () => projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [projects, page],
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (project: EngineerProject) => {
    setEditTarget(project);
    setForm({
      title: project.title,
      description: project.description ?? "",
      categoryId: String(project.categoryId),
      coverImageUrl: project.coverImageUrl ?? "",
    });
    setModalOpen(true);
  };

  // Add / Edit submit — wire to POST or PATCH /api/engineer/projects/:id
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.categoryId) return;
    setFormLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // TODO: replace with API call

    const category = mockCategories.find((c) => c.id === parseInt(form.categoryId));
    if (editTarget) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editTarget.id
            ? {
                ...p,
                title: form.title.trim(),
                description: form.description.trim() || null,
                categoryId: parseInt(form.categoryId),
                categoryName: category?.name ?? p.categoryName,
                coverImageUrl: form.coverImageUrl.trim() || null,
              }
            : p,
        ),
      );
      toast({ title: "Project updated" });
    } else {
      const newProject: EngineerProject = {
        id: Date.now(),
        title: form.title.trim(),
        description: form.description.trim() || null,
        categoryId: parseInt(form.categoryId),
        categoryName: category?.name ?? "",
        coverImageUrl: form.coverImageUrl.trim() || null,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [newProject, ...prev]);
      toast({ title: "Project added" });
    }

    setFormLoading(false);
    setModalOpen(false);
  };

  // Delete — wire to DELETE /api/engineer/projects/:id
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await new Promise((r) => setTimeout(r, 500)); // TODO: replace with API call
    setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast({ title: "Project deleted", variant: "destructive" });
    setDeleteTarget(null);
    setDeleteLoading(false);
  };

  const setField = (field: keyof ProjectFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Showcase your portfolio — {totalCount} project{totalCount !== 1 ? "s" : ""} uploaded.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add New Project
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden shadow-sm">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : pageData.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title="You haven't added any projects yet"
          description="Showcase your work by adding your first interior design project."
          action={
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageData.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => openEdit(project)}
              onDelete={() => setDeleteTarget(project)}
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

      {/* Add / Edit modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={(o) => { if (!formLoading) setModalOpen(o); }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Project" : "Add New Project"}</DialogTitle>
          </DialogHeader>
          <form id="project-form" onSubmit={handleSubmit} className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="p-title">Project Title</Label>
              <Input
                id="p-title"
                value={form.title}
                onChange={setField("title")}
                placeholder="e.g. Old City Riad Revival"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-category">Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                required
              >
                <SelectTrigger id="p-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-cover">Cover Image URL</Label>
              <Input
                id="p-cover"
                value={form.coverImageUrl}
                onChange={setField("coverImageUrl")}
                placeholder="https://..."
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                You can add more images after creating the project.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                value={form.description}
                onChange={setField("description")}
                placeholder="Describe the project brief, your approach, and key design decisions..."
                rows={4}
                className="resize-none"
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="project-form"
              disabled={formLoading || !form.title.trim() || !form.categoryId}
            >
              {formLoading ? "Saving..." : editTarget ? "Save Changes" : "Add Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!deleteLoading && !o) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the project and all its images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project, onEdit, onDelete,
}: {
  project: EngineerProject;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Cover image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {project.coverImageUrl && !imgError ? (
          <img
            src={project.coverImageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
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

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">{project.title}</h3>
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-2">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(project.createdAt), "MMM d, yyyy")}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={onEdit}
          >
            <Pencil className="mr-1.5 h-3 w-3" /> Edit
          </Button>
          <Link href={`/engineer/projects/${project.id}/images`}>
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
              <ImageIcon className="mr-1.5 h-3 w-3" /> Images
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
