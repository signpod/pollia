import PollPollE from "@public/svgs/poll-poll-e.svg";
import { Typo } from "@repo/ui/components";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserInfoProps {
  name: string;
  // imageUrl?: string;
}

export function UserInfo({ name }: UserInfoProps) {
  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <Avatar className="h-16 w-16">
        {/* TODO: 유저 프로필 이미지 추가 */}
        {/* <AvatarImage src={imageUrl} /> */}
        <AvatarFallback>
          <PollPollE className="h-full w-full" />
        </AvatarFallback>
      </Avatar>
      <Typo.MainTitle size="medium">{name}</Typo.MainTitle>
    </section>
  );
}
