import { Chat, Message } from '../models';

export const getChats = async (req, res, next) => {
  Chat.find({ users: req.user._id, targetType: 'User' }).populate({ path: 'users', select: 'name' })
    .then(chats => res.status(200).json({ success: true, data: chats }))
    .catch(err => console.log('Catch error in getChats controller'));
}

export const getChatMessages = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  if (!id) { res.status(400).json({ success: false, error: `API request missing chat` }) }

  // Verify user is in chat
  user && Chat.findById(id)
    .then(c => {
      c.targetType === 'User' && !c.users.includes(user._id)
        && res.status(400).json({ success: false, error: `Chat not found for user ${user._id}` })
    }
    )
    .catch(err => res.status(400).json({ success: false, error: `Chat not found with id ${id}` }));

  await Message.find({ chat: id })
    .then(msgs => res.status(200).json({ success: true, data: msgs }))
    .catch(err => console.log('catch error in getChatMessages'));
}