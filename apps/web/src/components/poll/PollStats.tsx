import { Users, MessageCircle, Heart } from "lucide-react";

interface PollStatsProps {
  participantsCount: number;
  commentCount: number;
  likeCount: number;
}

export function PollStats({
  participantsCount,
  commentCount,
  likeCount,
}: PollStatsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="flex items-center gap-6 text-sm text-gray-600">
      {/* 참여자 수 */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        <span>
          참여자{" "}
          <span className="font-semibold text-gray-900">
            {formatNumber(participantsCount)}명
          </span>
        </span>
      </div>

      {/* 댓글 수 */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        <span>
          댓글{" "}
          <span className="font-semibold text-gray-900">
            {formatNumber(commentCount)}개
          </span>
        </span>
      </div>

      {/* 좋아요 수 */}
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4" />
        <span>
          좋아요{" "}
          <span className="font-semibold text-gray-900">
            {formatNumber(likeCount)}개
          </span>
        </span>
      </div>
    </div>
  );
}
