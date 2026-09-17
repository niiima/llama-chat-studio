import React from "react";
import styled from "styled-components";
import { FiMenu, FiX } from "react-icons/fi";

const Button = styled.button`
  width: 36px;
  height: 36px;

  flex-shrink: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: 1px solid
    ${({ open }) =>
      open
        ? "rgba(96, 165, 250, 0.35)"
        : "#374151"};

  border-radius: 8px;

  background:
    ${({ open }) =>
      open
        ? "rgba(96, 165, 250, 0.1)"
        : "#1f2937"};

  color: #f3f4f6;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: #273449;
    border-color: #4b5563;
    color: #fff;
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }

  svg {
    transition: transform 0.18s ease;
  }
`;

function HamburgerIcon({
  handleClick,
  open,
}) {
  return (
    <Button
      type="button"
      open={open}
      onClick={handleClick}
      aria-label={
        open
          ? "Close conversation sidebar"
          : "Open conversation sidebar"
      }
      aria-expanded={open}
      title={
        open
          ? "Close sidebar"
          : "Open sidebar"
      }
    >
      {open ? (
        <FiX size={18} />
      ) : (
        <FiMenu size={18} />
      )}
    </Button>
  );
}

export default HamburgerIcon;