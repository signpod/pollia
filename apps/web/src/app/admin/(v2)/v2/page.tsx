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
  { href: ADMIN_V2_ROUTES.BANNERS, label: "배너 관리", description: "배너 추가, 수정, 순서 변경" },
] as const;

export default function AdminV2Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin V2</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {MENU_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border p-6 transition-colors hover:bg-muted"
          >
            <h2 className="text-lg font-semibold">{item.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
