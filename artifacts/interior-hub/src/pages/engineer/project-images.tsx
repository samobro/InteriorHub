import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Plus, Trash2, ArrowLeft, ImageOff, GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { mockMyProjects, mockMyProjectImages } from "@/data/mock";
import type { ProjectImage, EngineerProject } from "@/types";

// ─── Data source (replace with real API calls) ───────────────────────────────
function useProjectImages(projectId: number) {
  const [project, setProject] = useState<EngineerProject | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => {
      const found = mockMyProjects.find((p) => p.id === projectId) ?? null;
      setProject(found);
      const imgs = (mockMyProjectImages[projectId] ?? []).slice().sort(
        (a, b) => a.displayOrder - b.displayOrder,
      );
      setImages(imgs);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, [projectId]);

  return { project, images, setImages, isLoading };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectImages() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id ?? "0");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { project, images, setImages, isLoading } = useProjectImages(projectId);

  // Add image form state
  const [newUrl, setNewUrl] = useState("");
  const [newOrder, setNewOrder] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Track which image's order is being edited inline
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editingOrderValue, setEditingOrderValue] = useState("");

  // Add image — wire to POST /api/engineer/projects/:id/images
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setAddLoading(true);
    await new Promise((r) => setTimeout(r, 500)); // TODO: replace with API call
    const order = parseInt(newOrder) || (images.length + 1);
    const newImage: ProjectImage = { id: Date.now(), url: newUrl.trim(), displayOrder: order };
    setImages((prev) =>
      [...prev, newImage].sort((a, b) => a.displayOrder - b.displayOrder),
    );
    setNewUrl("");
    setNewOrder("");
    setAddLoading(false);
    toast({ title: "Image added" });
  };

  // Save display order edit — wire to PATCH /api/engineer/projects/:id/images/:imageId
  const commitOrderEdit = async (imageId: number) => {
    const parsed = parseInt(editingOrderValue);
    if (isNaN(parsed) || parsed < 1) { setEditingOrderId(null); return; }
    await new Promise((r) => setTimeout(r, 200)); // TODO: replace with API call
    setImages((prev) =>
      prev
        .map((img) => (img.id === imageId ? { ...img, displayOrder: parsed } : img))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    );
    setEditingOrderId(null);
    toast({ title: "Display order updated" });
  };

  // Delete image — wire to DELETE /api/engineer/projects/:id/images/:imageId
  const handleDelete = async (imageId: number) => {
    await new Promise((r) => setTimeout(r, 300)); // TODO: replace with API call
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    toast({ title: "Image removed", variant: "destructive" });
  };

  if (isLoading) return <ImagesSkeleton />;

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/engineer/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/engineer/projects")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Project Images</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Managing images for <span className="font-medium text-foreground">{project.title}</span>
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Image gallery — left 2/3 ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Current Images ({images.length})
          </h2>

          {images.length === 0 ? (
            <EmptyState
              icon={ImageOff}
              title="No images yet"
              description="Add the first image to this project using the form on the right."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {images.map((img) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  isEditingOrder={editingOrderId === img.id}
                  editingOrderValue={editingOrderValue}
                  onStartEditOrder={() => {
                    setEditingOrderId(img.id);
                    setEditingOrderValue(String(img.displayOrder));
                  }}
                  onOrderChange={(v) => setEditingOrderValue(v)}
                  onCommitOrder={() => commitOrderEdit(img.id)}
                  onCancelOrder={() => setEditingOrderId(null)}
                  onDelete={() => handleDelete(img.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Add image form — right 1/3 ─────────────────────────────── */}
        <div>
          <form
            onSubmit={handleAdd}
            className="border rounded-xl bg-card p-5 space-y-4 shadow-sm sticky top-4"
          >
            <h2 className="text-sm font-semibold">Add Image</h2>

            <div className="space-y-1.5">
              <Label htmlFor="img-url">Image URL</Label>
              <Input
                id="img-url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                required
              />
              {newUrl && (
                <img
                  src={newUrl}
                  alt="Preview"
                  className="mt-1.5 rounded-lg aspect-video object-cover w-full border"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="img-order">Display Order</Label>
              <Input
                id="img-order"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
                placeholder={`${images.length + 1} (auto)`}
                type="number"
                min={1}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first. Leave blank to append.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={addLoading || !newUrl.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              {addLoading ? "Adding..." : "Add Image"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Image Card ───────────────────────────────────────────────────────────────

function ImageCard({
  image,
  isEditingOrder,
  editingOrderValue,
  onStartEditOrder,
  onOrderChange,
  onCommitOrder,
  onCancelOrder,
  onDelete,
}: {
  image: ProjectImage;
  isEditingOrder: boolean;
  editingOrderValue: string;
  onStartEditOrder: () => void;
  onOrderChange: (v: string) => void;
  onCommitOrder: () => void;
  onCancelOrder: () => void;
  onDelete: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
      {/* Image */}
      <div className="aspect-video bg-muted relative">
        {!imgError ? (
          <img
            src={image.url}
            alt={`Display order ${image.displayOrder}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 flex items-center justify-between gap-2">
        {/* Display order */}
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          {isEditingOrder ? (
            <div className="flex items-center gap-1.5 flex-1">
              <Input
                className="h-7 w-16 text-xs px-2"
                value={editingOrderValue}
                onChange={(e) => onOrderChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); onCommitOrder(); }
                  if (e.key === "Escape") onCancelOrder();
                }}
                type="number"
                min={1}
                autoFocus
              />
              <Button size="sm" className="h-7 w-7 p-0" onClick={onCommitOrder} title="Save">
                <Save className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <button
              onClick={onStartEditOrder}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Click to edit display order"
            >
              Order: <span className="font-semibold text-foreground">{image.displayOrder}</span>
            </button>
          )}
        </div>

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 shrink-0"
          onClick={onDelete}
          title="Remove image"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function ImagesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-3"><Skeleton className="h-7 w-full" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
