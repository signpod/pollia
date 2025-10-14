import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import { Typo } from "@repo/ui/components";

interface UserInfoProps {
  name: string;
  // imageUrl?: string;
}

export function UserInfo({ name }: UserInfoProps) {
  return (
    <section className="flex flex-col gap-4 justify-center items-center">
      <Avatar className="w-16 h-16">
        {/* TODO: 유저 프로필 이미지 추가 */}
        {/* <AvatarImage src={imageUrl} /> */}
        <AvatarFallback>
          <PollPollE />
        </AvatarFallback>
      </Avatar>
      <Typo.MainTitle size="medium">{name}</Typo.MainTitle>
    </section>
  );
}
