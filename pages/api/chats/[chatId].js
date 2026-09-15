import { dbConnect } from "../../../config/db.js";
import ChatSession from "../../../models/ChatSession.js";

export default async function handler(req, res) {
  const { chatId } = req.query;

  if (!chatId) {
    return res.status(400).json({
      success: false,
      message: "chatId is required",
    });
  }

  await dbConnect();

  if (req.method === "GET") {
    try {
      const chat = await ChatSession.findOne({
        chatId,
      }).lean();

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
    } catch (error) {
      console.error("GET /api/chats/[chatId]:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load chat",
      });
    }
  }

  if (req.method === "PATCH") {
    try {
      const body = req.body || {};

      const update = {
        updatedAt: new Date(),
      };

      if (typeof body.title === "string") {
        update.title = body.title.trim() || "New Chat";
      }

      if (body.engine) {
        update.startingEngine = body.engine;
      }

      if (body.settings) {
        update.settings = {
          systemPrompt: body.settings.systemPrompt ?? "",
          temperature: body.settings.temperature ?? 0.6,
          top_p: body.settings.top_p ?? 0.95,
          top_k: body.settings.top_k ?? 40,
          frequency_penalty:
            body.settings.frequency_penalty ?? 0,
          presence_penalty:
            body.settings.presence_penalty ?? 0,
          max_response_tokens:
            body.settings.max_response_tokens ?? 2048,
          mode: body.settings.mode ?? "",
          act: body.settings.act ?? "",
        };
      }

      const chat = await ChatSession.findOneAndUpdate(
        { chatId },
        { $set: update },
        { new: true }
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
    } catch (error) {
      console.error("PATCH /api/chats/[chatId]:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update chat",
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await ChatSession.findOneAndDelete({
        chatId,
      });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error("DELETE /api/chats/[chatId]:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete chat",
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
}