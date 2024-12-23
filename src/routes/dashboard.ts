import { Router } from "express";
import { adminOnly } from "../middlewares/auth";
import { getBarCharts, getDashboardStates, getLineCharts, getPieCharts } from "../controllers/dashboard";

const router = Router();

// states - /api/v1/dashboard/states
router.get("/states", adminOnly, getDashboardStates);

// pie - /api/v1/dashboard/pie
router.get("/pie", adminOnly, getPieCharts);

// bar - /api/v1/dashboard/bar
router.get("/bar", adminOnly, getBarCharts);

// line - /api/v1/dashboard/line
router.get("/line", adminOnly, getLineCharts);

export default router;
