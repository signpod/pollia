import { Typo } from "@repo/ui/components";
import { format } from "date-fns";

interface MissionCollectionProps {
  estimatedMinutes?: number;
  deadline?: Date;
  target?: string;
}

export function MissionCollection({ estimatedMinutes, deadline, target }: MissionCollectionProps) {
  const items = [
    { label: "소요시간", value: estimatedMinutes ? `${estimatedMinutes}분` : "" },
    { label: "마감일", value: deadline ? format(deadline, "yyyy.MM.dd HH:mm") : "" },
    { label: "대상자", value: target },
  ]
    .filter(item => item.value)
    .map((item, index) => ({
      ...item,
      id: index,
    }));

  if (items.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-3 rounded-sm bg-light p-3">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
        {items.map(item => (
          <div key={item.id} className="flex gap-2">
            <Typo.Body size="medium" className="text-disabled whitespace-nowrap">
              {item.label}
            </Typo.Body>
            <Typo.Body size="medium" className="text-sub">
              {item.value}
            </Typo.Body>
          </div>
        ))}
      </div>
    </div>
  );
}
