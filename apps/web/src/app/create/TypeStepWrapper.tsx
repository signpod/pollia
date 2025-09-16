"use client";

import { useAtom } from "jotai";
import { pollTypeAtom } from "@/atoms/create/pollTypeAtoms";
import PollTypeStep from "./PollTypeStep";

export default function TypeStepWrapper() {
  const [selectedType, setSelectedType] = useAtom(pollTypeAtom);

  const handleTypeChange = (type: "ox" | "hobullho" | "multiple") => {
    console.log("카테고리 선택:", type);
    setSelectedType(type);
  };

  return (
    <PollTypeStep selectedType={selectedType} onTypeChange={handleTypeChange} />
  );
}
