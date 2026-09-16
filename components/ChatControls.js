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

  border-top: 1px solid rgba(0, 0, 0, 0.08);

  background: rgba(255, 255, 255, 0.96);

  backdrop-filter: blur(12px);
`;

const Toolbar = styled.div`
  min-height: 46px;

  display: flex;
  align-items: center;

  gap: 7px;

  padding: 5px 10px;

  overflow-x: auto;
`;

const Control = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  min-width: 0;
`;

const Label = styled.span`
  font-size: 0.66rem;
  opacity: 0.55;
  white-space: nowrap;
`;

const SelectWrapper = styled.div`
  position: relative;

  display: inline-flex;
  align-items: center;

  svg {
    position: absolute;
    right: 6px;
    pointer-events: none;
    opacity: 0.45;
  }
`;

const Select = styled.select`
  appearance: none;

  border: 1px solid rgba(0, 0, 0, 0.12);

  border-radius: 7px;

  background: rgba(255, 255, 255, 0.9);

  color: inherit;

  padding: 6px 25px 6px 8px;

  font-size: 0.75rem;

  outline: none;

  cursor: pointer;

  max-width: 220px;

  &:hover {
    border-color: rgba(100, 80, 220, 0.3);
  }

  &:focus {
    border-color: rgba(100, 80, 220, 0.55);
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
        ? "rgba(100,80,220,.4)"
        : "rgba(0,0,0,.12)"};

  background: ${({ active }) =>
    active
      ? "rgba(100,80,220,.1)"
      : "transparent"};

  color: inherit;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: rgba(100, 80, 220, 0.08);
  }
`;

const Spacer = styled.div`
  flex: 1;
  min-width: 5px;
`;

const SettingsPanel = styled.div`
  overflow: hidden;

  max-height: ${({ open }) =>
    open ? "600px" : "0px"};

  opacity: ${({ open }) =>
    open ? 1 : 0};

  transition:
    max-height 0.25s ease,
    opacity 0.18s ease;

  border-top: ${({ open }) =>
    open
      ? "1px solid rgba(0,0,0,.06)"
      : "none"};
`;

const SettingsInner = styled.div`
  padding: 8px 10px 12px;
`;

const SettingsTitle = styled.div`
  display: flex;
  align-items: center;

  gap: 6px;

  margin-bottom: 8px;

  font-size: 0.72rem;

  font-weight: 600;

  opacity: 0.65;
`;

const Prompt = styled.textarea`
  width: 100%;

  box-sizing: border-box;

  min-height: 70px;

  resize: vertical;

  border: 1px solid rgba(0, 0, 0, 0.12);

  border-radius: 7px;

  padding: 8px 10px;

  font-family: inherit;

  font-size: 0.78rem;

  line-height: 1.45;

  outline: none;

  background: white;

  color: inherit;

  &:focus {
    border-color: rgba(100, 80, 220, 0.5);
  }
`;

const Field = styled.div`
  min-width: 0;
`;

const FieldLabel = styled.div`
  font-size: 0.65rem;

  opacity: 0.55;

  margin-bottom: 3px;
`;

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
              gridTemplateColumns:
                "1fr 1fr",
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
                  onModeChange(
                    event.target.value
                  )
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
                  onActChange(
                    event.target.value
                  )
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

          {/* YOUR EXISTING LEVA CONTROL */}
          <ChatSettingsControl />
        </SettingsInner>
      </SettingsPanel>
    </Wrapper>
  );
}