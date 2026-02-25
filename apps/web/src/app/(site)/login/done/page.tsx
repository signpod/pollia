import { Typo } from "@repo/ui/components";
import Link from "next/link";

export default function LoginDonePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-5">
      <Typo.MainTitle size="large" className="text-center">
        가입이 완료되었어요
      </Typo.MainTitle>
      <Typo.Body size="medium" className="text-center text-sub">
        이제 폴리아와 함께 다양한 미션에 참여해 보세요.
      </Typo.Body>
      <Link
        href="/"
        className="mt-4 rounded-full bg-violet-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-600"
      >
        홈으로 이동
      </Link>
    </div>
  );
}
