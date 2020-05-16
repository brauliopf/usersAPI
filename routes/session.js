import { Router } from "express";
const sessionRouter = Router({ mergeParams: true });
import { sessionController } from "../controllers"
import { authenticate } from '../middlewares/auth';

// Coaches API
sessionRouter.post("/", authenticate, sessionController.createSession);
sessionRouter.get("/", sessionController.getSessions);
sessionRouter.get("/:id", sessionController.getSession);
sessionRouter.put("/:id", authenticate, sessionController.updateSession);

export { sessionRouter };