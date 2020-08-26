import { Order, Session } from '../models';

export const createPaymentIntent = async (req, res) => {
  const stripe = require("stripe")((process.env.NODE_ENV == "production"
    ? process.env.STRIPE_LIVE_SECRET_KEY : process.env.STRIPE_SECRET_KEY))
  const paymentIntent = await stripe.paymentIntents.create({
    //amount: req.body.totalPrice,
    amount: 100,
    currency: "usd"
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  });
}

// @desc    Gets an open order for the pair session and user. If order does not exist, creates one
// @route   POST /api/v1/sessions/:id/orders
// @params  { session:ObjectId, stripeCustomer:Object }
// @access  Private
export const createOrder = async (req, res, next) => {
  const session = await Session.findById(req.params.id)
  const stripeCustomer = req.body.stripeCustomer;
  const stripeCredit = stripeCustomer.balance
  const orderTotal = session.price - stripeCredit
  // orderTotal > 0: charge difference + (charge credit card > charge stripe credit > ok)
  // orderTotal <= 0: no charge + (charge stripe credit > ok)

  async function createPaymentIntent(price) {
    const pi = await stripe.paymentIntents.create({
      amount: price,
      currency: "usd",
      statement_descriptor: `TMG_Session`
    });
    return pi;
  }

  // if order exists, retrieve the existing payment intent and return
  let order = await Order.findOne({ buyer: req.user._id, session: session, status: "open" })
  let paymentIntent = order && await stripe.paymentIntents.retrieve(order.paymentIntent) || undefined

  if (order) {
    if (paymentIntent === undefined) paymentIntent = await createPaymentIntent(session.price);
    res.status(200).json({ order_id: order._id, client_secret: paymentIntent.client_secret })
  }
  // if order does not exist, create a new payment intent and return
  else {
    paymentIntent = await createPaymentIntent(session.price);
    Order.create({ buyer: req.user._id, session: session._id, price: session.price, status: "open", paymentIntent: paymentIntent.id })
      .then(order => res.status(200).json({ order_id: order._id, client_secret: paymentIntent.client_secret }))
      .catch(err => console.log('Catch error in getOpenOrder controller', err));
  }
}

// @desc    Updates order
// @route   PUT /api/v1/orders/:id
// @access  Private
export const updateOrder = async (req, res, next) => {
  let order = req.body
  console.log("updateOrder", order)
  Order.findByIdAndUpdate(req.params.id, req.body)
    .then(order => res.status(200).json({ order_id: order._id }))
    .catch(err => console.log('Catch error in updateOrder controller', err));
}

// @desc    Gets orders purchased by a user account: return session and coach info
// @route   GET /api/v1/orders/
// @access  Private
export const getOrders = async (req, res, next) => {
  const orders =
    await Order.find({ buyer: req.user._id })
      .populate({ path: "session", model: "Session" });
  res.status(200).json(orders)
}