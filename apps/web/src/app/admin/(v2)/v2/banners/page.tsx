"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useAdminBanners } from "../hooks/banner/use-admin-banners";
import { useReorderBanners } from "../hooks/banner/use-reorder-banners";
import { BannerAddRow } from "./components/BannerAddRow";
import { BannerRow } from "./components/BannerRow";

export default function AdminV2BannersPage() {
  const { data, isLoading } = useAdminBanners();
  const reorderMutation = useReorderBanners();
  const [editingId, setEditingId] = useState<string | null>(null);

  const banners = data?.data ?? [];

  const handleMove = (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const current = banners[index];
    const target = banners[swapIndex];
    if (!current || !target) return;

    const orders = banners.map((b, i) => {
      if (i === index) return { id: b.id, order: target.order };
      if (i === swapIndex) return { id: b.id, order: current.order };
      return { id: b.id, order: b.order };
    });
    reorderMutation.mutate({ orders });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h1">배너 관리</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {isLoading ? (
          <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
            불러오는 중...
          </Typography>
        ) : banners.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
            등록된 배너가 없습니다.
          </Typography>
        ) : (
          banners.map((banner, index) => (
            <BannerRow
              key={banner.id}
              banner={banner}
              index={index}
              total={banners.length}
              isEditing={editingId === banner.id}
              onEdit={() => setEditingId(banner.id)}
              onCancelEdit={() => setEditingId(null)}
              onMove={dir => handleMove(index, dir)}
              isMoveDisabled={reorderMutation.isPending}
            />
          ))
        )}
        <BannerAddRow />
      </Box>
    </Box>
  );
}
