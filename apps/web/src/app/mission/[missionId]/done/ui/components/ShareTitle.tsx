import { Typo } from "@repo/ui/components";
import React from "react";

export const ShareTitle = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div ref={ref} style={{ opacity: 0, transform: "translateY(10px)" }}>
    <Typo.MainTitle size="small" className="text-center">
      방금 참여한 설문을
      <br />
      친구들에게도 공유해보세요👀
    </Typo.MainTitle>
  </div>
));

ShareTitle.displayName = "ShareTitle";
