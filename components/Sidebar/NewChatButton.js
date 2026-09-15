import React from "react";

export default function NewChatButton({
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
    >
      + New Chat
    </button>
  );
}