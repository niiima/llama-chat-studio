import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["user", "assistant", "system"],
    },

    content: {
      type: String,
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    // Only meaningful for assistant messages.
    // Records the engine that actually generated the response.
    engine: {
      type: String,
      default: null,
    },

    reasoning: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const ChatSettingsSchema = new mongoose.Schema(
  {
    systemPrompt: {
      type: String,
      default: "",
    },

    temperature: {
      type: Number,
      default: 0.6,
    },

    top_p: {
      type: Number,
      default: 0.95,
    },

    top_k: {
      type: Number,
      default: 40,
    },

    frequency_penalty: {
      type: Number,
      default: 0,
    },

    presence_penalty: {
      type: Number,
      default: 0,
    },

    max_response_tokens: {
      type: Number,
      default: 2048,
    },

    mode: {
      type: String,
      default: "",
    },

    act: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const ChatSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "New Chat",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  // Engine selected for the next response.
  currentEngine: {
    type: String,
    required: true,
  },

  settings: {
    type: ChatSettingsSchema,
    default: () => ({}),
  },

  messages: {
    type: [MessageSchema],
    default: [],
  },
});

const ChatSession =
  mongoose.models.ChatSession ||
  mongoose.model("ChatSession", ChatSessionSchema);

export default ChatSession;