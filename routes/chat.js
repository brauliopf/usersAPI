import { Router } from 'express';
const chatRouter = Router({ mergeParams: true });
import { chatController } from "../controllers";
import { authenticate } from '../middlewares/auth';

chatRouter.get("/", authenticate, chatController.getChats)
chatRouter.get('/:id/messages', chatController.getChatMessages);

export { chatRouter };