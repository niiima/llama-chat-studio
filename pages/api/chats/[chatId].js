import { dbConnect } from "../../../config/db.js";
import ChatSession from "../../../models/ChatSession.js";
import mongoose from "mongoose";

export default async function handler(req, res) {
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

  try {
    await dbConnect();

    // ==========================================
    // GET CHAT
    // GET /api/chats/:chatId
    // ==========================================

    if (req.method === "GET") {
      const chat = await ChatSession.findById(chatId).lean();

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      return res.status(200).json({
        success: true,
        chat,
      });
    }

    // ==========================================
    // PATCH CHAT
    // PATCH /api/chats/:chatId
    // ==========================================

    if (req.method === "PATCH") {
      const body = req.body || {};

      const update = {
        updatedAt: new Date(),
      };

      // ------------------------------------------
      // Title
      // ------------------------------------------

      if (typeof body.title === "string") {
        update.title = body.title.trim() || "New Chat";
      }

      // ------------------------------------------
      // Current engine
      // ------------------------------------------

      if (
        typeof body.currentEngine === "string" &&
        body.currentEngine.trim()
      ) {
        update.currentEngine = body.currentEngine.trim();
      }

      // ------------------------------------------
      // Settings
      // ------------------------------------------

      if (
        body.settings &&
        typeof body.settings === "object"
      ) {
        const existingChat =
          await ChatSession.findById(chatId);

        if (!existingChat) {
          return res.status(404).json({
            success: false,
            message: "Chat not found",
          });
        }

        update.settings = {
          ...(existingChat.settings?.toObject?.() ||
            existingChat.settings ||
            {}),
          ...body.settings,
        };
      }

      const chat =
        await ChatSession.findByIdAndUpdate(
          chatId,
          {
            $set: update,
          },
          {
            new: true,
            runValidators: true,
          }
        ).lean();

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      return res.status(200).json({
        success: true,
        chat,
      });
    }

    // ==========================================
    // DELETE CHAT
    // DELETE /api/chats/:chatId
    // ==========================================

    if (req.method === "DELETE") {
      const deleted =
        await ChatSession.findByIdAndDelete(chatId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      return res.status(200).json({
        success: true,
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error(`/api/chats/${chatId}:`, error);

    return res.status(500).json({
      success: false,
      message: "Failed to process chat request",
      error: error.message,
    });
  }
}