import mongoose from 'mongoose';
import { timestamp } from './plugins/timestamp'

const MessageSchema = new mongoose.Schema({

  text: { type: String, required: true },
  sender: {
    id: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }
  },
  chat: { type: mongoose.Schema.ObjectId, ref: 'Chat', required: true, select: false }
});
MessageSchema.plugin(timestamp);

export const Message = mongoose.model('Message', MessageSchema);