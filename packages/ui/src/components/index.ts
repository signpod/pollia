/* Next.js Server Component에서 사용할 수 있도록 컴포넌트를 내보냅니다. 
개별 함수에 대한 export를 실행하지 않으면 Server Components에서 사용할 수 없습니다. 25.09.29 - 정우
*/
import {
  FixedBottomContent,
  FixedBottomLayout as FixedBottomLayoutBase,
} from "./layout/FixedBottomLayout";
import { FixedTopContent, FixedTopLayout as FixedTopLayoutBase } from "./layout/FixedTopLayout";

export * from "./common/Button";
export * from "./common/ButtonV2";
export * from "./common/FloatingButton";
export * from "./common/Input";

export * from "./common/KakaoLoginButton";
export * from "./common/Tooltip";
export * from "./common/CenterOverlay";
export * from "./common/Typo";
export * from "./common/ImageSelector";
export * from "./common/Slider";
export * from "./common/Toggle";
export * from "./common/DateAndTimePicker";
export * from "./common/TimePicker";
export * from "./common/Dialog";
export * from "./common/Drawer";
export * from "./common/IconButton";
export * from "./common/CounterInput";
export * from "./common/ProcessChip";
export * from "./common/Toast";
export * from "./common/LabelText";
export * from "./common/Modal";
export * from "./common/Tab";
export * from "./common/Select";
export * from "./common/TiptapEditor";
export * from "./common/TiptapViewer";
export * from "./common/Textarea";
export * from "./common/ProgressBar";

// Hooks
export * from "../hooks/useStep";

export const FixedBottomLayout = Object.assign(FixedBottomLayoutBase, {
  Content: FixedBottomContent,
});

export const FixedTopLayout = Object.assign(FixedTopLayoutBase, {
  Content: FixedTopContent,
});
