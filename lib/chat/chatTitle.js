export function createChatTitle(content) {
  if (!content || typeof content !== "string") {
    return "New Chat";
  }

  const title = content
    .replace(/\s+/g, " ")
    .trim();

  if (!title) {
    return "New Chat";
  }

  if (title.length <= 60) {
    return title;
  }

  return `${title.substring(0, 57)}...`;
}