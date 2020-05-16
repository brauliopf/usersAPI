import { Router } from "express";
const coachRouter = Router({ mergeParams: true });
import { coachController } from "../controllers"

// Coaches API
coachRouter.get("/", coachController.getCoaches);
coachRouter.get("/:id", coachController.getCoach);

export { coachRouter };