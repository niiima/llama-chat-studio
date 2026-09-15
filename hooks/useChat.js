import {
  useCallback,
  useContext,
  useState,
} from "react";

import ChatContext from "../context/ChatContext";
import AIContext from "../context/AIContext";

export default function useChat({
  activeEngine,
  systemPrompt,
}) {
  const {
    activeChatId,
    messages,
    addMessage,
    saveMessage,
    setIsLoading,
    updateChatInList,
  } = useContext(ChatContext);

  const { AIstate } = useContext(AIContext);

  const [stream, setStream] = useState("");

  const sendMessage = useCallback(
    async (content) => {
      if (!content?.trim()) {
        return;
      }

      if (!activeChatId) {
        console.error("No active chat");
        return;
      }

      if (!activeEngine?.key) {
        console.error("No active engine");
        return;
      }

      setIsLoading(true);
      setStream("");

      const userContent = content.trim();

      const settings = {
        systemPrompt: systemPrompt || "",

        temperature:
          AIstate.temperature ??
          activeEngine.temperature ??
          0.6,

        top_p:
          AIstate.top_p ??
          activeEngine.top_p ??
          0.95,

        top_k:
          AIstate.top_k ??
          activeEngine.top_k ??
          40,

        frequency_penalty:
          AIstate.frequency_penalty ?? 0,

        presence_penalty:
          AIstate.presence_penalty ?? 0,

        max_response_tokens:
          AIstate.max_response_tokens ??
          activeEngine.max_response_tokens ??
          2048,
      };

      try {
        // --------------------------------------------------
        // 1. Save user message
        // --------------------------------------------------

        const userResponse = await fetch(
          `/api/chats/${activeChatId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              role: "user",
              content: userContent,
              timestamp: new Date().toISOString(),
            //   engine: activeEngine.key,
            }),
          }
        );

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error(
            userData.message ||
              "Failed to save user message"
          );
        }

        // Add the actual MongoDB message to UI
        if (userData.message) {
          addMessage(userData.message);
        }

        // --------------------------------------------------
        // 2. Build generation context
        // --------------------------------------------------

        const history = [
          ...(messages || []),
          userData.message,
        ].filter(Boolean);

        const generationMessages = [];

        if (settings.systemPrompt?.trim()) {
        generationMessages.push({
            role: "system",
            content: settings.systemPrompt.trim(),
        });
        }

        generationMessages.push(
        ...history.map((message) => ({
            role: message.role,
            content: message.content,
        }))
        );

        // --------------------------------------------------
        // 3. Generate AI response
        // --------------------------------------------------

        const response = await fetch(
          "/api/generate-chat-completion",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: activeEngine.key,
              messages: generationMessages,

              temperature:
                settings.temperature,

              top_p: settings.top_p,

              top_k: settings.top_k,

              frequency_penalty:
                settings.frequency_penalty,

              presence_penalty:
                settings.presence_penalty,

              max_tokens:
                settings.max_response_tokens,

              stream: true,

              chat_template_kwargs: {
                enable_thinking: true,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText =
            await response.text();

          throw new Error(
            errorText ||
              "Failed to generate response"
          );
        }

        if (!response.body) {
          throw new Error(
            "Response has no body"
          );
        }

        // --------------------------------------------------
        // 4. Read streaming response
        // --------------------------------------------------

        const reader =
          response.body.getReader();

        const decoder =
          new TextDecoder();

        let fullCompletion = "";

        while (true) {
          const {
            value,
            done,
          } = await reader.read();

          if (done) {
            break;
          }

          const chunk =
            decoder.decode(value, {
              stream: true,
            });

          fullCompletion += chunk;

          setStream(
            (previous) =>
              previous + chunk
          );
        }

        fullCompletion +=
          decoder.decode();

        const completion =
          fullCompletion.trim();

        // --------------------------------------------------
        // 5. Save assistant message
        // --------------------------------------------------

        if (completion) {
          const assistantResponse =
            await fetch(
              `/api/chats/${activeChatId}/messages`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  role: "assistant",
                  content: completion,
                  timestamp:
                    new Date().toISOString(),
                  engine: activeEngine.key,
                }),
              }
            );

          const assistantData =
            await assistantResponse.json();

          if (!assistantResponse.ok) {
            throw new Error(
              assistantData.message ||
                "Failed to save assistant message"
            );
          }

          if (assistantData.message) {
            addMessage(
              assistantData.message
            );
          }

          // Update sidebar
          if (assistantData.chat) {
            updateChatInList({
              chatId: activeChatId,
              title: assistantData.chat.title,
              updatedAt:
                assistantData.chat.updatedAt,
              messagesCount:
                assistantData.chat.messagesCount,
            });
          }
        }

        setStream("");
      } catch (error) {
        console.error(
          "sendMessage:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeChatId,
      messages,
      activeEngine,
      systemPrompt,
      AIstate,
      addMessage,
      saveMessage,
      setIsLoading,
      updateChatInList,
    ]
  );

  return {
    stream,
    sendMessage,
  };
}