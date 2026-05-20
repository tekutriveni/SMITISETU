import { Router, Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable, ancestorsTable, notificationsTable, messages } from "@workspace/db";
import { desc, count } from "drizzle-orm";

const router: Router = Router();

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "mannnsanvik@admin2026";
const ADMIN_TOKEN = "smritisetu_admin_secret_token_2024";

router.post("/admin/login", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (auth === `Bearer ${ADMIN_TOKEN}`) {
    next();
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
}

router.get("/admin/stats", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const [totalUsers] = await db.select({ count: count() }).from(usersTable);
  const [totalAncestors] = await db.select({ count: count() }).from(ancestorsTable);
  const [totalMessages] = await db.select({ count: count() }).from(messages);
  const [totalNotifications] = await db.select({ count: count() }).from(notificationsTable);
  const languageStats = await db
    .select({ language: usersTable.language, count: count() })
    .from(usersTable)
    .groupBy(usersTable.language);
  res.json({ totalUsers: totalUsers.count, totalAncestors: totalAncestors.count, totalMessages: totalMessages.count, totalNotifications: totalNotifications.count, languageStats });
});

router.get("/admin/users", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const result = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, language: usersTable.language, createdAt: usersTable.createdAt })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
  res.json(result);
});

router.get("/admin/ancestors", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const result = await db
    .select({ id: ancestorsTable.id, userId: ancestorsTable.userId, fullName: ancestorsTable.fullName, relationship: ancestorsTable.relationship, gender: ancestorsTable.gender, dateOfDeath: ancestorsTable.dateOfDeath, familySide: ancestorsTable.familySide, gotram: ancestorsTable.gotram, createdAt: ancestorsTable.createdAt })
    .from(ancestorsTable)
    .orderBy(desc(ancestorsTable.createdAt));
  res.json(result);
});

router.get("/admin/messages", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const result = await db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt))
    .limit(100);
  res.json(result);
});

export default router;
