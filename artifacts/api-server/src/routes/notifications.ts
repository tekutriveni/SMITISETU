import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { MarkNotificationReadParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    userId: n.userId,
    ancestorId: n.ancestorId ?? null,
    ancestorName: null as string | null,
    title: n.title,
    message: n.message,
    type: n.type as "reminder" | "system" | "panchangam",
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  };
}

router.get("/notifications", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const notifications = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, req.userId!))
    .orderBy(notificationsTable.createdAt);

  res.json(notifications.map(formatNotification).reverse());
});

router.get("/notifications/unread-count", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const notifications = await db.select().from(notificationsTable)
    .where(and(eq(notificationsTable.userId, req.userId!), eq(notificationsTable.isRead, false)));

  res.json({ count: notifications.length });
});

router.post("/notifications/:id/read", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [notification] = await db.update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, params.data.id), eq(notificationsTable.userId, req.userId!)))
    .returning();

  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json(formatNotification(notification));
});

router.post("/notifications/mark-all-read", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, req.userId!));

  res.json({ message: "All notifications marked as read" });
});

export default router;
