import { Router, type IRouter } from "express";
import healthRouter from "./health";
import teamsRouter from "./teams";
import playersRouter from "./players";
import matchesRouter from "./matches";

const router: IRouter = Router();

router.use(healthRouter);
router.use('/teams', teamsRouter);
router.use('/players', playersRouter);
router.use('/matches', matchesRouter);

export default router;
