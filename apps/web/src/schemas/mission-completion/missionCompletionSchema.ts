import { stripHtmlTags } from "@/app/admin/lib/utils";
import { z } from "zod";

export const MISSION_COMPLETION_TITLE_MAX_LENGTH = 100;
export const MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH = 500;

const titleSchema = z
  .string()
  .min(1, "제목을 입력해주세요.")
  .max(
    MISSION_COMPLETION_TITLE_MAX_LENGTH,
    `제목은 ${MISSION_COMPLETION_TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`,
  )
  .trim();

const descriptionSchema = z
  .string()
  .trim()
  .refine(
    value => {
      const textContent = stripHtmlTags(value);
      return textContent.length > 0;
    },
    {
      message: "설명을 입력해주세요.",
    },
  )
  .refine(
    value => {
      const textContent = stripHtmlTags(value);
      return textContent.length <= MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH;
    },
    {
      message: `설명은 ${MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH}자를 초과할 수 없습니다.`,
    },
  );

const imageUrlSchema = z.url({ message: "올바른 URL 형식이 아닙니다." }).optional();
const imageFileUploadIdSchema = z.string().optional();

const linksSchema = z
  .record(z.string(), z.url({ message: "올바른 URL 형식이 아닙니다." }))
  .optional();

export const missionCompletionInputSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  imageUrl: imageUrlSchema,
  imageFileUploadId: imageFileUploadIdSchema,
  links: linksSchema,
  missionId: z.string().min(1, "미션 ID는 필수입니다."),
});

export const missionCompletionUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    imageUrl: imageUrlSchema,
    imageFileUploadId: imageFileUploadIdSchema,
    links: linksSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type MissionCompletionInput = z.infer<typeof missionCompletionInputSchema>;
export type MissionCompletionUpdate = z.infer<typeof missionCompletionUpdateSchema>;
