import { Order, Session } from '../models';

export const getStripeCustomer = async (req, res, next) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
  const cu = await stripe.customers.retrieve(req.params.id)
  res.status(200).json({ stripeCustomer: cu });
  return next();
}

export const webhook = (req, res, next) => {
  const event = req.body;

  let intent = null;
  switch (event['type']) {
    case 'payment_intent.created':
      intent = event.data.object
      break;
    case 'payment_intent.succeeded':
      intent = event.data.object;
      Order.findOneAndUpdate({ paymentIntent: intent.id }, { status: "authorized", authorizedAt: Date.now(), rejectedAt: '' }, { new: true })
        .then(order => { updateSessionParticipants(order); res.status(200).json({ order_id: order._id }) })
        .catch(err => console.log('Catch error in updateOrder controller', err));
      break;
    case 'payment_intent.payment_failed':
      intent = event.data.object;
      const message = intent.last_payment_error && intent.last_payment_error.message;

      Order.findOneAndUpdate({ paymentIntent: intent.id }, { status: "rejected", rejectedAt: Date.now() }, { new: true })
        .then(order => { updateSessionParticipants(order); res.status(200).json({ order_id: order._id }) })
        .catch(err => console.log('Catch error in updateOrder controller', err));
      break;
    default:
      res.status(200).json({ received: true });
      return next();
      break;

  }
}

const updateSessionParticipants = async order => {
  switch (order.status) {
    case "authorized":
      Session.findByIdAndUpdate(order.session, { $push: { participants: order.buyer } })
      break;
    case "rejected":
      Session.findByIdAndUpdate(order.session, { $pull: { participants: order.buyer } })
      break;
  }

}