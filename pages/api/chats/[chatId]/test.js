import { dbConnect } from "../../../../config/db.js";
import ChatSession from "../../../../models/ChatSession.js";

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

    const chat = await ChatSession.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (req.method === "GET") {
      return res.status(200).json({
        success: true,
        chat,
      });
    }

    if (req.method === "PATCH") {
      const {
        title,
        startingEngine,
        settings,
      } = req.body || {};

      if (title !== undefined) {
        chat.title = title;
      }

      if (startingEngine !== undefined) {
        chat.startingEngine = startingEngine;
      }

      if (settings !== undefined) {
        chat.settings = {
          ...chat.settings.toObject(),
          ...settings,
        };
      }

      chat.updatedAt = new Date();

      await chat.save();

      return res.status(200).json({
        success: true,
        chat: {
          _id: chat._id.toString(),
          title: chat.title,
          startingEngine: chat.startingEngine,
          settings: chat.settings,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          messagesCount: chat.messages.length,
        },
      });
    }

    if (req.method === "DELETE") {
      await ChatSession.findByIdAndDelete(chatId);

      return res.status(200).json({
        success: true,
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