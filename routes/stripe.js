import { Router } from 'express';
const stripeRouter = Router({ mergeParams: true });
import { Order } from '../models';

stripeRouter.get("/public-key", (req, res, next) => {
  res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
})

// https://stripe.com/docs/api/events/types
stripeRouter.post("/webhook", (req, res, next) => {
  const event = req.body;

  let intent = null;
  switch (event['type']) {
    case 'payment_intent.created':
      intent = event.data.object
      console.log("Created!", intent.id);
      break;
    case 'payment_intent.succeeded':
      intent = event.data.object;
      console.log("Succeeded:", intent.id, event.data);
      Order.findByIdAndUpdate(intent.id, { status: "authorized" })
        .then(order => res.status(200).json({ order_id: order._id }))
        .catch(err => console.log('Catch error in updateOrder controller', err));
      break;
    case 'payment_intent.payment_failed':
      intent = event.data.object;
      const message = intent.last_payment_error && intent.last_payment_error.message;
      console.log('Failed:', intent.id, message);
      Order.findByIdAndUpdate(intent.id, { status: "rejected" })
        .then(order => res.status(200).json({ order_id: order._id }))
        .catch(err => console.log('Catch error in updateOrder controller', err));
      break;
  }

  res.status(200).json({ received: true });
  return next();
})

export { stripeRouter };