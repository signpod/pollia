import { surveyEstimatedMinutesAtom } from "@/atoms/survey/surveyAtoms";
import { Input, Typo } from "@repo/ui/components";
import { useAtom } from "jotai";
import { useCallback } from "react";

export function SurveyEstimatedMinutesForm() {
  const [estimatedMinutes, setEstimatedMinutes] = useAtom(surveyEstimatedMinutesAtom);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEstimatedMinutes(value === "" ? undefined : Number(value));
    },
    [setEstimatedMinutes],
  );

  return (
    <section className="flex items-center justify-between gap-4">
      <Typo.SubTitle id="survey-estimated-minutes-label">소요 시간</Typo.SubTitle>
      <div className="flex items-center gap-2">
        <Input
          aria-labelledby="survey-estimated-minutes-label"
          min={1}
          max={999}
          type="number"
          placeholder="예: 10"
          inputMode="numeric"
          value={estimatedMinutes ?? ""}
          onChange={handleChange}
          inputClassName="w-24"
        />
        <Typo.Body size="medium" className="text-sub">
          분
        </Typo.Body>
      </div>
    </section>
  );
}
