import React from "react";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";

const SIDEBAR_WIDTH = 300;

const Wrapper = styled(animated.aside)`
  position: fixed;

  top: 56px;
  left: 0;

  width: ${SIDEBAR_WIDTH}px;
  height: calc(100svh - 56px);

  z-index: 150;

  display: flex;
  flex-direction: column;

  box-sizing: border-box;

  overflow: hidden;

  background: #111827;
  color: #f3f4f6;

  border-right: 1px solid #374151;

  & > div {
    width: 100%;
    height: 100%;

    box-sizing: border-box;

    overflow-y: auto;

    padding: 12px 10px 16px;

    scrollbar-width: thin;
    scrollbar-color: #374151 transparent;
  }

  & > div::-webkit-scrollbar {
    width: 6px;
  }

  & > div::-webkit-scrollbar-track {
    background: transparent;
  }

  & > div::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 999px;
  }

  & > div::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
  }
`;

export default function Sidebar({
  show,
  children,
}) {
  const style = useSpring({
    transform: show
      ? "translateX(0)"
      : `translateX(-${SIDEBAR_WIDTH}px)`,

    opacity: show ? 1 : 0,

    config: {
      tension: 280,
      friction: 30,
    },
  });

  return (
    <Wrapper style={style}>
      <div>{children}</div>
    </Wrapper>
  );
}