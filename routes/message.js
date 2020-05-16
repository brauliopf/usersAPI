import { Router } from 'express';
const messageRouter = Router({ mergeParams: true });
import { messageController } from "../controllers";
import { authenticate } from '../middlewares/auth';

messageRouter.post("/", authenticate, messageController.createMessage);

export { messageRouter }