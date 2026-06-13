import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Plus, Trash2, ArrowLeft, ImageOff, GripVertical, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import type { ProjectImage, EngineerProject } from "@/types";

// ─── Data source — wired to /api/me/projects/:id ───────────────────────────────
function useProjectImages(projectId: number) {
  const [project, setProject] = useState<EngineerProject | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiClient.get(`/api/me/projects/${projectId}`),
      apiClient.get(`/api/me/projects/${projectId}/images`)
    ])
      .then(([projRes, imgRes]) => {
        const p = projRes.data;
        setProject({
          id: p.id,
          title: p.title,
          description: p.description ?? null,
          coverImageUrl: p.imageUrl ?? p.coverImageUrl ?? (p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : null),
          categoryId: p.categoryId,
          categoryName: p.categoryName ?? "",
          createdAt: p.createdAt,
        });
        const imgs = (imgRes.data ?? []).map((img: any) => ({
          id: img.id,
          url: img.imageUrl,
          displayOrder: img.displayOrder,
        })).sort((a: any, b: any) => a.displayOrder - b.displayOrder);
        setImages(imgs);
      })
      .catch((err) => {
        console.error("Failed to load project images", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
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

  // Local file state — file picked but not yet uploaded
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFilePreview, setNewFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: upload to Cloudinary and save returned URL
    setNewFile(file);
    setNewFilePreview(URL.createObjectURL(file));
    setNewUrl(""); // clear URL field when file chosen
  };

  // The resolved URL to use when adding — local preview wins over typed URL
  const resolvedNewUrl = newFilePreview ?? newUrl.trim();

  // Add image — wired to POST /api/me/projects/:id/images
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedNewUrl) return;
    setAddLoading(true);
    const order = parseInt(newOrder) || (images.length + 1);
    try {
      const res = await apiClient.post(`/api/me/projects/${projectId}/images`, [
        { imageUrl: resolvedNewUrl, displayOrder: order }
      ]);
      const added = (res.data ?? []).map((img: any) => ({
        id: img.id,
        url: img.imageUrl,
        displayOrder: img.displayOrder
      }));
      setImages((prev) =>
        [...prev, ...added].sort((a, b) => a.displayOrder - b.displayOrder)
      );
      setNewUrl("");
      setNewOrder("");
      setNewFile(null);
      setNewFilePreview(null);
      toast({ title: "Image added" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to add image",
        description: err.response?.data?.message || "Something went wrong."
      });
    } finally {
      setAddLoading(false);
    }
  };

  // Save display order edit — wired to PUT /api/me/projects/:id/images/:imageId/order
  const commitOrderEdit = async (imageId: number) => {
    const parsed = parseInt(editingOrderValue);
    if (isNaN(parsed) || parsed < 1) { setEditingOrderId(null); return; }
    try {
      await apiClient.put(`/api/me/projects/${projectId}/images/${imageId}/order?displayOrder=${parsed}`);
      setImages((prev) =>
        prev
          .map((img) => (img.id === imageId ? { ...img, displayOrder: parsed } : img))
          .sort((a, b) => a.displayOrder - b.displayOrder)
      );
      setEditingOrderId(null);
      toast({ title: "Display order updated" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to update order",
        description: err.response?.data?.message || "Something went wrong."
      });
    }
  };

  // Delete image — wired to DELETE /api/me/projects/:id/images/:imageId
  const handleDelete = async (imageId: number) => {
    try {
      await apiClient.delete(`/api/me/projects/${projectId}/images/${imageId}`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast({ title: "Image removed", variant: "destructive" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete image",
        description: err.response?.data?.message || "Something went wrong."
      });
    }
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

            {/* File upload drop zone */}
            <div className="space-y-1.5">
              <Label>Upload File</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {newFilePreview ? (
                  <img
                    src={newFilePreview}
                    alt="Preview"
                    className="w-full rounded-md aspect-video object-cover"
                  />
                ) : (
                  <>
                    <Upload className="h-7 w-7 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground text-center">
                      Click to choose a photo
                      <br />
                      <span className="text-muted-foreground/60">JPG, PNG or WebP</span>
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {newFilePreview && (
                <p className="text-xs text-emerald-600">
                  ✓ Photo selected — will be uploaded on save
                </p>
              )}
            </div>

            {/* Fallback URL input */}
            <div className="space-y-1.5">
              <Label htmlFor="img-url" className="text-xs text-muted-foreground">
                Or paste image URL directly
              </Label>
              <Input
                id="img-url"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  setNewFile(null);
                  setNewFilePreview(null);
                }}
                placeholder="https://..."
                type="url"
                className="h-8 text-xs"
              />
              {newUrl && !newFilePreview && (
                <img
                  src={newUrl}
                  alt="Preview"
                  className="rounded-lg aspect-video object-cover w-full border"
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

            <Button type="submit" className="w-full" disabled={addLoading || !resolvedNewUrl}>
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
