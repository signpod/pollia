import { Heart, Share, Bookmark } from "lucide-react";
import { IconButton, toast } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { useLike } from "@/hooks/poll/useLike";
import { useBookmark } from "@/hooks/poll/useBookmark";
import { useAuth } from "@/hooks/user";


const SHARE_MESSAGES = {
  success: "링크가 클립보드에 복사되었어요.",
  error: "링크를 클립보드에 복사하는 중 오류가 발생했어요.",
} as const;

export function BottomCTAButtons({ pollId }: { pollId: string }) {
  const { withAuth } = useAuth();
  const { isLiked, handleLike, isProcessing: likeProcessing } = useLike(pollId);
  const {
    isBookmarked,
    handleBookmark,
    isProcessing: bookmarkProcessing,
  } = useBookmark(pollId);

  const onLikeClick = () => withAuth(handleLike)();
  const onBookmarkClick = () => withAuth(handleBookmark)();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/poll/${pollId}`;
    const shareData = {
      title: "폴리아 투표",
      text: "이 투표에 참여해보세요!",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        const canShare = !navigator.canShare || navigator.canShare(shareData);
        if (canShare) {
          await navigator.share(shareData);
          return;
        }
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success(SHARE_MESSAGES.success);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error("공유 실패:", error);

      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(SHARE_MESSAGES.success);
      } catch (clipboardError) {
        console.error("클립보드 복사 실패:", clipboardError);
        toast.error(SHARE_MESSAGES.error);
      }
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-1",
        "shadow-[0_4px_20px_0_rgba(0,0,0,0.1)]"
      )}
    >
      <div className="flex items-center">
        {/* 좋아요 */}
        <IconButton
          icon={Heart}
          onClick={onLikeClick}
          aria-label="좋아요"
          className="size-12"
          disabled={likeProcessing}
          iconClassName={cn(
            "transition-all duration-300",
            isLiked && "text-violet-500 fill-violet-500"
          )}
        />

        {/* 공유 */}
        <IconButton
          icon={Share}
          onClick={handleShare}
          aria-label="공유"
          className="size-12"
        />
      </div>

      {/* 스크랩 */}
      <IconButton
        icon={Bookmark}
        onClick={onBookmarkClick}
        aria-label="스크랩"
        className="size-12"
        disabled={bookmarkProcessing}
        iconClassName={cn(
          "transition-all duration-300",
          isBookmarked && "text-violet-500 fill-violet-500"
        )}
      />
    </div>
  );
}
