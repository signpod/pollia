import { ButtonV2, FixedBottomLayout } from "@repo/ui/components";
import React from "react";

interface MainButtonProps {
  onClick: () => void;
}

export const MainButton = React.forwardRef<HTMLButtonElement, MainButtonProps>(
  ({ onClick }, ref) => (
    <FixedBottomLayout.Content className="px-5 py-3">
      <ButtonV2
        ref={ref}
        variant="primary"
        size="large"
        className="w-full opacity-0"
        onClick={onClick}
      >
        <div className="flex justify-center items-center text-center flex-1">메인으로 가기</div>
      </ButtonV2>
    </FixedBottomLayout.Content>
  ),
);

MainButton.displayName = "MainButton";

