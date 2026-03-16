"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/app/admin/components/shadcn-ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

export type StatusFilterValue = "all" | "completed" | "inProgress";

function isStatusFilterValue(value: string): value is StatusFilterValue {
  return value === "all" || value === "completed" || value === "inProgress";
}

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
  counts: Record<StatusFilterValue, number>;
}

const filterLabels: Record<StatusFilterValue, string> = {
  all: "전체",
  completed: "완료자만",
  inProgress: "진행중만",
};

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  const currentLabel = filterLabels[value];
  const currentCount = counts[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[140px] justify-between">
          <span>
            {currentLabel} ({currentCount}명)
          </span>
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={v => {
            if (isStatusFilterValue(v)) onChange(v);
          }}
        >
          <DropdownMenuRadioItem value="all">전체 ({counts.all}명)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="completed">
            완료자만 ({counts.completed}명)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="inProgress">
            진행중만 ({counts.inProgress}명)
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
