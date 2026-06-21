import { Router, type IRouter } from "express";
import healthRouter from "./health";
import loansRouter from "./loans";
import creditCardsRouter from "./credit-cards";
import paymentsRouter from "./payments";
import dashboardRouter from "./dashboard";
import extractLoanRouter from "./extract-loan";
import extractFinancialsRouter from "./extract-financials";
import gmailRouter from "./gmail";
import profileRouter from "./profile";
import settingsRouter from "./settings";
import feedbackRouter from "./feedback";
import siteRouter from "./site";

const router: IRouter = Router();

router.use(healthRouter);
router.use(siteRouter);
router.use("/loans", loansRouter);
router.use("/credit-cards", creditCardsRouter);
router.use("/loans/:id/payments", paymentsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/extract-loan", extractLoanRouter);
router.use("/extract-financials", extractFinancialsRouter);
router.use("/gmail", gmailRouter);
router.use("/profile", profileRouter);
router.use("/settings", settingsRouter);
router.use("/feedback", feedbackRouter);

export default router;
