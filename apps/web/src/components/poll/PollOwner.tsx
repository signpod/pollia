import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { PollOwner as PollOwnerType } from "@/types/poll";
import { getCdnImageUrl } from "@/lib/utils";

interface PollOwnerProps {
  owner: PollOwnerType;
  createdAt: string;
}

export function PollOwner({ owner, createdAt }: PollOwnerProps) {
  const cdnProfileImageUrl = getCdnImageUrl(owner.profileImageUrl);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "오늘";
    } else if (diffDays === 2) {
      return "어제";
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-3 mt-6">
      <Avatar className="w-8 h-8">
        <AvatarImage src={cdnProfileImageUrl} alt={owner.name} />
        <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
          {cdnProfileImageUrl ? (
            getInitials(owner.name)
          ) : (
            <User className="w-4 h-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium text-gray-900">{owner.name}</span>
        <span>•</span>
        <time
          dateTime={createdAt}
          title={new Date(createdAt).toLocaleString("ko-KR")}
        >
          {formatDate(createdAt)}
        </time>
      </div>
    </div>
  );
}
