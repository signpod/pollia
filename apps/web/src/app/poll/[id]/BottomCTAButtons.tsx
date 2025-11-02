import { useBookmark } from "@/hooks/poll/useBookmark";
import { useLike } from "@/hooks/poll/useLike";
import { useAuth } from "@/hooks/user";
import { IconButton, toast } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { Bookmark, Heart, Share } from "lucide-react";

const SHARE_MESSAGES = {
  shared: "공유가 완료되었어요!",
  copied: "링크가 클립보드에 복사되었어요.",
  error: "링크를 클립보드에 복사하는 중 오류가 발생했어요.",
} as const;

export function BottomCTAButtons({ pollId }: { pollId: string }) {
  const { withAuth } = useAuth();
  const { isLiked, handleLike, isProcessing: likeProcessing } = useLike(pollId);
  const { isBookmarked, handleBookmark, isProcessing: bookmarkProcessing } = useBookmark(pollId);

  const onLikeClick = () => withAuth(handleLike)();
  const onBookmarkClick = () => withAuth(handleBookmark)();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/poll/${pollId}`;

    if (navigator.share && navigator.canShare) {
      const shareData = {
        title: "폴리아 투표",
        text: "이 투표에 참여해보세요!",
        url: shareUrl,
      };

      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          toast.success(SHARE_MESSAGES.shared);
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            // 취소했어도 링크는 복사해주기
          }
        }
      }
    }

    // Fallback: 클립보드 복사
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(SHARE_MESSAGES.copied);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error(SHARE_MESSAGES.error);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-1",
        "shadow-[0_4px_20px_0_rgba(0,0,0,0.1)]",
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
            isLiked && "text-violet-500 fill-violet-500",
          )}
        />

        {/* 공유 */}
        <IconButton icon={Share} onClick={handleShare} aria-label="공유" className="size-12" />
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
          isBookmarked && "text-violet-500 fill-violet-500",
        )}
      />
    </div>
  );
}
