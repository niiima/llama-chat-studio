import { dbConnect } from "../../../../config/db.js";
import ChatSession from "../../../../models/ChatSession.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { chatId } = req.query;

  if (!chatId) {
    return res.status(400).json({
      success: false,
      message: "chatId is required",
    });
  }

  try {
    await dbConnect();

    const chat = await ChatSession.findOneAndUpdate(
      { chatId },
      {
        $set: {
          messages: [],
          title: "New Chat",
          updatedAt: new Date(),
        },
      },
      {
        new: true,
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
  } catch (error) {
    console.error("POST /api/chats/[chatId]/clear:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear chat",
    });
  }
}