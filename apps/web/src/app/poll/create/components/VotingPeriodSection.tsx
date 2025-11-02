import { formatDateToLocalString } from "@/lib/date";
import { DateAndTimePicker, LabelText, Toggle, Typo } from "@repo/ui/components";
import { PrimitiveAtom, useAtom } from "jotai";
import type { Matcher } from "react-day-picker";

interface VotingPeriodSectionProps {
  isUnlimitedAtom: PrimitiveAtom<boolean>;
  startDateAtom: PrimitiveAtom<string>;
  startTimeAtom: PrimitiveAtom<string>;
  endDateAtom: PrimitiveAtom<string>;
  endTimeAtom: PrimitiveAtom<string>;
}

export function VotingPeriodSection({
  isUnlimitedAtom,
  startDateAtom,
  startTimeAtom,
  endDateAtom,
  endTimeAtom,
}: VotingPeriodSectionProps) {
  const [isUnlimited, setIsUnlimited] = useAtom(isUnlimitedAtom);
  const [startDateString, setStartDateString] = useAtom(startDateAtom);
  const [startTime, setStartTime] = useAtom(startTimeAtom);
  const [endDateString, setEndDateString] = useAtom(endDateAtom);
  const [endTime, setEndTime] = useAtom(endTimeAtom);

  const startDate = startDateString
    ? (() => {
        const d = new Date(startDateString);
        d.setHours(0, 0, 0, 0);
        return d;
      })()
    : undefined;

  const endDate = endDateString
    ? (() => {
        const d = new Date(endDateString);
        d.setHours(0, 0, 0, 0);
        return d;
      })()
    : undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDateString(date ? formatDateToLocalString(date) : "");
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDateString(date ? formatDateToLocalString(date) : "");
  };

  const startDateDisabled: Matcher[] = [
    { before: today },
    ...(endDate ? [{ after: endDate }] : []),
  ];

  const endDateDisabled: Matcher = { before: startDate || today };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typo.SubTitle size="large">무기한</Typo.SubTitle>
          <Typo.Body size="medium" className="text-zinc-400">
            (종료 버튼 누르기 전까지 투표 가능)
          </Typo.Body>
        </div>
        <Toggle checked={isUnlimited} onCheckedChange={setIsUnlimited} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <LabelText required>시작</LabelText>
          <DateAndTimePicker
            date={startDate}
            time={startTime}
            onDateChange={handleStartDateChange}
            onTimeChange={setStartTime}
            disabledDates={startDateDisabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <LabelText required disabled={isUnlimited}>
            종료
          </LabelText>
          <DateAndTimePicker
            date={endDate}
            time={endTime}
            onDateChange={handleEndDateChange}
            onTimeChange={setEndTime}
            disabled={isUnlimited}
            disabledDates={endDateDisabled}
          />
        </div>
      </div>
    </div>
  );
}
