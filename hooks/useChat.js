import { useCallback, useContext, useState } from "react";
import ChatContext from "../context/ChatContext";
import AIContext from "../context/AIContext";

export default function useChat({
  activeEngine,
  systemPrompt,
}) {
  const {
    activeChatId,
    messages,
    saveMessage,
    setIsLoading,
    updateChatInList,
  } = useContext(ChatContext);

  const { AIstate } = useContext(AIContext);

  const [stream, setStream] = useState("");

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = useCallback(
    async (content) => {
      if (!content?.trim()) return;

      if (!activeChatId) {
        console.error("No active chat");
        return;
      }

      if (!activeEngine?.key) {
        console.error("No active engine");
        return;
      }

      const userContent = content.trim();

      setIsLoading(true);
      setStream("");

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
        // ========================================
        // 1. SAVE USER MESSAGE
        // ========================================

        const userData = await saveMessage({
          role: "user",
          content: userContent,
          timestamp: new Date().toISOString(),
        });

        const savedUserMessage =
          userData?.message;

        /*
         * Build generation history from the existing
         * conversation plus the newly saved user message.
         *
         * IMPORTANT:
         * We don't use the React `messages` state here
         * after saveMessage because React state updates
         * asynchronously.
         */

        const history = [
          ...(messages || []),
          savedUserMessage,
        ].filter(Boolean);

        // ========================================
        // 2. BUILD GENERATION MESSAGES
        // ========================================

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

        // ========================================
        // 3. GENERATE RESPONSE
        // ========================================

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

              temperature: settings.temperature,
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
            "Response body is not available"
          );
        }

        // ========================================
        // 4. READ STREAM
        // ========================================

        const reader =
          response.body.getReader();

        const decoder = new TextDecoder();

        let completion = "";

        while (true) {
          const {
            value,
            done,
          } = await reader.read();

          if (done) break;

          const chunk =
            decoder.decode(value, {
              stream: true,
            });

          completion += chunk;

          setStream(completion);
        }

        completion = completion.trim();

        if (!completion) {
          throw new Error(
            "The assistant returned an empty response"
          );
        }

        // ========================================
        // 5. SAVE ASSISTANT MESSAGE
        // ========================================

        const assistantData =
          await saveMessage({
            role: "assistant",
            content: completion,
            timestamp:
              new Date().toISOString(),

            /*
             * This is the important part:
             *
             * engine belongs ONLY to assistant messages.
             *
             * It records the engine that actually
             * generated this response.
             */
            engine: activeEngine.key,
          });

        // ========================================
        // 6. UPDATE SIDEBAR
        // ========================================

        if (assistantData?.chat) {
          updateChatInList(
            assistantData.chat
          );
        }

        setStream("");

        return completion;
      } catch (error) {
        console.error(
          "sendMessage:",
          error
        );

        /*
         * Keep the error visible in the console,
         * but don't permanently leave streaming text
         * in the UI.
         */
        setStream("");

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeChatId,
      activeEngine,
      systemPrompt,
      AIstate,
      messages,
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