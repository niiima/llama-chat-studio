import React from "react";
import { FiTrash2 } from "react-icons/fi";
import moment from "moment";

export default function ConversationListItem({
  chat,
  active,
  onClick,
  onDelete,
}) {
  const handleDelete = (event) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      `Delete "${chat.title || "New Chat"}"?`
    );

    if (confirmed) {
      onDelete();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginBottom: 3,
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={{
          flex: 1,

          minWidth: 0,

          padding: "10px 11px",

          border: "none",
          borderRadius: "8px",

          textAlign: "left",

          cursor: "pointer",

          fontWeight: active
            ? 600
            : 400,

          background: active
            ? "rgba(255,255,255,0.65)"
            : "rgba(255,255,255,0.16)",

          color: "#111",

          transition:
            "background 0.15s ease",
        }}
      >
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {chat.title || "New Chat"}
        </div>

        <div
          style={{
            marginTop: 3,
            fontSize: "0.68rem",
            opacity: 0.65,
          }}
        >
          {chat.messagesCount || 0}{" "}
          {chat.messagesCount === 1
            ? "message"
            : "messages"}

          {" · "}

          {chat.updatedAt
            ? moment(
                chat.updatedAt
              ).fromNow()
            : ""}
        </div>
      </button>

      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete conversation"
        title="Delete conversation"
        style={{
          width: 34,
          height: 34,

          flexShrink: 0,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          border: "none",
          borderRadius: "7px",

          cursor: "pointer",

          background:
            "rgba(255,255,255,0.18)",
        }}
      >
        <FiTrash2 size={15} />
      </button>
    </div>
  );
}