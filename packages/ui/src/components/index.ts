export * from "./common/Button";
export * from "./common/Input";

export * from "./common/KakaoLoginButton";
export * from "./common/Tooltip";
export * from "./common/CenterOverlay";
export * from "./common/Typo";
export * from "./common/ImageSelector";
export * from "./common/Toggle";
export * from "./common/DateAndTimePicker";
export * from "./common/Drawer";
export * from "./common/IconButton";
export * from "./common/CounterInput";

// Hooks
export * from "../hooks/useStep";

/* Next.js Server Component에서 사용할 수 있도록 컴포넌트를 내보냅니다. 
개별 함수에 대한 export를 실행하지 않으면 Server Components에서 사용할 수 없습니다. 25.09.29 - 정우
*/
import {
  FixedBottomLayout as FixedBottomLayoutBase,
  FixedBottomContent,
} from "./layout/FixedBottomLayout";
export const FixedBottomLayout = Object.assign(FixedBottomLayoutBase, {
  Content: FixedBottomContent,
});

import {
  FixedTopLayout as FixedTopLayoutBase,
  FixedTopContent,
} from "./layout/FixedTopLayout";

export const FixedTopLayout = Object.assign(FixedTopLayoutBase, {
  Content: FixedTopContent,
});
