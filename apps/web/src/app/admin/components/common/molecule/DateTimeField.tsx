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
import { Switch } from "@/app/admin/components/shadcn-ui/switch";
import { useRef } from "react";
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
  supportNull?: boolean;
}

function parseDateTime(value?: Date | null): {
  date: Date | undefined;
  time: string;
  isEnabled: boolean;
} {
  if (value === null) {
    return { date: undefined, time: "", isEnabled: false };
  }

  if (!value) {
    return { date: undefined, time: "", isEnabled: true };
  }

  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return { date: value, time: `${hours}:${minutes}`, isEnabled: true };
}

function combineDateTime(
  date: Date | undefined,
  time: string,
  isEnabled: boolean,
): Date | null | undefined {
  if (!isEnabled) return null;

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
  supportNull = false,
}: DateTimeFieldProps<T>) {
  const lastValidValueRef = useRef<Date | undefined>(undefined);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const { date, time, isEnabled } = parseDateTime(field.value);

        if (field.value && field.value !== null) {
          lastValidValueRef.current = field.value;
        }

        const handleDateChange = (newDate: Date | undefined) => {
          field.onChange(combineDateTime(newDate, time, isEnabled));
        };

        const handleTimeChange = (newTime: string | undefined) => {
          field.onChange(combineDateTime(date, newTime || "", isEnabled));
        };

        const handleToggle = (checked: boolean) => {
          if (checked) {
            const valueToRestore = lastValidValueRef.current || new Date();
            field.onChange(valueToRestore);
          } else {
            field.onChange(null);
          }
        };

        if (supportNull) {
          return (
            <FormItem className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
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
                        disabled={!isEnabled || disabled}
                      />
                      <TimePicker
                        value={time}
                        onChange={handleTimeChange}
                        disabled={!isEnabled || disabled}
                        minuteStep={minuteStep}
                      />
                    </div>
                  </FormControl>
                </div>
                <Switch checked={isEnabled} onCheckedChange={handleToggle} disabled={disabled} />
              </div>
            </FormItem>
          );
        }

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
