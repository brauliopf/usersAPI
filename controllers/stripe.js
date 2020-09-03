import { Order, Session, User } from '../models';

export const accountUpdated = async function (req, res) {
  console.log(req);
}

export const getAccountLink = async function (req, res) {
  let origin = (process.env.NODE_ENV === 'production') ? process.env.PROD_FE_ORIGIN : process.env.DEV_FE_ORIGIN;

  const stripe = require("stripe")((process.env.NODE_ENV == "production"
    ? process.env.STRIPE_LIVE_SECRET_KEY : process.env.STRIPE_SECRET_KEY))
  const accountLinks = await stripe.accountLinks.create({
    account: req.params.stripeId,
    refresh_url: origin,
    return_url: origin,
    type: 'account_onboarding'
  }).catch((err) => console.log(err));

  res.send(accountLinks);
}

export const checkAcctDetailsSubmitted = async function (req, res) {
  const stripe = require("stripe")((process.env.NODE_ENV == "production"
    ? process.env.STRIPE_LIVE_SECRET_KEY : process.env.STRIPE_SECRET_KEY))

  await stripe.accounts.retrieve(req.params.stripeId).then((person) => {
    res.status(200);
    res.send(person.details_submitted)
  }).catch((err) => {
      res.status(201);
      res.send(err);
  })
}

export const generateStripeClient = async function (req, res) {
  const stripe = require("stripe")((process.env.NODE_ENV == "production"
    ? process.env.STRIPE_LIVE_SECRET_KEY : process.env.STRIPE_SECRET_KEY))

  const userId = req.params.id;
  const userObj = await User.findById(userId);

  // if the user does not already have an associated Stripe account with us, create one here.
  if (!userObj.stripeId) {
    const cu = await stripe.accounts.create({
      type: 'express',
      email: userObj.email,
      capabilities: {
        transfers: {requested: true}
      },
      metadata: {
        name: userObj.name,
        tmgId: userId
      }
    });

    let user = await User.findByIdAndUpdate(req.params.id, {stripeId: cu.id}, {new: true})
      .catch(() => {
        console.log("Unable to update stripeId for user with id " + userId + " at " + Date.now());
      });
    res.status(200);
    res.send(user);
  }
}

export const basicCharge = async function postCharge(req, res) {
  const stripe = require("stripe")((process.env.NODE_ENV == "production"
    ? process.env.STRIPE_LIVE_SECRET_KEY : process.env.STRIPE_SECRET_KEY))
  try {
    const charge = await stripe.charges.create({
      amount: req.body.amount,
      currency: 'usd',
      source: req.body.stripeToken,
      receipt_email: req.body.email,
      transfer_data: {
        destination: req.params.recipientStripeId
      }
    });

    if (!charge) throw new Error('charge unsuccessful')

    res.status(200).json({
      message: 'charge posted successfully',
      charge
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

// @desc    Retrieve or create a customer in Stripe
// @route   GET api/v1/stripe/customers/:stripeId
// @access  Private
export const getStripeCustomer = async (req, res, next) => {
  const stripe = require("stripe")((process.env.NODE_ENV == "production"
    ? process.env.STRIPE_LIVE_SECRET_KEY : process.env.STRIPE_SECRET_KEY))
  const stripeId = req.params.id;

  if (stripeId == "0") {
    const cu = await stripe.accounts.create({
      type: 'express',
      email: req.body.user.email,
      capabilities: {
        transfers: {requested: true}
      },
      metadata: { "tmgId": req.user.id, "name": req.user.name },
    })

    await User.findByIdAndUpdate(req.user.id, { stripeId: cu.id })

    return res.status(200).json({ stripeId: cu.id });

  }
  else {
    try {
      const cu = await stripe.customers.retrieve(stripeId)
      return res.status(200).json({ stripeId: cu.id });
    } catch (exception) {
      return res.status(500).body(exception.message);
    }
  }

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