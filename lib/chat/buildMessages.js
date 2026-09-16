import { encode } from "gpt-tokenizer";
import { isGarbage } from "./sanitizeMessage";

export function buildMessages({
  history,
  systemPrompt,
  maxContext = 8192,
  maxReply = 2048,
}) {
  const safetyMargin = 256;

  const availableForHistory = Math.max(
    0,
    maxContext - maxReply - safetyMargin
  );

  const historyMessages = [];

  let usedTokens = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    const message = history[i];

    if (!message) {
      continue;
    }

    const content = message.content;

    if (isGarbage(content)) {
      continue;
    }

    if (!["user", "assistant"].includes(message.role)) {
      continue;
    }

    let tokens;

    try {
      tokens = encode(content).length;
    } catch {
      tokens = Math.ceil(content.length / 4);
    }

    if (usedTokens + tokens > availableForHistory) {
      break;
    }

    historyMessages.unshift({
      role: message.role,
      content,
    });

    usedTokens += tokens;
  }

  const messages = [];

  if (systemPrompt?.trim()) {
    messages.push({
      role: "system",
      content: systemPrompt.trim(),
    });
  }

  messages.push(...historyMessages);

  return messages;
}