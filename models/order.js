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

OrderSchema.pre('save', async function (next) {

  if (!this.isModified('status')) next();

  // if new status is "authorized" and authorizedAt is null, set authorized!
  if (this.status === "authorized" && this.authorizedAt === null)
    this.authorizedAt = Date.now();

  // if new status is "rejected" and rejectedAt is null, set rejected!
  if (this.status === "rejected" && this.rejectedAt === null)
    this.rejectedAt = Date.now();

  next();
});

export const Order = mongoose.model('Order', OrderSchema);