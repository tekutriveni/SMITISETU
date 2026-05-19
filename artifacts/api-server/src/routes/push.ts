import { Router, type IRouter } from "express";
import webpush from "web-push";
import cron from "node-cron";
import { db, pushSubscriptionsTable, ancestorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Save push subscription
router.post("/push/subscribe", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: "Invalid subscription" });
    return;
  }
  try {
    await db.insert(pushSubscriptionsTable).values({
      userId: req.userId!,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    }).onConflictDoUpdate({
      target: pushSubscriptionsTable.endpoint,
      set: { p256dh: keys.p256dh, auth: keys.auth },
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

// Delete subscription
router.post("/push/unsubscribe", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { endpoint } = req.body;
  await db.delete(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.endpoint, endpoint));
  res.json({ success: true });
});

// VAPID public key
router.get("/push/vapid-key", (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Send push to a user
async function sendPushToUser(userId: number, title: string, body: string) {
  const subs = await db.select().from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.userId, userId));
  const payload = JSON.stringify({ title, body, icon: "/favicon.ico" });
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
    } catch (e: any) {
      if (e.statusCode === 410) {
        await db.delete(pushSubscriptionsTable)
          .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
      }
    }
  }
}

// Daily cron job — runs at 8 AM IST (2:30 AM UTC)
cron.schedule("30 2 * * *", async () => {
  console.log("[Cron] Checking ancestor anniversaries...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ancestors = await db.select().from(ancestorsTable);
  for (const ancestor of ancestors) {
    if (!ancestor.dateOfDeath) continue;
    const death = new Date(ancestor.dateOfDeath);
    const thisYear = new Date(today.getFullYear(), death.getMonth(), death.getDate());
    if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1);

    const diffMs = thisYear.getTime() - today.getTime();
    const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const REMIND_DAYS = [30, 15, 7, 1, 0];
    if (!REMIND_DAYS.includes(daysUntil)) continue;

    let title = "";
    let body = "";
    const date = thisYear.toLocaleDateString("en-IN", { day: "numeric", month: "long" });

    if (daysUntil === 0) {
      title = `🙏 Today is ${ancestor.fullName} garu's Vardhanti`;
      body = `Offer prayers and perform the remembrance ritual today.`;
    } else if (daysUntil === 1) {
      title = `🔔 Tomorrow — ${ancestor.fullName} garu's Vardhanti`;
      body = `Prepare for the remembrance ceremony tomorrow.`;
    } else {
      title = `🕯️ ${ancestor.fullName} garu's Vardhanti in ${daysUntil} days`;
      body = `Plan ahead for the remembrance on ${date}.`;
    }
    if (ancestor.tithi) body += ` (${ancestor.tithi} Tithi)`;

    await sendPushToUser(ancestor.userId, title, body);
  }
});

export default router;
export { sendPushToUser };
