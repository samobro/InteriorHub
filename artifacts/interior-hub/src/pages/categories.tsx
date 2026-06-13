import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Folders, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { mockCategories } from "@/data/mock";
import type { Category } from "@/types";

// ─── Data source (replace with real API calls) ───────────────────────────────
function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setData(mockCategories); setIsLoading(false); }, 500);
    return () => clearTimeout(t);
  }, []);
  return { data, setData, isLoading };
}
// ─────────────────────────────────────────────────────────────────────────────

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function Categories() {
  const { data: categories, setData: setCategories, isLoading } = useCategories();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Add form state
  const [addName, setAddName] = useState("");
  const [addSlug, setAddSlug] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  // Auto-generate slug when name changes (add form)
  const handleAddNameChange = (v: string) => {
    setAddName(v);
    setAddSlug(slugify(v));
  };

  // Add category submit — wire to POST /api/categories
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setAddLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // TODO: replace with API call
    const newCat: Category = {
      id: Date.now(),
      name: addName.trim(),
      slug: addSlug || slugify(addName),
      projectsCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
    setAddName(""); setAddSlug("");
    setAddOpen(false);
    setAddLoading(false);
  };

  // Open edit modal
  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
  };

  // Edit submit — wire to PATCH /api/categories/:id
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editName.trim()) return;
    setEditLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // TODO: replace with API call
    setCategories((prev) =>
      prev.map((c) => c.id === editTarget.id ? { ...c, name: editName.trim(), slug: editSlug || slugify(editName) } : c)
    );
    setEditTarget(null);
    setEditLoading(false);
  };

  // Delete — wire to DELETE /api/categories/:id
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // TODO: replace with API call
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleteLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage project categories available on the platform.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="pl-4">Category Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Linked Projects</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4"><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="pr-4"><div className="flex gap-2 justify-end"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={Folders}
                    title="No categories yet"
                    description="Add your first category to start organizing projects."
                    action={
                      <Button size="sm" onClick={() => setAddOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => {
                const canDelete = cat.projectsCount === 0;
                return (
                  <TableRow key={cat.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-4 font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{cat.slug}</code>
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">{cat.projectsCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(cat.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(cat)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {canDelete ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(cat)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md cursor-not-allowed text-muted-foreground/40">
                                <Trash2 className="h-3.5 w-3.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <div className="flex items-center gap-1.5 text-xs">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                Cannot delete — {cat.projectsCount} project{cat.projectsCount !== 1 ? "s" : ""} linked
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Category Modal */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!addLoading) { setAddOpen(o); if (!o) { setAddName(""); setAddSlug(""); } } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} id="add-category-form" className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Category Name</Label>
              <Input
                id="add-name"
                placeholder="e.g. Residential"
                value={addName}
                onChange={(e) => handleAddNameChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-slug">Slug</Label>
              <Input
                id="add-slug"
                placeholder="auto-generated"
                value={addSlug}
                onChange={(e) => setAddSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Auto-generated from the name. You can edit it.</p>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addLoading}>Cancel</Button>
            <Button type="submit" form="add-category-form" disabled={addLoading || !addName.trim()}>
              {addLoading ? "Adding..." : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!editLoading && !o) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} id="edit-category-form" className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editLoading}>Cancel</Button>
            <Button type="submit" form="edit-category-form" disabled={editLoading || !editName.trim()}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!deleteLoading && !o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
