import { dbConnect } from "../../config/db.js";
import ChatMessage from "../../models/ChatMessage.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // The data coming from the client after the stream finishes
  const { chatId, prompt, completion, engine, prompt_timestamp, completion_timestamp } = req.body;

  try {
    await dbConnect();

    // Create a new document matching the ChatMessage schema
    const newMessage = await ChatMessage.create({
      chatId: chatId, // Storing the unique ID for potential retrieval
      engine: engine,
      prompt: prompt,
      completion: completion,
      promptTimestamp: prompt_timestamp,
      completionTimestamp: completion_timestamp,
    });

    res.status(200).json({ success: true, message: 'Chat saved successfully', savedMessage: newMessage });
  } catch (error) {
    console.error("Error saving chat to MongoDB:", error);
    res.status(500).json({ success: false, message: 'Failed to save chat', error: error.message });
  }
}