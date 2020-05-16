import mongoose from 'mongoose';
import { timestamp } from './plugins/timestamp'

const ChatSchema = new mongoose.Schema({

  target: { type: mongoose.Schema.ObjectId, refPath: 'targetType' },
  targetType: { type: String, enum: ['User', 'Session'], required: true },
  users: [{ type: mongoose.Schema.ObjectId, ref: 'User', required: true }]
});
ChatSchema.plugin(timestamp);

export const Chat = mongoose.model('Chat', ChatSchema);