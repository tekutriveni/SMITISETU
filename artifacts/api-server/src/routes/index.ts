import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import ancestorsRouter from "./ancestors";
import remindersRouter from "./reminders";
import panchangamRouter from "./panchangam";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import aiRouter from "./ai";
import geminiRouter from "./gemini";
import pushRouter from "./push";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(ancestorsRouter);
router.use(remindersRouter);
router.use(panchangamRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(aiRouter);
router.use(geminiRouter);
router.use(pushRouter);

export default router;
