import React, { useState } from "react";

import {
  FiChevronDown,
  FiChevronRight,
  FiCpu,
} from "react-icons/fi";

export default function ThinkingBlock({
  reasoning,
  isStreaming = false,
  visible = true,
}) {
  const [expanded, setExpanded] = useState(false);

  if (!visible || !reasoning?.trim()) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: 10,
        borderRadius: 8,
        background:
          "rgba(127, 127, 127, 0.08)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() =>
          setExpanded((previous) => !previous)
        }
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 7,
          border: 0,
          background: "transparent",
          color: "inherit",
          cursor: "pointer",
          padding: "8px 10px",
          textAlign: "left",
        }}
      >
        {expanded ? (
          <FiChevronDown size={15} />
        ) : (
          <FiChevronRight size={15} />
        )}

        <FiCpu size={14} />

        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            opacity: 0.75,
          }}
        >
          {isStreaming
            ? "Thinking…"
            : "Thinking"}
        </span>
      </button>

      {expanded && (
        <div
          style={{
            padding:
              "0 12px 12px 34px",
            fontSize: 13,
            lineHeight: 1.6,
            opacity: 0.7,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {reasoning}
        </div>
      )}
    </div>
  );
}