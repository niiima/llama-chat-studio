import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  engine: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  completion: {
    type: String,
    required: true,
  },
  promptTimestamp: {
    type: Date,
    required: true,
  },
  completionTimestamp: {
    type: Date,
    required: true,
  }
});

const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);

export default ChatMessage;
