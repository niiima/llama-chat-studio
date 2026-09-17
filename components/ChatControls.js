import React, { useState } from "react";
import styled from "styled-components";

import {
  FiChevronDown,
  FiChevronUp,
  FiSettings,
  FiCpu,
  FiUser,
  FiSliders,
} from "react-icons/fi";

import ChatSettingsControl from "./AI/ChatSettingsControl";

const Wrapper = styled.div`
  width: 100%;
  flex-shrink: 0;

  border-top: 1px solid #374151;

  background: #111827;

  backdrop-filter: blur(12px);

  color: #f3f4f6;
`;

const Toolbar = styled.div`
  min-height: 46px;

  display: flex;
  align-items: center;

  gap: 7px;

  padding: 5px 10px;

  overflow-x: auto;

  color: #f3f4f6;
`;

const Control = styled.div`
  display: flex;
  align-items: center;

  gap: 5px;

  min-width: 0;

  color: #f3f4f6;
`;

const Label = styled.span`
  font-size: 0.66rem;

  color: #9ca3af;

  white-space: nowrap;
`;

const SelectWrapper = styled.div`
  position: relative;

  display: inline-flex;
  align-items: center;

  color: #f9fafb;

  svg {
    position: absolute;

    right: 6px;

    pointer-events: none;

    color: #9ca3af;

    opacity: 1;
  }
`;

const Select = styled.select`
  appearance: none;

  border: 1px solid #374151;

  border-radius: 7px;

  background: #1f2937;

  color: #f9fafb;

  padding: 6px 25px 6px 8px;

  font-size: 0.75rem;

  outline: none;

  cursor: pointer;

  max-width: 220px;

  color-scheme: dark;

  &:hover {
    border-color: #4b5563;

    background: #273449;
  }

  &:focus {
    border-color: #60a5fa;

    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
  }

  option {
    background: #1f2937;

    color: #f9fafb;
  }
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 3px;

  border-radius: 7px;

  border: 1px solid
    ${({ active }) =>
      active
        ? "#60a5fa"
        : "#374151"};

  background: ${({ active }) =>
    active
      ? "rgba(96, 165, 250, 0.12)"
      : "#1f2937"};

  color: #f3f4f6;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: #273449;

    border-color: #4b5563;

    color: #ffffff;
  }

  svg {
    color: currentColor;
  }
`;

const Spacer = styled.div`
  flex: 1;

  min-width: 5px;
`;

const SettingsPanel = styled.div`
  overflow: hidden;

  max-height: ${({ open }) =>
    open ? "900px" : "0px"};

  opacity: ${({ open }) =>
    open ? 1 : 0};

  transition:
    max-height 0.25s ease,
    opacity 0.18s ease;

  border-top: ${({ open }) =>
    open
      ? "1px solid #374151"
      : "none"};

  background: #111827;

  color: #f3f4f6;
`;

const SettingsInner = styled.div`
  padding: 10px 10px 14px;

  color: #f3f4f6;
`;

const SettingsTitle = styled.div`
  display: flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 8px;

  font-size: 0.72rem;

  font-weight: 600;

  color: #d1d5db;

  svg {
    color: #9ca3af;
  }
`;

const Prompt = styled.textarea`
  width: 100%;

  box-sizing: border-box;

  min-height: 70px;

  resize: vertical;

  border: 1px solid #374151;

  border-radius: 7px;

  padding: 8px 10px;

  font-family: inherit;

  font-size: 0.78rem;

  line-height: 1.45;

  outline: none;

  background: #1f2937;

  color: #f9fafb;

  caret-color: #f9fafb;

  color-scheme: dark;

  &::placeholder {
    color: #6b7280;

    opacity: 1;
  }

  &:hover {
    border-color: #4b5563;
  }

  &:focus {
    border-color: #60a5fa;

    box-shadow:
      0 0 0 1px
      rgba(96, 165, 250, 0.2);
  }
`;

const Field = styled.div`
  min-width: 0;

  color: #f3f4f6;
`;

const FieldLabel = styled.div`
  font-size: 0.65rem;

  color: #9ca3af;

  margin-bottom: 3px;
`;

const Toggle = styled.button`
  display: inline-flex;

  align-items: center;

  gap: 7px;

  border: 0;

  background: transparent;

  color: #e5e7eb;

  padding: 3px 0;

  cursor: pointer;

  font: inherit;

  user-select: none;

  &:hover {
    color: #ffffff;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const ToggleTrack = styled.span`
  position: relative;

  width: 30px;
  height: 17px;

  flex-shrink: 0;

  border-radius: 999px;

  background: ${({ active }) =>
    active
      ? "#3b82f6"
      : "#4b5563"};

  box-shadow:
    inset 0 0 0 1px
    rgba(255, 255, 255, 0.08);

  transition:
    background 0.15s ease;
`;

const ToggleThumb = styled.span`
  position: absolute;

  top: 2px;

  left: ${({ active }) =>
    active ? "15px" : "2px"};

  width: 13px;
  height: 13px;

  border-radius: 50%;

  background: #ffffff;

  box-shadow:
    0 1px 3px
    rgba(0, 0, 0, 0.4);

  transition:
    left 0.15s ease;
`;

const ToggleLabel = styled.span`
  font-size: 0.72rem;

  color: #d1d5db;

  white-space: nowrap;
`;

// function BooleanControl({
//   label,
//   value = false,
//   onChange,
//   disabled = false,
// }) {
//   const handleClick = () => {
//     if (typeof onChange !== "function") {
//       return;
//     }

//     onChange(!value);
//   };

//   return (
//     <Toggle
//       type="button"
//       disabled={disabled || typeof onChange !== "function"}
//       onClick={handleClick}
//       style={{
//         opacity:
//           disabled || typeof onChange !== "function"
//             ? 0.4
//             : 1,
//         cursor:
//           disabled || typeof onChange !== "function"
//             ? "not-allowed"
//             : "pointer",
//       }}
//     >
//       <ToggleTrack active={value}>
//         <ToggleThumb active={value} />
//       </ToggleTrack>

//       <ToggleLabel>
//         {label}
//       </ToggleLabel>
//     </Toggle>
//   );
// }

function BooleanControl({
  label,
  value = false,  
  onChange,
  disabled = false,
}) {
  const handleClick = () => {
    // console.log(`[BooleanControl] ${label}:`, {
    //   value,
    //   hasOnChange: typeof onChange === "function",
    //   disabled,
    // });

    if (disabled || typeof onChange !== "function") {
      return;
    }

    onChange(!value);
  };

  return (
    <Toggle
      type="button"
      disabled={disabled}
      onClick={handleClick}
    >
      <ToggleTrack active={value}>
        <ToggleThumb active={value} />
      </ToggleTrack>

      <ToggleLabel>{label}</ToggleLabel>
    </Toggle>
  );
}

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

  enableThinking,
  showReasoning,
  onThinkingChange,
  onShowReasoningChange,
}) {
  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  return (
    <Wrapper>
      {/* Compact controls */}
      <Toolbar>
        {/* MODEL */}
        <Control>
          <FiCpu
            size={14}
            opacity={0.55}
          />

          <Label>Model</Label>

          <SelectWrapper>
            <Select
              value={
                activeEngine?.key || ""
              }
              onChange={(event) =>
                onEngineChange(
                  event.target.value
                )
              }
            >
              {engines.map(
                (engine) => (
                  <option
                    key={engine.key}
                    value={engine.key}
                  >
                    {engine.name ||
                      engine.key}
                  </option>
                )
              )}
            </Select>

            <FiChevronDown
              size={12}
            />
          </SelectWrapper>
        </Control>

        {/* ACT */}
        <Control>
          <FiUser
            size={14}
            opacity={0.55}
          />

          <SelectWrapper>
            <Select
              value={act || ""}
              onChange={(event) =>
                onActChange(
                  event.target.value
                )
              }
            >
              <option value="">
                Default Act
              </option>

              <option value="coder">
                Coding Assistant
              </option>

              <option value="developer">
                Senior Developer
              </option>

              <option value="assistant">
                General Assistant
              </option>

              <option value="creative">
                Creative Assistant
              </option>
            </Select>

            <FiChevronDown
              size={12}
            />
          </SelectWrapper>
        </Control>

        <Spacer />

        {/* SETTINGS */}
        <IconButton
          type="button"
          active={settingsOpen}
          title={
            settingsOpen
              ? "Hide AI settings"
              : "Show AI settings"
          }
          onClick={() =>
            setSettingsOpen(
              (previous) =>
                !previous
            )
          }
        >
          <FiSliders size={16} />

          {settingsOpen ? (
            <FiChevronUp
              size={11}
            />
          ) : (
            <FiChevronDown
              size={11}
            />
          )}
        </IconButton>
      </Toolbar>

      {/* EXPANDABLE SETTINGS */}
      <SettingsPanel
        open={settingsOpen}
      >
        <SettingsInner>
          <SettingsTitle>
            <FiSettings size={13} />

            <span>
              AI Settings
            </span>
          </SettingsTitle>

          {/* SYSTEM PROMPT */}
          <Field>
            <FieldLabel>
              System Prompt
            </FieldLabel>

            <Prompt
              value={
                systemPrompt || ""
              }
              onChange={(event) =>
                onSystemPromptChange(
                  event.target.value
                )
              }
              onBlur={
                onSystemPromptBlur
              }
              placeholder="Define the behavior, personality and instructions for this conversation..."
            />
          </Field>

          {/* MODE + ACT */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginTop: 8,
              marginBottom: 10,
            }}
          >
            <Field>
              <FieldLabel>
                Mode
              </FieldLabel>

              <Select
                style={{
                  width: "100%",
                  maxWidth: "none",
                }}
                value={mode || ""}
                onChange={(event) =>
                  onModeChange(event.target.value)
                }
              >
                <option value="">
                  Default
                </option>
                <option value="chat">
                  Chat
                </option>
                <option value="coding">
                  Coding
                </option>
                <option value="reasoning">
                  Reasoning
                </option>
                <option value="creative">
                  Creative
                </option>
              </Select>
            </Field>

            <Field>
              <FieldLabel>
                Act
              </FieldLabel>

              <Select
                style={{
                  width: "100%",
                  maxWidth: "none",
                }}
                value={act || ""}
                onChange={(event) =>
                  onActChange(event.target.value)
                }
              >
                <option value="">
                  Default
                </option>
                <option value="coder">
                  Coding Assistant
                </option>
                <option value="developer">
                  Senior Developer
                </option>
                <option value="assistant">
                  General Assistant
                </option>
                <option value="creative">
                  Creative Assistant
                </option>
              </Select>
            </Field>
          </div>

          {/* THINKING */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <BooleanControl
              label="Thinking"
              value={enableThinking}
              onChange={onThinkingChange}
            />

            <BooleanControl
              label="Show reasoning"
              value={showReasoning}
              onChange={onShowReasoningChange}
            />
          </div>

          {/* EXISTING LEVA CONTROL */}
          <ChatSettingsControl />

        </SettingsInner>
      </SettingsPanel>
    </Wrapper>
  );
}