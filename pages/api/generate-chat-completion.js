import { OpenAIChatStream } from "./OpenAIChatStream";

export const config = {
  runtime: "edge",
};

const handler = async (req) => {
  const body = await req.json();

  const payload = {
    // model: body.model,                    // ← use model, not engine
    // messages: body.messages,
    // temperature: body.temperature,
    // top_p: body.top_p,
    // top_k: body.top_k,                    // also pass top_k
    // frequency_penalty: body.frequency_penalty,
    // presence_penalty: body.presence_penalty,
    // max_tokens: body.max_tokens,
    ...body,
    stream: true,
      chat_template_kwargs: {
        enable_thinking: true
      }
  };

  const stream = await OpenAIChatStream(payload);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
};

export default handler;