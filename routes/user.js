import { Router } from "express";
const userRouter = Router({ mergeParams: true });
import { userController } from "../controllers"
import { wrapAsync } from "../middlewares/wrapAsync";
import { authenticate, authorize } from '../middlewares/auth'

// Users API
userRouter.post("/", wrapAsync(userController.createUser));
userRouter.post("/public-profiles", wrapAsync(userController.getUsersPublicProfile));
userRouter.post("/login", wrapAsync(userController.login));
userRouter.put("/:id", authenticate, wrapAsync(userController.updateUser));
userRouter.put("/:id/coachApplication", authenticate, authorize("admin"), wrapAsync(userController.replyCoachApplicant));
userRouter.post("/coach-apply", wrapAsync(userController.coachApplication));
userRouter.get("/coach-applicants", authenticate, authorize("admin"), wrapAsync(userController.coachApplicants));

export { userRouter };