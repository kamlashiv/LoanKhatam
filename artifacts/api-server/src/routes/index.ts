import { Router, type IRouter } from "express";
import healthRouter from "./health";
import loansRouter from "./loans";
import paymentsRouter from "./payments";
import dashboardRouter from "./dashboard";
import extractLoanRouter from "./extract-loan";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/loans", loansRouter);
router.use("/loans/:id/payments", paymentsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/extract-loan", extractLoanRouter);
router.use("/profile", profileRouter);

export default router;
