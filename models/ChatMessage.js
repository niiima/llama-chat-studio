import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant'],
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSessionSchema = new mongoose.Schema({
  // Unique ID for the entire conversation
  chatId: {
    type: String,
    required: true, // We use the client-generated UUID
  },
  
  // Metadata for the session
  title: {
    type: String,
    default: 'New Chat',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startingEngine: {
    type: String,
    required: true,
  },

  // The conversation history, stored as an embedded array
  messages: [MessageSchema],
});

// Check if the model is already registered to prevent MongoDB errors during hot reloading
const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);

export default ChatSession;
