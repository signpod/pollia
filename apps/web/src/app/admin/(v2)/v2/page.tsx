"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { color, fontSize, radius, transition } from "./components/ui/tokens";
import { ADMIN_V2_ROUTES } from "./constants/routes";

const MENU_ITEMS = [
  {
    href: ADMIN_V2_ROUTES.USERS,
    label: "유저 관리",
    description: "모든 유저 정보 조회 및 탈퇴 관리",
  },
  {
    href: ADMIN_V2_ROUTES.CONTENTS,
    label: "콘텐츠 관리",
    description: "미션 조회, 수정 페이지 이동, 삭제",
  },
  { href: ADMIN_V2_ROUTES.BANNERS, label: "배너 관리", description: "배너 추가, 수정, 순서 변경" },
] as const;

export default function AdminV2Page() {
  return (
    <PageWrapper>
      <PageTitle>Admin V2</PageTitle>
      <CardGrid>
        {MENU_ITEMS.map(item => (
          <CardLink key={item.href} href={item.href}>
            <CardTitle>{item.label}</CardTitle>
            <CardDesc>{item.description}</CardDesc>
          </CardLink>
        ))}
      </CardGrid>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageTitle = styled.h1`
  font-size: ${fontSize["2xl"]};
  font-weight: 700;
  color: ${color.gray900};
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const CardLink = styled(Link)`
  display: block;
  padding: 24px;
  border: 1px solid ${color.gray200};
  border-radius: ${radius.lg};
  text-decoration: none;
  transition: background ${transition.fast};

  &:hover {
    background: ${color.gray50};
  }
`;

const CardTitle = styled.h2`
  font-size: ${fontSize.lg};
  font-weight: 600;
  color: ${color.gray900};
`;

const CardDesc = styled.p`
  margin-top: 4px;
  font-size: ${fontSize.sm};
  color: ${color.gray500};
`;
