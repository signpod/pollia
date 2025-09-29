import { Heart, Share, Bookmark } from "lucide-react";
import { IconButton } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";

export function BottomCTAButtons() {
  //TODO: 좋아요, 공유, 스크랩 기능 구현
  const handleLike = () => {
    console.log("좋아요 클릭");
  };
  const handleShare = () => {
    console.log("공유 클릭");
  };
  const handleBookmark = () => {
    console.log("스크랩 클릭");
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
          onClick={handleLike}
          aria-label="좋아요"
          className="size-12"
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
        onClick={handleBookmark}
        aria-label="스크랩"
        className="size-12"
      />
    </div>
  );
}
