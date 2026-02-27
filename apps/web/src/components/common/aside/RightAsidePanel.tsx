import { ROUTES } from "@/constants/routes";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronRightIcon, SparklesIcon, TrendingUpIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RankingItem {
  id: string;
  title: string;
  participantCount: number;
}

interface PickItem {
  id: string;
  title: string;
  imageUrl: string | null;
  category: string;
}

const MOCK_RANKINGS: RankingItem[] = [
  { id: "1", title: "오점뭐? 지금 딱 정해드립니다!", participantCount: 11 },
  {
    id: "2",
    title: '나의 소비 유형 테스트 "지갑 열기 전 꼭 해봐야 할 테스트"',
    participantCount: 9,
  },
  { id: "3", title: "나의 연애 데이터가 가리키는 IT 업무 포지션은?", participantCount: 9 },
  { id: "4", title: "연애 데이터가 가리키는 업무 포지션은?", participantCount: 7 },
  {
    id: "5",
    title: "안색평정 : 절세 사내를 위한 세안 비결 (남자 인생 클렌징폼 찾기)",
    participantCount: 7,
  },
];

const MOCK_PICKS: PickItem[] = [
  { id: "1", title: "나는 어떤 MBTI 유형일까?", imageUrl: null, category: "유형 테스트" },
  {
    id: "2",
    title: "연애 데이터가 가리키는 업무 포지션은?",
    imageUrl: null,
    category: "유형 테스트",
  },
  { id: "3", title: "직장인인 내가 야구선수라면?", imageUrl: null, category: "유형 테스트" },
];

const RANK_COLORS: Record<number, string> = {
  1: "text-violet-500",
  2: "text-zinc-500",
  3: "text-zinc-500",
  4: "text-zinc-300",
  5: "text-zinc-300",
};

export function RightAsidePanel() {
  return (
    <div className="flex w-56 flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-4">
        <div className="flex items-center gap-1.5">
          <TrendingUpIcon className="size-3.5 text-violet-500" />
          <Typo.SubTitle size="large" className="font-bold text-zinc-900">
            실시간 랭킹
          </Typo.SubTitle>
        </div>

        <div className="flex flex-col gap-2.5">
          {MOCK_RANKINGS.map((item, index) => (
            <Link key={item.id} href={ROUTES.MISSION(item.id)} className="flex items-start gap-2.5">
              <Typo.Body
                size="small"
                className={cn(
                  "w-4 shrink-0 pt-0.5 text-center font-extrabold",
                  RANK_COLORS[index + 1],
                )}
              >
                {index + 1}
              </Typo.Body>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Typo.Body
                  size="small"
                  className="line-clamp-2 font-semibold leading-tight text-zinc-800"
                >
                  {item.title}
                </Typo.Body>
                <Typo.Body size="small" className="text-[9px] text-zinc-400">
                  {item.participantCount}명 참여
                </Typo.Body>
              </div>
            </Link>
          ))}
        </div>

        <Link href={ROUTES.HOME} className="flex items-center justify-center gap-1">
          <ChevronRightIcon className="size-3 text-zinc-400" />
          <Typo.Body size="small" className="font-semibold text-zinc-400">
            더보기
          </Typo.Body>
        </Link>
        <Typo.Body size="small" className="self-end text-[9px] text-zinc-300">
          참여자 수 기준
        </Typo.Body>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-4">
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="size-3.5 text-violet-500" />
          <Typo.SubTitle size="large" className="font-bold text-zinc-900">
            폴리아 PICK
          </Typo.SubTitle>
        </div>

        <div className="flex flex-col gap-2.5">
          {MOCK_PICKS.map(item => (
            <Link
              key={item.id}
              href={ROUTES.MISSION(item.id)}
              className="flex items-center gap-2.5"
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-zinc-50">
                    <PolliaIcon className="size-7 opacity-30" />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Typo.Body
                  size="small"
                  className="line-clamp-2 font-semibold leading-tight text-zinc-800"
                >
                  {item.title}
                </Typo.Body>
                <Typo.Body size="small" className="text-[9px] text-zinc-400">
                  {item.category}
                </Typo.Body>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
