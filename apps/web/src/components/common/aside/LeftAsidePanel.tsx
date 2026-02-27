import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { Typo } from "@repo/ui/components";

// TODO: 실제 링크 연결 필요
export function LeftAsidePanel() {
  return (
    <div className="flex w-56 flex-col gap-3 pointer-events-none opacity-80">
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-4">
        <PolliaWordmark className="h-4 w-auto self-start" />
        <Typo.Body size="small" className="text-zinc-900">
          세상에서 가장 재밌는
          <br />
          리서치 콘텐츠 플랫폼
        </Typo.Body>
        <div className="flex items-center justify-center rounded-lg bg-zinc-100 py-2">
          <Typo.Body size="small" className="font-bold text-zinc-600">
            서비스 소개
          </Typo.Body>
        </div>
      </div>
      {/* TODO: 포인트 적립 기능 추가 시 활성화 */}
      {/* <div className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-white p-4">
        <div className="flex items-center gap-1.5">
          <GiftIcon className="size-3.5 text-violet-500" />
          <Typo.Body size="small" className="font-bold text-zinc-900">
            포인트 적립
          </Typo.Body>
        </div>
        <Typo.Body size="small" className="text-zinc-500">
          참여할 때마다
          <br />
          포인트가 쌓여요!
        </Typo.Body>
        <Link
          href={ROUTES.HOME}
          className="flex items-center justify-center rounded-lg bg-zinc-100 py-2"
        >
          <Typo.Body size="small" className="font-bold text-zinc-600">
            스토어 바로가기
          </Typo.Body>
        </Link>
      </div> */}
    </div>
  );
}
