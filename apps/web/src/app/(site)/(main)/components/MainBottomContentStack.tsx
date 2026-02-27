"use client";

import { BottomNavBar } from "./BottomNavBar";
import { useMainBottomSlot } from "./MainBottomSlotContext";

export function MainBottomContentStack() {
  const { currentSlotNode } = useMainBottomSlot();

  return (
    <>
      {currentSlotNode}
      <BottomNavBar />
    </>
  );
}
