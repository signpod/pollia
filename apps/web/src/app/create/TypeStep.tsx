"use client";

import { useAtom } from "jotai";
import { pollTypeAtom } from "@/atoms/create/pollTypeAtoms";
import PollTypeStep from "./PollTypeStep";
import { BottomCTALayout, Button, Typo, useStep } from "@repo/ui/components";

export default function TypeStep() {
  const [selectedType, setSelectedType] = useAtom(pollTypeAtom);
  const { goNext } = useStep();

  const handleTypeChange = (type: "ox" | "hobullho" | "multiple") => {
    console.log("카테고리 선택:", type);
    setSelectedType(type);
  };

  return (
    <>
      <PollTypeStep
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
      />
      <BottomCTALayout.CTA>
        <div className="p-5 pb-10">
          <Button
            onClick={goNext}
            disabled={!selectedType}
            variant="primary"
            fullWidth={true}
          >
            <Typo.ButtonText>다음</Typo.ButtonText>
          </Button>
        </div>
      </BottomCTALayout.CTA>
    </>
  );
}
