import { searchMissions } from "@/actions/search";
import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/admin/components/shadcn-ui/table";
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import Link from "next/link";

interface AdminSearchTempPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function AdminSearchTempPage({ searchParams }: AdminSearchTempPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const result = query ? await searchMissions({ query, hitsPerPage: 20 }) : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">검색 테스트</h1>
        <p className="text-muted-foreground">
          Algolia 연동 상태를 빠르게 확인하기 위한 임시 관리자 화면입니다.
        </p>
      </div>

      <form className="flex items-center gap-2">
        <Input
          name="q"
          defaultValue={query}
          placeholder="검색어 입력 (예: 여행, ㅇㅎ)"
          className="max-w-xl"
        />
        <Button type="submit">검색</Button>
      </form>

      <div className="text-sm text-muted-foreground">
        <span>검색어: {query || "-"}</span>
        <span className="ml-3">결과: {result.data.length}건</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>초성</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="w-[120px]">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.data.map(item => (
            <TableRow key={item.objectID}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.choseong || "-"}</TableCell>
              <TableCell>
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button asChild size="sm" variant="outline">
                  <Link href={ADMIN_ROUTES.ADMIN_MISSION(item.objectID)}>열기</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {result.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
