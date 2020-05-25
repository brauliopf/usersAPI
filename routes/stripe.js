import { Router } from 'express';
import { stripeController } from "../controllers"
const stripeRouter = Router({ mergeParams: true });

stripeRouter.get("/public-key", (req, res, next) => {
  res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
})

// https://stripe.com/docs/api/events/types
stripeRouter.post("/webhook", stripeController.webhook);

export { stripeRouter };