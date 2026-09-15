import { createParser } from "eventsource-parser";

export async function OpenAIChatStream(payload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  console.log("OpenAIChatStream payload:", payload);

  const response = await fetch(
    `${process.env.LLAMA_CPP_URL}/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        stream: true,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      "llama.cpp error:",
      response.status,
      errorText
    );

    throw new Error(
      `llama.cpp returned ${response.status}: ${errorText}`
    );
  }

  if (!response.body) {
    throw new Error("llama.cpp returned no response body");
  }

  return new ReadableStream({
    async start(controller) {
      const parser = createParser((event) => {
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

          const content =
            json.choices?.[0]?.delta?.content;

          if (content) {
            controller.enqueue(
              encoder.encode(content)
            );
          }
        } catch (error) {
          console.error(
            "Error parsing llama.cpp stream:",
            error,
            data
          );

          controller.error(error);
        }
      });

      try {
        for await (const chunk of response.body) {
          parser.feed(
            decoder.decode(chunk, {
              stream: true,
            })
          );
        }

        // Flush any incomplete UTF-8 sequence.
        parser.feed(decoder.decode());

      } catch (error) {
        console.error(
          "llama.cpp stream error:",
          error
        );

        controller.error(error);
      }
    },
  });
}