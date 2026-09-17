import React from "react";
import styled from "styled-components";
import { FiPlus } from "react-icons/fi";

const Button = styled.button`
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-height: 40px;

  padding: 9px 14px;

  border: 1px solid rgba(96, 165, 250, 0.4);
  border-radius: 8px;

  background: rgba(96, 165, 250, 0.1);
  color: #f3f4f6;

  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: rgba(96, 165, 250, 0.16);
    border-color: rgba(96, 165, 250, 0.65);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }

  svg {
    flex-shrink: 0;
  }
`;

export default function NewChatButton({
  onClick,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
    >
      <FiPlus size={16} />
      <span>New Conversation</span>
    </Button>
  );
}