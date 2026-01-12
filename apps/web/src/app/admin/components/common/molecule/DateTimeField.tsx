"use client";

import { DatePicker } from "@/app/admin/components/common/atom/DatePicker";
import { TimePicker } from "@/app/admin/components/common/atom/TimePicker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import type { Control, FieldValues, Path } from "react-hook-form";

interface DateTimeFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  datePlaceholder?: string;
  disabled?: boolean;
  isOptional?: boolean;
  minuteStep?: 1 | 5 | 10 | 15 | 30;
}

function parseDateTime(value?: Date): { date: Date | undefined; time: string } {
  if (!value) {
    return { date: undefined, time: "" };
  }
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return { date: value, time: `${hours}:${minutes}` };
}

function combineDateTime(date: Date | undefined, time: string): Date | undefined {
  if (!date) return undefined;

  const newDate = new Date(date);
  if (time) {
    const [hours = "0", minutes = "0"] = time.split(":");
    newDate.setHours(Number(hours), Number(minutes), 0, 0);
  } else {
    newDate.setHours(0, 0, 0, 0);
  }
  return newDate;
}

export function DateTimeField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  datePlaceholder,
  disabled = false,
  isOptional = false,
  minuteStep = 5,
}: DateTimeFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const { date, time } = parseDateTime(field.value);

        const handleDateChange = (newDate: Date | undefined) => {
          field.onChange(combineDateTime(newDate, time));
        };

        const handleTimeChange = (newTime: string | undefined) => {
          field.onChange(combineDateTime(date, newTime || ""));
        };

        return (
          <FormItem className="rounded-lg border p-3 space-y-3">
            <div className="space-y-0.5">
              <FormLabel className="text-sm font-medium">
                {label} {!isOptional && <span className="text-destructive">*</span>}
              </FormLabel>
              <p className="text-xs text-muted-foreground">{description}</p>
              <FormMessage />
            </div>
            <FormControl>
              <div className="flex items-center gap-2">
                <DatePicker
                  value={date}
                  onChange={handleDateChange}
                  placeholder={datePlaceholder}
                  disabled={disabled}
                />
                <TimePicker
                  value={time}
                  onChange={handleTimeChange}
                  disabled={disabled}
                  minuteStep={minuteStep}
                />
              </div>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}
