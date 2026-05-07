import { Router, type IRouter } from "express";
import { db, ancestorsTable, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { getNextAnniversaryDate, getDaysUntil } from "../lib/panchangam";
import { GetCalendarEventsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req: AuthRequest, res): Promise<void> => {
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
