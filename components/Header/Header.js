import { useContext } from "react";
import styled from "styled-components";

import PageNavigation from "./PageNavigation";
import HamburgerIcon from "../HamburgerIcon/HamburgerIcon";

import UIContext from "../../context/UIContext.js";

export const HeaderBar = styled.header`
  position: fixed;

  top: 0;
  left: 0;
  right: 0;

  z-index: 200;

  width: 100%;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  box-sizing: border-box;

  padding: 0 10px;

  background: #111827;
  color: #f3f4f6;

  border-bottom: 1px solid #374151;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;

  min-width: 0;
  height: 100%;

  gap: 9px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;

  height: 100%;
`;

const Divider = styled.div`
  width: 1px;
  height: 22px;

  margin: 0 2px;

  background: #374151;
`;

const Header = ({ children }) => {
  const {
    asideExpanded,
    setAsideExpand,
  } = useContext(UIContext);

  return (
    <HeaderBar>
      <LeftSection>
        <HamburgerIcon
          open={asideExpanded}
          handleClick={setAsideExpand}
        />

        <Divider />

        {children}
      </LeftSection>

      <RightSection>
        <PageNavigation />
      </RightSection>
    </HeaderBar>
  );
};

export default Header;