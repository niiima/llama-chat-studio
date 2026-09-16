import React from "react";

export default function ChatControls({
  engines,
  activeEngine,
  onEngineChange,

  systemPrompt,
  onSystemPromptChange,
  onSystemPromptBlur,

  mode,
  act,
  onModeChange,
  onActChange,
}) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(0,0,0,0.02)",
        flexShrink: 0,
      }}
    >
      {/* Engine */}
      <div style={{ marginBottom: 8 }}>
        <label
          style={{
            display: "block",
            fontSize: "0.7rem",
            opacity: 0.65,
            marginBottom: 3,
          }}
        >
          Engine
        </label>

        <select
          value={activeEngine?.key || ""}
          onChange={(event) =>
            onEngineChange(event.target.value)
          }
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 5,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "white",
          }}
        >
          {engines.map((engine) => (
            <option
              key={engine.key}
              value={engine.key}
            >
              {engine.name || engine.key}
            </option>
          ))}
        </select>
      </div>

      {/* System prompt */}
      <div style={{ marginBottom: 8 }}>
        <label
          style={{
            display: "block",
            fontSize: "0.7rem",
            opacity: 0.65,
            marginBottom: 3,
          }}
        >
          System Prompt
        </label>

        <textarea
          value={systemPrompt}
          onChange={(event) =>
            onSystemPromptChange(event.target.value)
          }
          onBlur={onSystemPromptBlur}
          rows={3}
          placeholder="Define how the assistant should behave..."
          style={{
            width: "100%",
            resize: "vertical",
            padding: "6px 8px",
            borderRadius: 5,
            border: "1px solid rgba(0,0,0,0.15)",
          }}
        />
      </div>

      {/* Mode / Act */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.7rem",
              opacity: 0.65,
              marginBottom: 3,
            }}
          >
            Mode
          </label>

          <input
            value={mode || ""}
            onChange={(event) =>
              onModeChange(event.target.value)
            }
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 5,
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.7rem",
              opacity: 0.65,
              marginBottom: 3,
            }}
          >
            Act
          </label>

          <input
            value={act || ""}
            onChange={(event) =>
              onActChange(event.target.value)
            }
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 5,
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          />
        </div>
      </div>
    </div>
  );
}