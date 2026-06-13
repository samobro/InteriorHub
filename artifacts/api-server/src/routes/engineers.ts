import { Router, type IRouter } from "express";
import { db, engineersTable, projectsTable, activityTable } from "@workspace/db";
import { eq, ilike, and, count, sql } from "drizzle-orm";
import {
  ListEngineersQueryParams,
  GetEngineerParams,
  UpdateEngineerStatusParams,
  UpdateEngineerStatusBody,
  ListEngineersResponse,
  GetEngineerResponse,
  UpdateEngineerStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/engineers", async (req, res): Promise<void> => {
  const parsed = ListEngineersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, city, status, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(
      sql`(${ilike(engineersTable.fullName, `%${search}%`)} OR ${ilike(engineersTable.email, `%${search}%`)})`
    );
  }
  if (city) {
    conditions.push(ilike(engineersTable.city, `%${city}%`));
  }
  if (status) {
    conditions.push(eq(engineersTable.status, status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const engineers = await db.select().from(engineersTable)
    .where(whereClause)
    .orderBy(engineersTable.createdAt)
    .limit(limit)
    .offset(offset);

  const [{ count: total }] = await db.select({ count: count() }).from(engineersTable).where(whereClause);

  const projectCounts = await db
    .select({ engineerId: projectsTable.engineerId, count: count() })
    .from(projectsTable)
    .groupBy(projectsTable.engineerId);

  const projectCountMap = new Map(projectCounts.map((p) => [p.engineerId, p.count]));

  const mapped = engineers.map((e) => ({
    id: e.id,
    fullName: e.fullName,
    city: e.city,
    email: e.email,
    phone: e.phone ?? null,
    bio: e.bio ?? null,
    profilePhoto: e.profilePhoto ?? null,
    status: e.status as "pending" | "approved" | "disabled",
    trialEndDate: e.trialEndDate ?? null,
    projectsCount: projectCountMap.get(e.id) ?? 0,
    createdAt: e.createdAt.toISOString(),
  }));

  const totalPages = Math.ceil(total / limit);

  res.json(ListEngineersResponse.parse({ engineers: mapped, total, page, totalPages }));
});

router.get("/engineers/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetEngineerParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [engineer] = await db.select().from(engineersTable).where(eq(engineersTable.id, params.data.id));
  if (!engineer) {
    res.status(404).json({ error: "Engineer not found" });
    return;
  }

  const [{ count: projectsCount }] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.engineerId, engineer.id));

  res.json(GetEngineerResponse.parse({
    id: engineer.id,
    fullName: engineer.fullName,
    city: engineer.city,
    email: engineer.email,
    phone: engineer.phone ?? null,
    bio: engineer.bio ?? null,
    profilePhoto: engineer.profilePhoto ?? null,
    status: engineer.status as "pending" | "approved" | "disabled",
    trialEndDate: engineer.trialEndDate ?? null,
    projectsCount,
    createdAt: engineer.createdAt.toISOString(),
  }));
});

router.patch("/engineers/:id/status", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateEngineerStatusParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateEngineerStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [engineer] = await db
    .update(engineersTable)
    .set({ status: body.data.status, updatedAt: new Date() })
    .where(eq(engineersTable.id, params.data.id))
    .returning();

  if (!engineer) {
    res.status(404).json({ error: "Engineer not found" });
    return;
  }

  const activityType = body.data.status === "approved"
    ? "engineer_approved"
    : body.data.status === "disabled"
    ? "engineer_disabled"
    : "engineer_signup";

  const activityMessage = body.data.status === "approved"
    ? `${engineer.fullName} was approved`
    : body.data.status === "disabled"
    ? `${engineer.fullName} was disabled`
    : `${engineer.fullName}'s status changed to pending`;

  await db.insert(activityTable).values({
    type: activityType,
    message: activityMessage,
    relatedId: engineer.id,
    relatedName: engineer.fullName,
  });

  const [{ count: projectsCount }] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.engineerId, engineer.id));

  res.json(UpdateEngineerStatusResponse.parse({
    id: engineer.id,
    fullName: engineer.fullName,
    city: engineer.city,
    email: engineer.email,
    phone: engineer.phone ?? null,
    bio: engineer.bio ?? null,
    profilePhoto: engineer.profilePhoto ?? null,
    status: engineer.status as "pending" | "approved" | "disabled",
    trialEndDate: engineer.trialEndDate ?? null,
    projectsCount,
    createdAt: engineer.createdAt.toISOString(),
  }));
});

export default router;
