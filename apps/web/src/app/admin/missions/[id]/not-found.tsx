import { Button } from "@/app/admin/components/shadcn-ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { ADMIN_ROUTES } from "../../constants/routes";

export default function MissionNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="rounded-full bg-muted p-6">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">미션을 찾을 수 없습니다</h1>
          <p className="text-muted-foreground">
            요청하신 미션이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
        </div>

        <Button asChild>
          <Link href={ADMIN_ROUTES.ADMIN}>미션 목록으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}
