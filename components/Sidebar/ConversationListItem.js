import React from "react";

export default function ConversationListItem({
  chat,
  active,
  onClick,
  onDelete,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={{
          flex: 1,
          textAlign: "left",
          fontWeight: active
            ? "bold"
            : "normal",
        }}
      >
        {chat.title ||
          "New Chat"}
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();

          if (
            window.confirm(
              "Delete this conversation?"
            )
          ) {
            onDelete();
          }
        }}
      >
        ×
      </button>
    </div>
  );
}