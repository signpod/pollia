import { surveyDeadlineDateAtom, surveyDeadlineTimeAtom } from "@/atoms/survey/surveyAtoms";
import { DateAndTimePicker, Typo } from "@repo/ui/components";
import { useAtom } from "jotai";

export function SurveyDateAndTimeForm() {
  const [deadlineDate, setDeadlineDate] = useAtom(surveyDeadlineDateAtom);
  const [deadlineTime, setDeadlineTime] = useAtom(surveyDeadlineTimeAtom);

  return (
    <section className="flex justify-between items-center">
      <Typo.SubTitle>종료 일시</Typo.SubTitle>
      <DateAndTimePicker
        date={deadlineDate}
        time={deadlineTime}
        onDateChange={setDeadlineDate}
        onTimeChange={setDeadlineTime}
        disabledDates={{ before: new Date() }}
      />
    </section>
  );
}
