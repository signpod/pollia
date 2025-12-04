"use client";

import { missionDeadlineDateAtom, missionDeadlineTimeAtom } from "@/atoms/mission/missionAtoms";
import { DateAndTimePicker, Typo } from "@repo/ui/components";
import { useAtom } from "jotai";

export function MissionDateAndTimeForm() {
  const [deadlineDate, setDeadlineDate] = useAtom(missionDeadlineDateAtom);
  const [deadlineTime, setDeadlineTime] = useAtom(missionDeadlineTimeAtom);

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
