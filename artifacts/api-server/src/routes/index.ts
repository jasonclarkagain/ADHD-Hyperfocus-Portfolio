import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import skillsRouter from "./skills";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(skillsRouter);
router.use(contactRouter);

export default router;
