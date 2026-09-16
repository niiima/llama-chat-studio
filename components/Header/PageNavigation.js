import { MdAirlineStops, MdMultipleStop } from "react-icons/md";
import { useContext } from "react";
import { Flex } from "../Atoms/Flex";
import { FlexItem } from "../Atoms/FlexItem";
// import { GiAbstract037 } from "react-icons/gi";
import styled from "styled-components";
import Link from "next/link";
import AIContext from "../../context/AIContext";
// import { FcPicture } from "react-icons/fc";
// import { BsSpotify } from "react-icons/bs";
// import { VscGithubAction } from "react-icons/vsc";

const ICON_SIZE = 26;
const NavigationWrapper = styled(Flex)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1rem;
`;

const LinkItem = styled(FlexItem)`
  font-size: 14px;
  color: #ccc;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: white;
  }

  &.active {
    color: white;
    font-weight: 600;
  }
`;

const routes = [
  {
    id: 0,
    url: "/",
    icon: <MdMultipleStop size={ICON_SIZE} />,
    text: "Conversation",
  },
];

const PageNavigation = () => {
  const { activeRoute, setActiveRoute } = useContext(AIContext);

  return (
    <NavigationWrapper>
      {routes.map((route) => (
        <LinkItem
          key={route.url}
          className={`${activeRoute === route.id ? "active" : ""}`}
        >
          <Link
            href={route.url}
            onClick={(e) => {
              e.preventDefault();
              setActiveRoute(route.id);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}
          >
            {route.icon}
            <span className="text-container">{route.text}</span>
          </Link>
        </LinkItem>
      ))}
    </NavigationWrapper>
  );
};
export default PageNavigation;

