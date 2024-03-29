import mongoose from 'mongoose';
import { timestamp } from './plugins';

const OrderSchema = new mongoose.Schema({

  session: { type: mongoose.Schema.ObjectId, ref: 'Session', required: true },
  price: { type: Number, required: true },
  buyer: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ["open", "submitted", "authorized", "rejected", "refunded", "canceled"], required: true, default: "open" },
  authorizedAt: Date,
  rejectedAt: Date,
  paymentIntent: { type: String, required: true }
});
OrderSchema.plugin(timestamp);

export const Order = mongoose.model('Order', OrderSchema);