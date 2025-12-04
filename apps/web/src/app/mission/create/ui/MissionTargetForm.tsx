"use client";

import { missionTargetAtom } from "@/atoms/mission/missionAtoms";
import { Textarea } from "@repo/ui/components";
import { useAtom } from "jotai";
import { useCallback } from "react";

export function MissionTargetForm() {
  const { target, handleChange } = useMissionTargetForm();

  return (
    <Textarea
      label="설문 대상자"
      required={false}
      placeholder="설문 대상자를 입력해주세요 (예: 20대 여성, IT 업계 종사자)"
      maxLength={200}
      showLength={true}
      value={target}
      onChange={handleChange}
      rows={3}
      resize="none"
    />
  );
}

function useMissionTargetForm() {
  const [target, setTarget] = useAtom(missionTargetAtom);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTarget(e.target.value);
    },
    [setTarget],
  );

  return {
    target,
    handleChange,
  };
}
