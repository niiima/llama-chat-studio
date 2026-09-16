import { OpenAIChatStream } from "./OpenAIChatStream";

export const config = {
  runtime: "edge",
};

const handler = async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const body = await req.json();

    if (!body) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No body provided",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { messages, ...rest } = body;

    const payload = {
      messages,
      ...rest,
      stream: true,

      chat_template_kwargs: {
        ...(body.chat_template_kwargs || {}),
        enable_thinking: true,
      },
    };

    const stream = await OpenAIChatStream(payload);

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error(
      "generate-chat-completion:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate completion",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

export default handler;