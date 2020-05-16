import { Message, Chat } from '../models';

// @desc    Create a message to a new or existing chat with a session or coach
// @route   POST /api/v1/users/:id/messages
// @params  {text:String, targetType:["User", "Session"], target:ObjectId }
// @access  Private
export const createMessage = async (req, res, next) => {
  const { text, targetType, target } = req.body;
  const sender = req.user;
  const users = targetType === 'User' ? [sender._id, target] : [sender._id]

  // Get an existing chat or create a new one
  let chat = await Chat.findOne({
    $or: [
      { targetType: targetType === "User" ? "User" : undefined, users: { $all: users } },
      { targetType: "Session", target: target }
    ]
  });

  // create chat with targetType = User OR Session (never undefined)
  // targetType === Session => must assign target (if type === user it does not matter -- must verify users)
  if (!chat) chat = await Chat.create({ users, targetType, target: targetType === 'Session' ? target : undefined });

  // Create message
  let msg = await Message.create({ text, sender: { id: sender._id, name: sender.name }, chat: chat._id });

  // Return
  res.status(201).json({ message: msg });

}