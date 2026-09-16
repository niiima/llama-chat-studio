import { createParser } from "eventsource-parser";

export async function OpenAIChatStream(payload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const body = {
    ...payload,
    stream: true,
  };

  const res = await fetch(
    `${process.env.LLAMA_CPP_URL}/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();

    throw new Error(
      `llama.cpp request failed (${res.status}): ${errorText}`
    );
  }

  if (!res.body) {
    throw new Error(
      "llama.cpp response has no body"
    );
  }

  return new ReadableStream({
    async start(controller) {
      let closed = false;

      const closeController = () => {
        if (!closed) {
          closed = true;
          controller.close();
        }
      };

      const errorController = (error) => {
        if (!closed) {
          closed = true;
          controller.error(error);
        }
      };

      const emit = (type, content = "") => {
        if (closed) return;

        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type,
              content,
            }) + "\n"
          )
        );
      };

      function onParse(event) {
        if (event.type !== "event") {
          return;
        }

        const data = event.data;

        if (data === "[DONE]") {
          emit("done");
          closeController();
          return;
        }

        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta;

          if (!delta) {
            return;
          }

          /*
           * llama.cpp with:
           *
           *   --reasoning-format deepseek
           *
           * separates model output into:
           *
           *   delta.reasoning_content
           *   delta.content
           *
           * We deliberately keep these separate.
           */

          if (delta.reasoning_content) {
            emit(
              "reasoning",
              delta.reasoning_content
            );
          }

          if (delta.content) {
            emit(
              "content",
              delta.content
            );
          }
        } catch (error) {
          console.error(
            "Failed to parse llama.cpp stream chunk:",
            error,
            data
          );

          errorController(error);
        }
      }

      const parser = createParser(onParse);

      try {
        for await (const chunk of res.body) {
          if (closed) {
            break;
          }

          parser.feed(
            decoder.decode(chunk, {
              stream: true,
            })
          );
        }

        if (!closed) {
          const remaining = decoder.decode();

          if (remaining) {
            parser.feed(remaining);
          }
        }

        /*
         * Normally llama.cpp sends [DONE], which closes
         * the stream above.
         *
         * If the connection simply ends without [DONE],
         * make sure the browser still receives a final event.
         */
        if (!closed) {
          emit("done");
          closeController();
        }
      } catch (error) {
        console.error(
          "llama.cpp streaming error:",
          error
        );

        errorController(error);
      }
    },
  });
}