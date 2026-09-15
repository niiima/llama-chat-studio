export function isGarbage(text) {
  if (!text || typeof text !== "string") {
    return true;
  }

  const t = text.trim();

  if (t.length < 2) {
    return true;
  }

  if (t.includes("<html")) {
    return true;
  }

  if (t.includes("<!DOCTYPE")) {
    return true;
  }

  if (t.includes("scriptLoader")) {
    return true;
  }

  if (t.startsWith('<div style="')) {
    return true;
  }

  return false;
}

export function cleanMessageContent(text) {
  if (typeof text !== "string") {
    return "";
  }

  return text.trim();
}