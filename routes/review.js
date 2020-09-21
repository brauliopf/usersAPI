import { Router } from 'express';
const reviewRouter = Router({ mergeParams: true });
import { reviewController } from "../controllers";

reviewRouter.post("/leaveReview", reviewController.addReview)

export { reviewRouter };