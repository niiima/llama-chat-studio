import React from "react";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";

const Wrapper = styled(animated.aside)`
  position: fixed;

  top: 8svh;
  left: 0;

  width: 20em;
  height: 92svh;

  display: flex;
  flex-direction: column;

  z-index: 100;

  overflow: hidden;

  background: linear-gradient(
    135deg,
    #11e7df 0%,
    #39f 50%,
    #b490ca 100%
  );

  & > div {
    height: 100%;
    overflow-y: auto;
  }

  & > div::-webkit-scrollbar {
    width: 8px;
  }

  & > div::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.12);
  }

  & > div::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.25);
    border-radius: 8px;
  }
`;

export default function Sidebar({
  show,
  children,
}) {
  const style = useSpring({
    left: show ? "0%" : "-100%",
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