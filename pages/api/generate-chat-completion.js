import { OpenAIChatStream } from "./OpenAIChatStream";

export const config = {
  runtime: "edge",
};

const handler = async (req) => {
  const body = await req.json();
  
  if (!body) {
      return new Response(JSON.stringify({ error: "No body provided" }), {
          headers: { "Content-Type": "application/json" },
      });
  }
  
  const { messages, ...rest } = body; // Destructure to separate messages array


  // 2. Prepare Payload for AI call
  const payload = {
    messages: messages,
    ...rest,
    stream: true,
    chat_template_kwargs: {
      enable_thinking: true
    }
  };

  // 3. Execute AI Streaming
  const stream = await OpenAIChatStream(payload);

  // We need to buffer the stream to get the final response for saving.
  // Since we are streaming, we have to return the stream immediately for the UI,
  // but we'll also read and save the content *during* the stream process if possible,
  // or rely on the client to capture and send the final response to a new save endpoint.
  // For simplicity in this first pass, we will focus on making the API call work,
  // and then address saving the final response.

  // For now, we return the stream as before, assuming the client will handle the final state.
  // We will modify the client next to capture and send the final state.
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
};

export default handler;