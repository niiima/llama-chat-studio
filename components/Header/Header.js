import { useContext } from "react";
import styled from "styled-components";

// import SvgSettingButton from "../svgs/SvgSettingButton";
import PageNavigation from "./PageNavigation";
// import LogoDropSvg from "../svgs/LogoDropSvg";
import HamburgerIcon from "../HamburgerIcon/HamburgerIcon";
import UIContext from "../../context/UIContext.js";

export const HeaderBar = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: middle;
  background: #111111;
  border-bottom: 1px solid #222;
  height: 8 svh;
  width: 100%;
  padding: 0 0.1;
`;

const Header = ({ children }) => {
  const { asideExpanded, setAsideExpand } = useContext(UIContext);

  return (
    <HeaderBar>
      {/* HamburgerIcon is now first, so it appears on the left */}
      <HamburgerIcon
        color='white'
        background='white'
        open={asideExpanded}
        handleClick={setAsideExpand}
      />
      
      {/* The content div is now second, so it appears on the right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {children}
        <PageNavigation />
      </div>
    </HeaderBar>
  );
};

export default Header;