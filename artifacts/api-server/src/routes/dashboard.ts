import { Router, type IRouter } from "express";
import { db, ancestorsTable, notificationsTable } from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { getNextAnniversaryDate, getDaysUntil } from "../lib/panchangam";
import { GetCalendarEventsQueryParams } from "@workspace/api-zod";
const router: IRouter = Router();

async function autoCreateNotifications(userId: number) {
  const ancestors = await db.select().from(ancestorsTable).where(eq(ancestorsTable.userId, userId));
  for (const a of ancestors) {
    const anniversary = getNextAnniversaryDate(a.dateOfDeath);
    const days = getDaysUntil(anniversary);
    const triggerDays = [30, 15, 7, 1, 0];
    if (!triggerDays.includes(days)) continue;
    const existing = await db.select().from(notificationsTable)
      .where(and(
        eq(notificationsTable.userId, userId),
        eq(notificationsTable.ancestorId, a.id),
        gte(notificationsTable.createdAt, new Date(Date.now() - 12 * 60 * 60 * 1000))
      ));
    if (existing.length > 0) continue;
    let title = "";
    let message = "";
    if (days === 0) {
      title = `🪔 Today is ${a.fullName}'s Vardhanti`;
      message = `Today is the death anniversary of ${a.fullName} (${a.relationship}). Light a diya and offer prayers. 🙏`;
    } else if (days === 1) {
      title = `🔔 Tomorrow: ${a.fullName}'s Vardhanti`;
      message = `Tomorrow is ${a.fullName}'s Vardhanti. Prepare for the remembrance ceremony.`;
    } else if (days === 7) {
      title = `📅 7 days: ${a.fullName}'s Vardhanti`;
      message = `${a.fullName}'s Vardhanti is in 7 days. Plan the ritual and prasadam accordingly.`;
    } else if (days === 15) {
      title = `📅 15 days: ${a.fullName}'s Vardhanti`;
      message = `${a.fullName}'s Vardhanti is approaching in 15 days.`;
    } else if (days === 30) {
      title = `📅 1 month: ${a.fullName}'s Vardhanti`;
      message = `${a.fullName}'s Vardhanti is 1 month away. Start your preparations.`;
    }
    await db.insert(notificationsTable).values({
      userId,
      ancestorId: a.id,
      title,
      message,
      type: "reminder",
      isRead: false,
      createdAt: new Date(),
    });
  }
}

router.get("/dashboard/summary", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  await autoCreateNotifications(req.userId!);
  const ancestors = await db.select().from(ancestorsTable).where(eq(ancestorsTable.userId, req.userId!));
  const notifications = await db.select().from(notificationsTable)
    .where(and(eq(notificationsTable.userId, req.userId!), eq(notificationsTable.isRead, false)));
  let upcomingThisMonth = 0;
  let upcomingThisWeek = 0;
  let todayCount = 0;
  let maternalCount = 0;
  let paternalCount = 0;
  for (const a of ancestors) {
    const anniversary = getNextAnniversaryDate(a.dateOfDeath);
    const days = getDaysUntil(anniversary);
    if (days === 0) todayCount++;
    if (days >= 0 && days <= 7) upcomingThisWeek++;
    if (days >= 0 && days <= 30) upcomingThisMonth++;
    if (a.familySide === "Maternal") maternalCount++;
    if (a.familySide === "Paternal") paternalCount++;
  }
  res.json({
    totalAncestors: ancestors.length,
    upcomingThisMonth,
    upcomingThisWeek,
    todayCount,
    maternalCount,
    paternalCount,
    unreadNotifications: notifications.length,
  });
});

router.get("/dashboard/upcoming-events", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const ancestors = await db.select().from(ancestorsTable).where(eq(ancestorsTable.userId, req.userId!));
  const events = ancestors
    .map(a => {
      const anniversary = getNextAnniversaryDate(a.dateOfDeath);
      const daysUntil = getDaysUntil(anniversary);
      return {
        ancestorId: a.id,
        ancestorName: a.fullName,
        relationship: a.relationship,
        photoUrl: a.photoUrl ?? null,
        anniversaryDate: anniversary.toISOString().split("T")[0],
        daysUntil,
        tithi: a.tithi ?? null,
        nakshatram: a.nakshatram ?? null,
      };
    })
    .filter(e => e.daysUntil >= 0 && e.daysUntil <= 90)
    .sort((a, b) => a.daysUntil - b.daysUntil);
  res.json(events);
});

router.get("/dashboard/calendar", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = GetCalendarEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { year, month } = parsed.data;
  const ancestors = await db.select().from(ancestorsTable).where(eq(ancestorsTable.userId, req.userId!));
  const events: Array<{
    date: string;
    ancestorId: number;
    ancestorName: string;
    relationship: string;
    type: "anniversary" | "reminder";
  }> = [];
  for (const a of ancestors) {
    const death = new Date(a.dateOfDeath);
    const anniversaryDate = new Date(year, month - 1, death.getDate());
    if (anniversaryDate.getMonth() === month - 1) {
      events.push({
        date: anniversaryDate.toISOString().split("T")[0],
        ancestorId: a.id,
        ancestorName: a.fullName,
        relationship: a.relationship,
        type: "anniversary",
      });
      const reminderDate = new Date(anniversaryDate);
      reminderDate.setDate(reminderDate.getDate() - a.reminderDaysBefore);
      if (reminderDate.getMonth() === month - 1) {
        events.push({
          date: reminderDate.toISOString().split("T")[0],
          ancestorId: a.id,
          ancestorName: a.fullName,
          relationship: a.relationship,
          type: "reminder",
        });
      }
    }
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  res.json(events);
});

export default router;
