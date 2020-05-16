import { Router } from 'express';
const orderRouter = Router({ mergeParams: true });
import { orderController } from "../controllers";
import { authenticate } from '../middlewares/auth';

orderRouter.post("/", authenticate, orderController.createOrder)
orderRouter.put("/:id", authenticate, orderController.updateOrder)
orderRouter.get("/", authenticate, orderController.getOrders)

export { orderRouter };