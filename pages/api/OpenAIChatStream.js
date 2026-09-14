import {
  createParser,
} from "eventsource-parser";

export async function OpenAIChatStream(payload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;
  console.log(payload)
    const body = {
    // model: payload.model,                 // ← MUST be present
    // messages: payload.messages,
    // temperature: payload.temperature,
    // top_p: payload.top_p,
    // top_k: payload.top_k,
    // max_tokens: payload.max_tokens,
    // frequency_penalty: payload.frequency_penalty,
    // presence_penalty: payload.presence_penalty,
    ...payload,
    stream: true,
    // n: 1,
  };
console.log(body)
  const res = await fetch(
    `${process.env.LLAMA_CPP_URL}/v1/chat/completions`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();

    console.error(
      "llama.cpp error:",
      res.status,
      errorText
    );

    throw new Error(
      `llama.cpp returned ${res.status}: ${errorText}`
    );
  }

  if (!res.body) {
    throw new Error("llama.cpp returned no response body");
  }

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event) {
        if (event.type !== "event") {
          return;
        }

        const data = event.data;

        if (data === "[DONE]") {
          controller.close();
          return;
        }

        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta;

          if (!delta?.content) {
            return; // skip role-only chunks and empty deltas
          }

          controller.enqueue(encoder.encode(delta.content));
          counter++;
        } catch (e) {
          console.error("Error parsing llama.cpp stream:", e, data);
          controller.error(e);
        }
      }

      const parser = createParser(onParse);

      try {
        for await (const chunk of res.body) {
          parser.feed(
            decoder.decode(chunk, {
              stream: true,
            })
          );
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return stream;
}