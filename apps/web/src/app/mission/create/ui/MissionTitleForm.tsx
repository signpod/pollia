"use client";
import { missionTitleAtom } from "@/atoms/mission/missionAtoms";
import { titleSchema } from "@/schemas/mission/missionSchema";
import { Input } from "@repo/ui/components";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";

export function MissionTitleForm() {
  const { title, handleChange, errorMessage, handleBlur } = useMissionTitleForm();

  return (
    <Input
      label="설문지 제목"
      required
      placeholder="설문지 제목을 입력해주세요"
      maxLength={30}
      showLength={true}
      value={title}
      onChange={handleChange}
      onBlur={handleBlur}
      errorMessage={errorMessage}
    />
  );
}

function useMissionTitleForm() {
  const [title, setTitle] = useAtom(missionTitleAtom);
  const [error, setError] = useState<string | undefined>();

  const handleBlur = useCallback(() => {
    const trimmed = title.trim();
    setTitle(trimmed);

    try {
      const result = titleSchema.safeParse(trimmed);

      if (!result.success) {
        setError(result.error.issues[0]?.message);
      } else {
        setError(undefined);
      }
    } catch {
      setError(undefined);
    }
  }, [title, setTitle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
  };

  const errorMessage = error;

  return {
    title,
    handleChange,
    errorMessage,
    handleBlur,
  };
}
