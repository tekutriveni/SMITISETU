import { Router, type IRouter } from "express";
import { TITHIS, NAKSHATRAMS, MASAMS, getPanchangamForDate } from "../lib/panchangam";
import { GetPanchangamForDateQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/panchangam/today", async (_req, res): Promise<void> => {
  const today = new Date();
  const data = getPanchangamForDate(today);
  res.json(data);
});

router.get("/panchangam/date", async (req, res): Promise<void> => {
  const parsed = GetPanchangamForDateQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid date parameter" });
    return;
  }

  const date = new Date(parsed.data.date);
  if (isNaN(date.getTime())) {
    res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    return;
  }

  const data = getPanchangamForDate(date);
  res.json(data);
});

router.get("/panchangam/tithis", async (_req, res): Promise<void> => {
  res.json(TITHIS);
});

router.get("/panchangam/nakshatrams", async (_req, res): Promise<void> => {
  res.json(NAKSHATRAMS);
});

router.get("/panchangam/masams", async (_req, res): Promise<void> => {
  res.json(MASAMS);
});

export default router;
