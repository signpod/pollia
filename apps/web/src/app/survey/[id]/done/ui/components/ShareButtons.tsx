import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { Typo } from "@repo/ui/components";
import { Share2 } from "lucide-react";
import React from "react";

export const ShareButtons = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div
    ref={ref}
    className="flex gap-8 w-full justify-center"
    style={{ opacity: 0, transform: "translateY(10px)" }}
  >
    <button type="button" className="flex flex-col gap-2">
      <div className="bg-[#FEE500] size-12 p-3 rounded-sm">
        <KakaoIcon />
      </div>
      <Typo.Body className="text-sub">카카오톡</Typo.Body>
    </button>

    <button type="button" className="flex flex-col gap-2">
      <div className="bg-white border border-default size-12 p-3 rounded-sm">
        <Share2 />
      </div>
      <Typo.Body className="text-sub">공유하기</Typo.Body>
    </button>
  </div>
));

ShareButtons.displayName = "ShareButtons";
