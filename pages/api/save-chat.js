import { dbConnect } from "../../config/db.js";
import ChatSession from "../../models/ChatSession.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Data structure: { chatId, prompt, completion, engine, prompt_timestamp, completion_timestamp }
  const { chatId, prompt, completion, engine, prompt_timestamp, completion_timestamp } = req.body;

  if (!chatId || !prompt || !completion) {
      return res.status(400).json({ success: false, message: 'Missing required chat data' });
  }

  try {
    await dbConnect();

    // Check if the session already exists
    const existingSession = await ChatSession.findOne({ chatId: chatId });

    if (existingSession) {
        // Session exists: Append the new message
        const newMessage = {
            role: (prompt ? 'user' : 'assistant'),
            content: prompt || completion,
            timestamp: new Date(), // Use the server's timestamp
        };

        const updatedSession = await ChatSession.findOneAndUpdate(
            { chatId: chatId },
            { $push: { messages: newMessage } },
            { new: true }
        );
        return res.status(200).json({ success: true, message: 'Chat updated successfully', savedSession: updatedSession });
    } else {
        // New session: Create the initial session document
        const newSession = await ChatSession.create({
            chatId: chatId,
            startingEngine: engine,
            title: 'New Chat', // Default title
            messages: [
                { role: 'user', content: prompt, timestamp: prompt_timestamp },
                { role: 'assistant', content: completion, timestamp: completion_timestamp }
            ]
        });
        return res.status(200).json({ success: true, message: 'Chat created and saved successfully', savedSession: newSession });
    }
  } catch (error) {
    console.error("Error saving chat to MongoDB:", error);
    return res.status(500).json({ success: false, message: 'Failed to save chat', error: error.message });
  }
}