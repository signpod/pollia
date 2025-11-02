import { isPollActive } from "@/lib/utils";
import { GetUserPollsResponse } from "@/types/dto";
import { Typo } from "@repo/ui/components";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { List } from "./List";

export function PollList({
  title,
  polls,
  useActiveIcon = false,
}: {
  title: string;
  polls: GetUserPollsResponse["data"];
  useActiveIcon?: boolean;
}) {
  return (
    <List.Root>
      <List.Header title={title} action={<ActionButton />} />
      <List.Content>
        {polls?.map(poll => (
          <List.Item
            leadingIcon={
              useActiveIcon ? (
                <LeadingIcon
                  endDate={poll.endDate}
                  startDate={poll.startDate}
                  isIndefinite={poll.isIndefinite}
                />
              ) : null
            }
            key={poll.id}
            title={poll.title}
            href={`/poll/${poll.id}`}
          />
        ))}
      </List.Content>
    </List.Root>
  );
}

function ActionButton() {
  return (
    // TODO: 더보기 페이지 href 수정
    <Link href="/">
      <Typo.Body size="medium" className="text-zinc-400">
        더보기
      </Typo.Body>
    </Link>
  );
}

function LeadingIcon({
  endDate,
  startDate,
  isIndefinite,
}: {
  endDate: Date | null;
  startDate: Date | null;
  isIndefinite: boolean;
}) {
  const isProgressive = isPollActive(startDate, endDate, isIndefinite);
  const text = isProgressive ? "진행중" : "종료";
  const leadingIconVariant = cva(
    "flex items-center justify-center w-[60px] h-[28px] rounded-full",
    {
      variants: {
        isProgressive: {
          true: "text-violet-500 bg-violet-50",
          false: "text-zinc-500 bg-zinc-100",
        },
      },
    },
  );
  return (
    <div className={leadingIconVariant({ isProgressive })}>
      <Typo.ButtonText size="medium">{text}</Typo.ButtonText>
    </div>
  );
}
