import { Router, type IRouter } from "express";
import { db, contactRequestsTable, engineersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListContactRequestsQueryParams,
  ListContactRequestsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/contact-requests", async (req, res): Promise<void> => {
  const parsed = ListContactRequestsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { engineerId } = parsed.data;

  const conditions = engineerId ? [eq(contactRequestsTable.engineerId, engineerId)] : [];

  const requests = await db
    .select({
      id: contactRequestsTable.id,
      engineerId: contactRequestsTable.engineerId,
      engineerName: engineersTable.fullName,
      engineerEmail: engineersTable.email,
      clientName: contactRequestsTable.clientName,
      clientEmail: contactRequestsTable.clientEmail,
      message: contactRequestsTable.message,
      createdAt: contactRequestsTable.createdAt,
    })
    .from(contactRequestsTable)
    .leftJoin(engineersTable, eq(contactRequestsTable.engineerId, engineersTable.id))
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(contactRequestsTable.createdAt);

  const mapped = requests.reverse().map((r) => ({
    id: r.id,
    engineerId: r.engineerId,
    engineerName: r.engineerName ?? "",
    engineerEmail: r.engineerEmail ?? "",
    clientName: r.clientName,
    clientEmail: r.clientEmail,
    message: r.message ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(ListContactRequestsResponse.parse(mapped));
});

export default router;
