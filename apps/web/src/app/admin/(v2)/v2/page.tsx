"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "next/link";
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
  {
    href: ADMIN_V2_ROUTES.BANNERS,
    label: "배너 관리",
    description: "배너 추가, 수정, 순서 변경",
  },
] as const;

export default function AdminV2Page() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h1">Admin V2</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {MENU_ITEMS.map(item => (
          <Card key={item.href} variant="outlined">
            <CardActionArea component={Link} href={item.href} sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h2" gutterBottom>
                  {item.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
