const mongoose = require('mongoose');
import { timestamp, location } from "./plugins"
import { Chat } from './index'

export const SessionSchema = new mongoose.Schema({

  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, default: "Lacrosse Training Session" },
  chat: { type: mongoose.Schema.ObjectId, ref: 'Chat' },
  ageGroup: {
    min: { type: Number },
    max: { type: Number }
  },
  agenda: {
    date: { type: Date, required: true },
    start: { type: Date, required: true },
    end: { type: Date },
    timezoneOffset: Number
  },
  capacity: {
    min: { type: Number },
    max: { type: Number }
  },
  price: {
    type: Number
  },
  skills: {
    // {position: level required} => {Goalie: 2, Def: 3}
    // Position: ['F/O', 'Goalie', 'Mid', 'Att', 'Def', 'LSM/SSDM']
    // Level: 1, 2, 3
    type: Map,
    of: String
  },
  discountTier: { // {number of buyers: price after discount} => {5: 40, 8: 35, 10: 30}
    type: Map,
    of: Number,
    validate: function (map) {
      for (const price of map.values()) {
        if (price > this.price) {
          throw new Error(`Discounted price must be lower than regular price: ${this.price}`);
        }
      }
      for (const qtyParticipants of map.keys()) {
        if (this.capacity.max && qtyParticipants > this.capacity.max) {
          throw new Error(`Discount tier larger than maximum participants: ${this.price}`);
        }
      }
      return true;
    }
  },
  participants: {
    type: [mongoose.Schema.ObjectId],
    ref: 'User',
    default: undefined
  }
});
SessionSchema.plugin(location);
SessionSchema.plugin(timestamp);

SessionSchema.pre('save', async function (next) {
  if (this.isNew) {
    const chat = await Chat.create({ targetType: 'Session', target: this._id, users: [this.coach] })
    this.chat = chat; next();
  }
});

export const Session = mongoose.model('Session', SessionSchema);