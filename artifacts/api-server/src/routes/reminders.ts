import { Router, type IRouter } from "express";
import { db, ancestorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { getNextAnniversaryDate, getDaysUntil } from "../lib/panchangam";
import { AcknowledgeReminderParams } from "@workspace/api-zod";

const router: IRouter = Router();

// Build a virtual reminder from an ancestor
function buildReminder(a: typeof ancestorsTable.$inferSelect, id: number) {
  const anniversary = getNextAnniversaryDate(a.dateOfDeath);
  const daysUntil = getDaysUntil(anniversary);
  const reminderDate = new Date(anniversary);
  reminderDate.setDate(reminderDate.getDate() - a.reminderDaysBefore);

  let message = `Your ancestor ${a.fullName} garu Vardhanti is on ${anniversary.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}.`;
  if (daysUntil === 0) {
    message = `Today is ${a.fullName} garu's Vardhanti. Offer prayers and perform the remembrance ritual.`;
  } else if (daysUntil === 1) {
    message = `Tomorrow is ${a.fullName} garu's Vardhanti. Prepare for the remembrance ceremony.`;
  } else {
    message = `${a.fullName} garu's Vardhanti is in ${daysUntil} days on ${anniversary.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}.`;
  }

  if (a.tithi) {
    message += ` (${a.tithi} Tithi)`;
  }

  return {
    id,
    userId: a.userId,
    ancestorId: a.id,
    ancestorName: a.fullName,
    relationship: a.relationship,
    reminderDate: reminderDate.toISOString().split("T")[0],
    anniversaryDate: anniversary.toISOString().split("T")[0],
    daysUntil,
    type: "english" as const,
    message,
    isAcknowledged: false,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/reminders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const upcoming = req.query.upcoming;
  const ancestors = await db.select().from(ancestorsTable).where(eq(ancestorsTable.userId, req.userId!));

  let reminders = ancestors.map((a, i) => buildReminder(a, i + 1));

  if (upcoming === "true") {
    reminders = reminders.filter(r => r.daysUntil >= 0 && r.daysUntil <= 90);
  }

  reminders.sort((a, b) => a.daysUntil - b.daysUntil);
  res.json(reminders);
});

router.get("/reminders/today", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const ancestors = await db.select().from(ancestorsTable).where(eq(ancestorsTable.userId, req.userId!));
  const reminders = ancestors
    .map((a, i) => buildReminder(a, i + 1))
    .filter(r => r.daysUntil <= r.id && r.daysUntil >= 0 && r.daysUntil <= 1);

  res.json(reminders);
});

router.post("/reminders/:id/acknowledge", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = AcknowledgeReminderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const ancestors = await db.select().from(ancestorsTable).where(eq(ancestorsTable.userId, req.userId!));
  const ancestor = ancestors[params.data.id - 1];

  if (!ancestor) {
    res.status(404).json({ error: "Reminder not found" });
    return;
  }

  const reminder = buildReminder(ancestor, params.data.id);
  res.json({ ...reminder, isAcknowledged: true });
});

export default router;
