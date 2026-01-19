import { z } from "zod";

export const EVENT_TITLE_MAX_LENGTH = 100;
export const EVENT_DESCRIPTION_MAX_LENGTH = 2000;

const titleSchema = z
  .string()
  .min(1, "제목을 입력해주세요.")
  .max(EVENT_TITLE_MAX_LENGTH, `제목은 ${EVENT_TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`)
  .trim();

const descriptionSchema = z
  .string()
  .max(
    EVENT_DESCRIPTION_MAX_LENGTH,
    `설명은 ${EVENT_DESCRIPTION_MAX_LENGTH}자를 초과할 수 없습니다.`,
  )
  .optional();

const startDateSchema = z.date().optional();
const endDateSchema = z.date().optional();

export const eventInputSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    startDate: startDateSchema,
    endDate: endDateSchema,
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "시작일은 종료일보다 이전이어야 합니다.",
      path: ["startDate"],
    },
  );

export const eventUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    startDate: startDateSchema,
    endDate: endDateSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "시작일은 종료일보다 이전이어야 합니다.",
      path: ["startDate"],
    },
  );

export type EventInput = z.input<typeof eventInputSchema>;
export type EventUpdate = z.input<typeof eventUpdateSchema>;
