import { ButtonV2, Typo } from "@repo/ui/components";
import Link from "next/link";

export default function FestivalNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-zinc-100">
          <span className="text-4xl">🎪</span>
        </div>
        <div className="flex flex-col gap-2">
          <Typo.MainTitle size="medium">축제를 찾을 수 없어요</Typo.MainTitle>
          <Typo.Body size="medium" className="text-sub">
            요청하신 축제 정보가 존재하지 않거나 삭제되었을 수 있어요.
          </Typo.Body>
        </div>
        <Link href="/">
          <ButtonV2 variant="secondary" size="large">
            홈으로 돌아가기
          </ButtonV2>
        </Link>
      </div>
    </main>
  );
}
