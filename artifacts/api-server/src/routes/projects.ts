import { Router, type IRouter } from "express";
import { db, projectsTable, engineersTable, categoriesTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import {
  ListProjectsQueryParams,
  GetProjectParams,
  ListProjectsResponse,
  GetProjectResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects", async (req, res): Promise<void> => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { categoryId, engineerId, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (categoryId) conditions.push(eq(projectsTable.categoryId, categoryId));
  if (engineerId) conditions.push(eq(projectsTable.engineerId, engineerId));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const projects = await db
    .select({
      id: projectsTable.id,
      title: projectsTable.title,
      coverImage: projectsTable.coverImage,
      categoryId: projectsTable.categoryId,
      categoryName: categoriesTable.name,
      engineerId: projectsTable.engineerId,
      engineerName: engineersTable.fullName,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .leftJoin(categoriesTable, eq(projectsTable.categoryId, categoriesTable.id))
    .leftJoin(engineersTable, eq(projectsTable.engineerId, engineersTable.id))
    .where(whereClause)
    .orderBy(projectsTable.createdAt)
    .limit(limit)
    .offset(offset);

  const [{ count: total }] = await db.select({ count: count() }).from(projectsTable).where(whereClause);
  const totalPages = Math.ceil(total / limit);

  const mapped = projects.map((p) => ({
    id: p.id,
    title: p.title,
    coverImage: p.coverImage ?? null,
    categoryId: p.categoryId,
    categoryName: p.categoryName ?? "",
    engineerId: p.engineerId,
    engineerName: p.engineerName ?? "",
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(ListProjectsResponse.parse({ projects: mapped.reverse(), total, page, totalPages }));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProjectParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .select({
      id: projectsTable.id,
      title: projectsTable.title,
      description: projectsTable.description,
      coverImage: projectsTable.coverImage,
      images: projectsTable.images,
      categoryId: projectsTable.categoryId,
      categoryName: categoriesTable.name,
      engineerId: projectsTable.engineerId,
      engineerName: engineersTable.fullName,
      engineerEmail: engineersTable.email,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .leftJoin(categoriesTable, eq(projectsTable.categoryId, categoriesTable.id))
    .leftJoin(engineersTable, eq(projectsTable.engineerId, engineersTable.id))
    .where(eq(projectsTable.id, params.data.id));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(GetProjectResponse.parse({
    id: project.id,
    title: project.title,
    description: project.description ?? null,
    coverImage: project.coverImage ?? null,
    images: project.images ?? [],
    categoryId: project.categoryId,
    categoryName: project.categoryName ?? "",
    engineerId: project.engineerId,
    engineerName: project.engineerName ?? "",
    engineerEmail: project.engineerEmail ?? "",
    createdAt: project.createdAt.toISOString(),
  }));
});

export default router;
