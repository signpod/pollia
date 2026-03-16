"use client";

import styled from "@emotion/styled";
import { V2Sidebar } from "./V2Sidebar";
import { SidebarMainContent, SidebarProvider, SidebarToggle } from "./ui/Sidebar";
import { color } from "./ui/tokens";

interface V2LayoutProps {
  children: React.ReactNode;
}

export function V2Layout({ children }: V2LayoutProps) {
  return (
    <SidebarProvider>
      <V2Sidebar />
      <SidebarMainContent>
        <Header>
          <SidebarToggle />
        </Header>
        <ContentArea>{children}</ContentArea>
      </SidebarMainContent>
    </SidebarProvider>
  );
}

const Header = styled.header`
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 8px;
  border-bottom: 1px solid ${color.gray200};
  flex-shrink: 0;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: auto;
  padding: 28px;
`;
