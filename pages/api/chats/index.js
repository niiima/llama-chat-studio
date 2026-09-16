import { dbConnect } from "../../../config/db.js";
import ChatSession from "../../../models/ChatSession.js";

export default async function handler(req, res) {
  try {
    await dbConnect();

    // ==========================================
    // GET /api/chats
    // ==========================================

    if (req.method === "GET") {
      const chats = await ChatSession.find({})
        .select(
          "_id title currentEngine createdAt updatedAt messages"
        )
        .sort({ updatedAt: -1 })
        .lean();

      const chatList = chats.map((chat) => ({
        _id: chat._id.toString(),
        title: chat.title,
        currentEngine: chat.currentEngine,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messagesCount: chat.messages?.length || 0,
      }));

      return res.status(200).json({
        success: true,
        chats: chatList,
      });
    }

    // ==========================================
    // POST /api/chats
    // ==========================================

    if (req.method === "POST") {
      const { currentEngine, settings } = req.body || {};

      if (!currentEngine) {
        return res.status(400).json({
          success: false,
          message: "currentEngine is required",
        });
      }

      const chat = await ChatSession.create({
        title: "New Chat",
        currentEngine,
        settings: settings || {},
        messages: [],
      });

      return res.status(201).json({
        success: true,
        chat: {
          _id: chat._id.toString(),
          title: chat.title,
          currentEngine: chat.currentEngine,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          messagesCount: 0,
        },
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process chat request",
      error: error.message,
    });
  }
}