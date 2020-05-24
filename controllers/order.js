import { Order, Session } from '../models';

// @desc    Gets an open order for the pair session and user. If order does not exists, creates one
// @route   POST /api/v1/sessions/:id/orders
// @params  { session:ObjectId }
// @access  Private
export const createOrder = async (req, res, next) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
  const session = await Session.findById(req.params.id)

  async function createPaymentIntent(price) {
    const pi = await stripe.paymentIntents.create({
      amount: price,
      currency: "usd",
      statement_descriptor: `TMG_Session`
    });
    return pi;
  }

  let order = await Order.findOne({ buyer: req.user._id, session: session, status: "open" })
  let paymentIntent = order && await stripe.paymentIntents.retrieve(order.paymentIntent) || undefined

  // if order exists, retrieve the existing intent and return
  if (order) {
    if (paymentIntent === undefined) paymentIntent = await createPaymentIntent(session.price);
    res.status(200).json({ order_id: order._id, client_secret: paymentIntent.client_secret })
  }
  // if order does not exist, create a new payment intent
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
  Order.findByIdAndUpdate(req.params.id, req.body)
    .then(res => console.log(res))
  //     .catch(err => console.log('Catch error in updateOrder controller', err));
  // }
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