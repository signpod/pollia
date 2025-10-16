import { formatDateToLocalString } from "@/lib/date";
import {
  DateAndTimePicker,
  LabelText,
  Toggle,
  Typo,
} from "@repo/ui/components";
import { useAtom } from "jotai";
import { PrimitiveAtom } from "jotai";

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

  // string → Date 변환
  const startDate = startDateString ? new Date(startDateString) : undefined;
  const endDate = endDateString ? new Date(endDateString) : undefined;

  // Date → string 변환 함수
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDateString(date ? formatDateToLocalString(date) : "");
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDateString(date ? formatDateToLocalString(date) : "");
  };

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
        <div className="flex justify-between items-center">
          <LabelText required>시작</LabelText>
          <DateAndTimePicker
            date={startDate}
            time={startTime}
            onDateChange={handleStartDateChange}
            onTimeChange={setStartTime}
          />
        </div>

        <div className="flex justify-between items-center">
          <LabelText required disabled={isUnlimited}>
            종료
          </LabelText>
          <DateAndTimePicker
            date={endDate}
            time={endTime}
            onDateChange={handleEndDateChange}
            onTimeChange={setEndTime}
            disabled={isUnlimited}
          />
        </div>
      </div>
    </div>
  );
}
