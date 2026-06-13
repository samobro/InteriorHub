import { Router, type IRouter } from "express";
import { db, categoriesTable, projectsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import {
  CreateCategoryBody,
  UpdateCategoryParams,
  UpdateCategoryBody,
  DeleteCategoryParams,
  ListCategoriesResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);

  const projectCounts = await db
    .select({ categoryId: projectsTable.categoryId, count: count() })
    .from(projectsTable)
    .groupBy(projectsTable.categoryId);

  const projectCountMap = new Map(projectCounts.map((p) => [p.categoryId, p.count]));

  const mapped = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    projectsCount: projectCountMap.get(c.id) ?? 0,
    createdAt: c.createdAt.toISOString(),
  }));

  res.json(ListCategoriesResponse.parse(mapped));
});

router.post("/categories", async (req, res): Promise<void> => {
  const body = CreateCategoryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [category] = await db.insert(categoriesTable).values(body.data).returning();

  res.status(201).json({
    id: category.id,
    name: category.name,
    slug: category.slug,
    projectsCount: 0,
    createdAt: category.createdAt.toISOString(),
  });
});

router.patch("/categories/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateCategoryParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateCategoryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [category] = await db
    .update(categoriesTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(categoriesTable.id, params.data.id))
    .returning();

  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const [{ count: projectsCount }] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.categoryId, category.id));

  res.json(UpdateCategoryResponse.parse({
    id: category.id,
    name: category.name,
    slug: category.slug,
    projectsCount,
    createdAt: category.createdAt.toISOString(),
  }));
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteCategoryParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [{ count: linkedProjects }] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.categoryId, params.data.id));

  if (linkedProjects > 0) {
    res.status(400).json({ error: "Cannot delete category with linked projects" });
    return;
  }

  const [deleted] = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  res.json(DeleteCategoryResponse.parse({ success: true }));
});

export default router;
