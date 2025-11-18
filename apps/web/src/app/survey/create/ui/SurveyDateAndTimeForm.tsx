import { surveyDeadlineDateAtom, surveyDeadlineTimeAtom } from "@/atoms/survey/surveyAtoms";
import { DateAndTimePicker, Typo } from "@repo/ui/components";
import { useAtom } from "jotai";

export function SurveyDateAndTimeForm() {
  const [deadlineDate, setDeadlineDate] = useAtom(surveyDeadlineDateAtom);
  const [deadlineTime, setDeadlineTime] = useAtom(surveyDeadlineTimeAtom);

  const deadlineDateDisabled = deadlineDate ? { after: new Date(deadlineDate) } : undefined;

  return (
    <section className="flex justify-between">
      <Typo.SubTitle>설문 종료 일시</Typo.SubTitle>
    <section className="flex justify-between items-center">
      <DateAndTimePicker
        date={deadlineDate}
        time={deadlineTime}
        onDateChange={setDeadlineDate}
        onTimeChange={setDeadlineTime}
        disabledDates={deadlineDateDisabled}
      />
    </section>
  );
}
