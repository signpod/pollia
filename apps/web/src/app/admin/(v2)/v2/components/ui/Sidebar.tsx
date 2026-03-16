"use client";

import styled from "@emotion/styled";
import { type ReactNode, createContext, useContext, useState } from "react";
import { color, fontSize, radius, transition } from "./tokens";

interface SidebarContextValue {
  expanded: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  expanded: true,
  toggle: () => {},
});

export function useSidebarState() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <SidebarContext.Provider value={{ expanded, toggle: () => setExpanded(p => !p) }}>
      <LayoutWrapper>{children}</LayoutWrapper>
    </SidebarContext.Provider>
  );
}

const LayoutWrapper = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

export function SidebarToggle() {
  const { toggle } = useSidebarState();
  return (
    <ToggleButton type="button" onClick={toggle} aria-label="Toggle sidebar">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </ToggleButton>
  );
}

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: ${radius.md};
  background: transparent;
  color: ${color.gray600};
  cursor: pointer;
  &:hover {
    background: ${color.gray100};
  }
`;

export function SidebarPanel({ children }: { children: ReactNode }) {
  const { expanded } = useSidebarState();
  return <SidebarAside $expanded={expanded}>{children}</SidebarAside>;
}

const SidebarAside = styled.aside<{ $expanded: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ $expanded }) => ($expanded ? "240px" : "56px")};
  min-width: ${({ $expanded }) => ($expanded ? "240px" : "56px")};
  background: ${color.white};
  border-right: 1px solid ${color.gray200};
  transition: width ${transition.normal}, min-width ${transition.normal};
  overflow: hidden;
`;

export const SidebarHeader = styled.div`
  padding: 12px;
  border-bottom: 1px solid ${color.gray100};
`;

export const SidebarBody = styled.div`
  flex: 1;
  padding: 8px;
  overflow-y: auto;
`;

export const SidebarFooter = styled.div`
  padding: 8px;
  border-top: 1px solid ${color.gray100};
`;

export function SidebarMainContent({ children }: { children: ReactNode }) {
  return <MainArea>{children}</MainArea>;
}

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

interface SidebarNavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  href?: string;
}

export function SidebarNavItem({
  icon,
  label,
  active,
  expanded = true,
  onClick,
  href,
}: SidebarNavItemProps) {
  const content = (
    <NavItem $active={!!active} $expanded={expanded} onClick={onClick} title={label}>
      <IconWrap>{icon}</IconWrap>
      {expanded && <NavLabel>{label}</NavLabel>}
    </NavItem>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: "none" }}>
        {content}
      </a>
    );
  }
  return content;
}

const NavItem = styled.div<{ $active: boolean; $expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${({ $expanded }) => ($expanded ? "8px 12px" : "8px")};
  justify-content: ${({ $expanded }) => ($expanded ? "flex-start" : "center")};
  border-radius: ${radius.md};
  cursor: pointer;
  font-size: ${fontSize.sm};
  color: ${({ $active }) => ($active ? color.blue700 : color.gray600)};
  background: ${({ $active }) => ($active ? color.blue50 : "transparent")};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  transition: all ${transition.fast};

  &:hover {
    background: ${({ $active }) => ($active ? color.blue50 : color.gray100)};
  }
`;

const IconWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;

  & > svg {
    width: 18px;
    height: 18px;
  }
`;

const NavLabel = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
