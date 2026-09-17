import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Leva, useControls } from "leva";

import AIContext from "../../context/AIContext";

export default function ChatSettingsControl() {
  const {
    setAIState,
    activeEngine,
  } = useContext(AIContext);

  const engine = activeEngine;

  const defaults = {
    max_tokens:
      engine?.maxTokens ?? 8192,

    max_response_tokens:
      engine?.max_response_tokens ?? 2048,

    temperature:
      engine?.temperature ?? 0.6,

    top_p:
      engine?.top_p ?? 0.95,

    top_k:
      engine?.top_k ?? 40,

    frequency_penalty:
      engine?.frequency_penalty ?? 0,

    presence_penalty:
      engine?.presence_penalty ?? 0,
  };

  const [autoHide, setAutoHide] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const containerRef = useRef(null);

  const [values] = useControls(
    "Generation",
    () => ({
      max_tokens: {
        value: defaults.max_tokens,
        min: 512,
        max: defaults.max_tokens,
        step: 64,
      },

      max_response_tokens: {
        value: defaults.max_response_tokens,
        min: 128,
        max: 8192,
        step: 64,
      },

      temperature: {
        value: defaults.temperature,
        min: 0,
        max: 2,
        step: 0.01,
      },

      top_p: {
        value: defaults.top_p,
        min: 0,
        max: 1,
        step: 0.01,
      },

      top_k: {
        value: defaults.top_k,
        min: 0,
        max: 100,
        step: 1,
      },

      frequency_penalty: {
        value: defaults.frequency_penalty,
        min: -2,
        max: 2,
        step: 0.01,
      },

      presence_penalty: {
        value: defaults.presence_penalty,
        min: -2,
        max: 2,
        step: 0.01,
      },
    }),
    [engine?.key]
  );

  useEffect(() => {
    if (!values) return;

    setAIState((previous) => {
      const next = {
        ...previous,

        max_tokens:
          values.max_tokens,

        max_response_tokens:
          values.max_response_tokens,

        temperature:
          values.temperature,

        top_p:
          values.top_p,

        top_k:
          values.top_k,

        frequency_penalty:
          values.frequency_penalty,

        presence_penalty:
          values.presence_penalty,
      };

      const unchanged =
        previous.max_tokens ===
          next.max_tokens &&
        previous.max_response_tokens ===
          next.max_response_tokens &&
        previous.temperature ===
          next.temperature &&
        previous.top_p ===
          next.top_p &&
        previous.top_k ===
          next.top_k &&
        previous.frequency_penalty ===
          next.frequency_penalty &&
        previous.presence_penalty ===
          next.presence_penalty;

      return unchanged
        ? previous
        : next;
    });
  }, [
    values?.max_tokens,
    values?.max_response_tokens,
    values?.temperature,
    values?.top_p,
    values?.top_k,
    values?.frequency_penalty,
    values?.presence_penalty,
    setAIState,
  ]);

  /*
   * Collapse when clicking outside.
   */
  useEffect(() => {
    if (!autoHide || collapsed) {
      return;
    }

    const handlePointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setCollapsed(true);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [autoHide, collapsed]);

  /*
   * Keep the panel expanded while auto-hide is disabled.
   */
  useEffect(() => {
    if (!autoHide) {
      setCollapsed(false);
    }
  }, [autoHide]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        position: "relative",
        color: "#e5e7eb",
      }}
    >
      {/* Local Leva theme */}
      <style jsx global>{`
        .chat-settings-leva {
          --leva-colors-elevation1: #111827;
          --leva-colors-elevation2: #1f2937;
          --leva-colors-elevation3: #374151;

          --leva-colors-accent1: #60a5fa;
          --leva-colors-accent2: #3b82f6;
          --leva-colors-accent3: #2563eb;

          --leva-colors-highlight1: #f9fafb;
          --leva-colors-highlight2: #e5e7eb;
          --leva-colors-highlight3: #d1d5db;

          --leva-colors-folderWidget: #1f2937;
          --leva-colors-folderTitle: #f3f4f6;
          --leva-colors-folderContent: #111827;

          --leva-colors-numberInput: #111827;
          --leva-colors-stringInput: #111827;

          --leva-fonts-mono:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;
        }

        .chat-settings-leva {
          color: #e5e7eb !important;
        }

        .chat-settings-leva input,
        .chat-settings-leva textarea {
          color: #f9fafb !important;
          background: #111827 !important;
        }

        .chat-settings-leva button {
          color: #f3f4f6 !important;
        }

        .chat-settings-leva svg {
          color: #d1d5db !important;
          fill: currentColor;
        }

        /*
         * Leva's root wrapper.
         */
        .chat-settings-leva > div {
          width: 100% !important;
          max-width: none !important;
        }

        /*
         * Make the title bar clearly visible.
         */
        .chat-settings-leva [class*="title"] {
          color: #f9fafb !important;
        }
      `}</style>

      {/* Custom header / auto-hide control */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 38,
          padding: "0 10px",
          background: "#111827",
          border: "1px solid #374151",
          borderRadius: collapsed ? 8 : "8px 8px 0 0",
          color: "#f9fafb",
          boxSizing: "border-box",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setCollapsed((previous) => !previous)
          }
          aria-label={
            collapsed
              ? "Expand generation settings"
              : "Collapse generation settings"
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            minWidth: 0,
            padding: 0,
            border: 0,
            background: "transparent",
            color: "#f9fafb",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
              background: "#374151",
              color: "#f9fafb",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {collapsed ? "›" : "⌄"}
          </span>

          <span>Generation</span>
        </button>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#d1d5db",
            fontSize: 11,
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <input
            type="checkbox"
            checked={autoHide}
            onChange={(event) => {
              setAutoHide(event.target.checked);
            }}
            style={{
              accentColor: "#3b82f6",
              cursor: "pointer",
            }}
          />

          Auto hide
        </label>
      </div>

      {!collapsed && (
        <div
          className="chat-settings-leva"
          style={{
            width: "100%",
            border: "1px solid #374151",
            borderTop: 0,
            borderRadius: "0 0 8px 8px",
            overflow: "hidden",
          }}
        >
          <Leva
            fill
            flat={false}
            oneLineLabels
            hideTitleBar={true}
            collapsed={false}
            hidden={false}
          />
        </div>
      )}
    </div>
  );
}