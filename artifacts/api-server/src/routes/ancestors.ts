import { Router, type IRouter } from "express";
import { db, ancestorsTable } from "@workspace/db";
import { eq, and, ilike } from "drizzle-orm";
import { CreateAncestorBody, UpdateAncestorBody, GetAncestorParams, UpdateAncestorParams, DeleteAncestorParams } from "@workspace/api-zod";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { getNextAnniversaryDate, getDaysUntil } from "../lib/panchangam";

const router: IRouter = Router();

function formatAncestor(a: typeof ancestorsTable.$inferSelect) {
  const anniversary = getNextAnniversaryDate(a.dateOfDeath);
  const daysUntilNext = getDaysUntil(anniversary);
  return {
    id: a.id,
    userId: a.userId,
    fullName: a.fullName,
    relationship: a.relationship,
    gender: a.gender,
    photoUrl: a.photoUrl ?? null,
    dateOfBirth: a.dateOfBirth ?? null,
    dateOfDeath: a.dateOfDeath,
    placeOfDeath: a.placeOfDeath ?? null,
    tithi: a.tithi ?? null,
    nakshatram: a.nakshatram ?? null,
    masam: a.masam ?? null,
    paksham: a.paksham ?? null,
    samvatsaram: a.samvatsaram ?? null,
    teluguYearName: a.teluguYearName ?? null,
    timeOfDeath: a.timeOfDeath ?? null,
    familySide: a.familySide ?? null,
    gotram: a.gotram ?? null,
    reminderDaysBefore: a.reminderDaysBefore,
    ritualNotes: a.ritualNotes ?? null,
    traditions: a.traditions ?? null,
    favoriteMemories: a.favoriteMemories ?? null,
    prasadamDetails: a.prasadamDetails ?? null,
    daysUntilNext,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/ancestors", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const familySide = req.query.familySide as string | undefined;
  const search = req.query.search as string | undefined;

  let conditions = [eq(ancestorsTable.userId, req.userId!)];

  if (familySide && familySide !== "null") {
    conditions.push(eq(ancestorsTable.familySide, familySide));
  }

  let rows = await db.select().from(ancestorsTable).where(and(...conditions));

  if (search) {
    const lower = search.toLowerCase();
    rows = rows.filter(a =>
      a.fullName.toLowerCase().includes(lower) ||
      a.relationship.toLowerCase().includes(lower)
    );
  }

  res.json(rows.map(formatAncestor));
});

router.post("/ancestors", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateAncestorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ancestor] = await db.insert(ancestorsTable).values({
    ...parsed.data,
    userId: req.userId!,
    paksham: parsed.data.paksham ?? null,
    familySide: parsed.data.familySide ?? null,
  }).returning();

  res.status(201).json(formatAncestor(ancestor));
});

router.get("/ancestors/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetAncestorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [ancestor] = await db.select().from(ancestorsTable)
    .where(and(eq(ancestorsTable.id, params.data.id), eq(ancestorsTable.userId, req.userId!)));

  if (!ancestor) {
    res.status(404).json({ error: "Ancestor not found" });
    return;
  }

  res.json(formatAncestor(ancestor));
});

router.patch("/ancestors/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateAncestorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateAncestorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Partial<typeof ancestorsTable.$inferInsert> = {};
  const d = parsed.data;
  if (d.fullName != null) updates.fullName = d.fullName;
  if (d.relationship != null) updates.relationship = d.relationship;
  if (d.gender != null) updates.gender = d.gender;
  if (d.photoUrl !== undefined) updates.photoUrl = d.photoUrl;
  if (d.dateOfBirth !== undefined) updates.dateOfBirth = d.dateOfBirth;
  if (d.dateOfDeath != null) updates.dateOfDeath = d.dateOfDeath;
  if (d.placeOfDeath !== undefined) updates.placeOfDeath = d.placeOfDeath;
  if (d.tithi !== undefined) updates.tithi = d.tithi;
  if (d.nakshatram !== undefined) updates.nakshatram = d.nakshatram;
  if (d.masam !== undefined) updates.masam = d.masam;
  if (d.paksham !== undefined) updates.paksham = d.paksham;
  if (d.samvatsaram !== undefined) updates.samvatsaram = d.samvatsaram;
  if (d.teluguYearName !== undefined) updates.teluguYearName = d.teluguYearName;
  if (d.timeOfDeath !== undefined) updates.timeOfDeath = d.timeOfDeath;
  if (d.familySide !== undefined) updates.familySide = d.familySide;
  if (d.gotram !== undefined) updates.gotram = d.gotram;
  if (d.reminderDaysBefore != null) updates.reminderDaysBefore = d.reminderDaysBefore;
  if (d.ritualNotes !== undefined) updates.ritualNotes = d.ritualNotes;
  if (d.traditions !== undefined) updates.traditions = d.traditions;
  if (d.favoriteMemories !== undefined) updates.favoriteMemories = d.favoriteMemories;
  if (d.prasadamDetails !== undefined) updates.prasadamDetails = d.prasadamDetails;

  const [ancestor] = await db.update(ancestorsTable)
    .set(updates)
    .where(and(eq(ancestorsTable.id, params.data.id), eq(ancestorsTable.userId, req.userId!)))
    .returning();

  if (!ancestor) {
    res.status(404).json({ error: "Ancestor not found" });
    return;
  }

  res.json(formatAncestor(ancestor));
});

router.delete("/ancestors/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteAncestorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db.delete(ancestorsTable)
    .where(and(eq(ancestorsTable.id, params.data.id), eq(ancestorsTable.userId, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Ancestor not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
