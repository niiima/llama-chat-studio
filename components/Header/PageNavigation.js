import { MdMultipleStop } from "react-icons/md";
import { useContext } from "react";

import styled from "styled-components";
import Link from "next/link";

import AIContext from "../../context/AIContext";

const ICON_SIZE = 17;

const NavigationWrapper = styled.nav`
  display: flex;
  align-items: center;

  height: 100%;

  padding: 0 4px;
`;

const LinkItem = styled.div`
  height: 34px;

  display: flex;
  align-items: center;

  border-radius: 7px;

  transition:
    background 0.15s ease,
    color 0.15s ease;

  a {
    height: 100%;

    display: flex;
    align-items: center;
    gap: 7px;

    padding: 0 10px;

    box-sizing: border-box;

    color: #9ca3af;

    text-decoration: none;

    font-size: 0.75rem;
    font-weight: 500;

    transition: color 0.15s ease;
  }

  &:hover {
    background: #1f2937;

    a {
      color: #f3f4f6;
    }
  }

  &.active {
    background: #1f2937;

    a {
      color: #f3f4f6;
      font-weight: 600;
    }

    svg {
      color: #93c5fd;
    }
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
  const {
    activeRoute,
    setActiveRoute,
  } = useContext(AIContext);

  return (
    <NavigationWrapper>
      {routes.map((route) => (
        <LinkItem
          key={route.url}
          className={
            activeRoute === route.id
              ? "active"
              : ""
          }
        >
          <Link
            href={route.url}
            onClick={(event) => {
              if (route.url === "/") {
                event.preventDefault();
              }

              setActiveRoute(route.id);
            }}
          >
            {route.icon}
            <span>{route.text}</span>
          </Link>
        </LinkItem>
      ))}
    </NavigationWrapper>
  );
};

export default PageNavigation;