import { Router } from 'express';
const stripeRouter = Router({ mergeParams: true });

stripeRouter.get("/public-key", (req, res, next) => {
  res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
})

export { stripeRouter };