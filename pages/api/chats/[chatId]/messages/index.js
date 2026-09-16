import { dbConnect } from "../../../../../config/db.js";
import ChatSession from "../../../../../models/ChatSession.js";
import mongoose from "mongoose";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const { chatId } = req.query;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "chatId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    const chat = await ChatSession.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // ==========================================
    // GET MESSAGES
    // GET /api/chats/:chatId/messages
    // ==========================================

    if (req.method === "GET") {
      return res.status(200).json({
        success: true,
        messages: chat.messages,
      });
    }

    // ==========================================
    // POST MESSAGE
    // POST /api/chats/:chatId/messages
    // ==========================================

    if (req.method === "POST") {
      const {
        role,
        content,
        timestamp,
        engine,
      } = req.body || {};

      if (!role || !content) {
        return res.status(400).json({
          success: false,
          message: "role and content are required",
        });
      }

      if (
        !["user", "assistant", "system"].includes(role)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid message role",
        });
      }

      // ------------------------------------------
      // Engine rules
      // ------------------------------------------

      if (
        role !== "assistant" &&
        engine !== undefined &&
        engine !== null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "engine is only allowed for assistant messages",
        });
      }

      if (
        role === "assistant" &&
        (!engine || typeof engine !== "string")
      ) {
        return res.status(400).json({
          success: false,
          message:
            "engine is required for assistant messages",
        });
      }

      // ------------------------------------------
      // Save message
      // ------------------------------------------

      chat.messages.push({
        role,
        content,
        timestamp: timestamp || new Date(),
        engine:
          role === "assistant"
            ? engine.trim()
            : null,
      });

      // ------------------------------------------
      // First user message becomes title
      // ------------------------------------------

      if (
        role === "user" &&
        (!chat.title || chat.title === "New Chat")
      ) {
        const title = content
          .replace(/\s+/g, " ")
          .trim();

        chat.title =
          title.length > 50
            ? `${title.substring(0, 50)}...`
            : title;
      }

      chat.updatedAt = new Date();

      await chat.save();

      const savedMessage =
        chat.messages[chat.messages.length - 1];

      return res.status(201).json({
        success: true,
        message: savedMessage,
        chat: {
          _id: chat._id.toString(),
          title: chat.title,
          currentEngine: chat.currentEngine,
          updatedAt: chat.updatedAt,
          messagesCount: chat.messages.length,
        },
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error(
      "Chat messages API error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to process chat messages request",
      error: error.message,
    });
  }
}