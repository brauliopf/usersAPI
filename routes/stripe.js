import { Router } from 'express';
import { stripeController } from "../controllers"
const stripeRouter = Router({ mergeParams: true });

stripeRouter.get("/public-key", (req, res, next) => {
  res.send({ publicKey: (process.env.NODE_ENV == "production" ?
      process.env.STRIPE_LIVE_PUBLISHABLE_KEY :
      process.env.STRIPE_PUBLISHABLE_KEY) });
})

// https://stripe.com/docs/api/events/types
stripeRouter.post("/webhook", stripeController.webhook);
stripeRouter.post("/customers/:id", stripeController.getStripeCustomer);
stripeRouter.post("/charge/:recipientStripeId", stripeController.basicCharge);
stripeRouter.post("/generateStripeClient/:id", stripeController.generateStripeClient);
stripeRouter.get("/checkAccountEnabled/:stripeId", stripeController.checkAcctDetailsSubmitted);
stripeRouter.get("/accountLink/:stripeId", stripeController.getAccountLink);
stripeRouter.get("/webhooks/account-updated", stripeController.accountUpdated);

export { stripeRouter };