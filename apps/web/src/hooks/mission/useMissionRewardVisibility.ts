import { useRef, useState } from "react";

/**
 * 설문 리워드 섹션의 가시성을 관리하고 스크롤 기능을 제공하는 훅
 */
export function useMissionRewardVisibility() {
  const [isRewardVisible, setIsRewardVisible] = useState(true);
  const rewardRef = useRef<HTMLDivElement>(null);

  const scrollToReward = () => {
    rewardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return {
    isRewardVisible,
    setIsRewardVisible,
    rewardRef,
    scrollToReward,
  };
}
