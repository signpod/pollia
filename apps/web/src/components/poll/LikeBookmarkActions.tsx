import { Button } from "@repo/ui/components";
import { Heart, Bookmark } from "lucide-react";

interface LikeBookmarkActionsProps {
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  onLike: () => void;
  onBookmark: () => void;
  isProcessing: boolean;
}

export function LikeBookmarkActions({
  isLiked,
  isBookmarked,
  likeCount,
  onLike,
  onBookmark,
  isProcessing,
}: LikeBookmarkActionsProps) {
  const formatLikeCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  return (
    <div className="flex items-center gap-2 mt-6">
      <Button
        variant={isLiked ? "default" : "outline"}
        size="sm"
        onClick={onLike}
        disabled={isProcessing}
        className={`transition-all duration-200 ${
          isLiked
            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        }`}
      >
        <Heart
          className={`w-4 h-4 mr-2 transition-all duration-200 ${
            isLiked ? "fill-current scale-110" : ""
          }`}
        />
        좋아요 ({formatLikeCount(likeCount)})
      </Button>

      <Button
        variant={isBookmarked ? "default" : "outline"}
        size="sm"
        onClick={onBookmark}
        disabled={isProcessing}
        className={`transition-all duration-200 ${
          isBookmarked
            ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
            : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
        }`}
        aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
      >
        <Bookmark
          className={`w-4 h-4 transition-all duration-200 ${
            isBookmarked ? "fill-current scale-110" : ""
          }`}
        />
      </Button>
    </div>
  );
}
