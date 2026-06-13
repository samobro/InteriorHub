import { Router, type IRouter } from "express";
import { db, engineersTable, categoriesTable, projectsTable, contactRequestsTable, activityTable } from "@workspace/db";
import { count, eq } from "drizzle-orm";
import {
  GetDashboardStatsResponse,
  GetDashboardActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [totalEngineers] = await db.select({ count: count() }).from(engineersTable);
  const [pendingApprovals] = await db.select({ count: count() }).from(engineersTable).where(eq(engineersTable.status, "pending"));
  const [approvedEngineers] = await db.select({ count: count() }).from(engineersTable).where(eq(engineersTable.status, "approved"));
  const [disabledEngineers] = await db.select({ count: count() }).from(engineersTable).where(eq(engineersTable.status, "disabled"));
  const [totalProjects] = await db.select({ count: count() }).from(projectsTable);
  const [totalCategories] = await db.select({ count: count() }).from(categoriesTable);

  const stats = {
    totalEngineers: totalEngineers.count,
    pendingApprovals: pendingApprovals.count,
    approvedEngineers: approvedEngineers.count,
    disabledEngineers: disabledEngineers.count,
    totalProjects: totalProjects.count,
    totalCategories: totalCategories.count,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const activity = await db
    .select()
    .from(activityTable)
    .orderBy(activityTable.createdAt)
    .limit(20);

  const mapped = activity.reverse().map((a) => ({
    id: a.id,
    type: a.type,
    message: a.message,
    timestamp: a.createdAt.toISOString(),
    relatedId: a.relatedId ?? null,
    relatedName: a.relatedName ?? null,
  }));

  res.json(GetDashboardActivityResponse.parse(mapped));
});

export default router;
