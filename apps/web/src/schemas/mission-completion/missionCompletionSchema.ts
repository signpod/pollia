import { stripHtmlTags } from "@/app/admin/lib/utils";
import { z } from "zod";

export const MISSION_COMPLETION_TITLE_MAX_LENGTH = 100;
export const MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH = 2000;
export const MISSION_COMPLETION_LINKS_MAX_COUNT = 4;
export const MISSION_COMPLETION_LINK_NAME_MAX_LENGTH = 50;

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
const updateImageUrlSchema = z
  .url({ message: "올바른 URL 형식이 아닙니다." })
  .nullable()
  .optional();
const updateImageFileUploadIdSchema = z.string().nullable().optional();

const completionLinkSchema = z.object({
  name: z
    .string()
    .min(1, "링크 이름을 입력해주세요.")
    .max(
      MISSION_COMPLETION_LINK_NAME_MAX_LENGTH,
      `링크 이름은 ${MISSION_COMPLETION_LINK_NAME_MAX_LENGTH}자를 초과할 수 없습니다.`,
    ),
  url: z.url({ message: "올바른 URL 형식이 아닙니다." }),
  order: z.number().int().min(0),
  imageUrl: z.url({ message: "올바른 URL 형식이 아닙니다." }).nullable().optional(),
  fileUploadId: z.string().nullable().optional(),
});

const linksSchema = z
  .array(completionLinkSchema)
  .max(
    MISSION_COMPLETION_LINKS_MAX_COUNT,
    `링크는 최대 ${MISSION_COMPLETION_LINKS_MAX_COUNT}개까지 추가할 수 있습니다.`,
  )
  .optional();

const scoreRatioSchema = z
  .number()
  .int("정수여야 합니다.")
  .min(0, "0 이상이어야 합니다.")
  .max(100, "100 이하여야 합니다.")
  .nullable()
  .optional();

export const missionCompletionInputSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  imageUrl: imageUrlSchema,
  imageFileUploadId: imageFileUploadIdSchema,
  links: linksSchema,
  missionId: z.string().min(1, "미션 ID는 필수입니다."),
  minScoreRatio: scoreRatioSchema,
  maxScoreRatio: scoreRatioSchema,
});

export const missionCompletionFormSchema = missionCompletionInputSchema.omit({
  missionId: true,
});

export const missionCompletionUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    imageUrl: updateImageUrlSchema,
    imageFileUploadId: updateImageFileUploadIdSchema,
    links: linksSchema,
    minScoreRatio: scoreRatioSchema,
    maxScoreRatio: scoreRatioSchema,
  })
  .refine(
    data =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.imageUrl !== undefined ||
      data.imageFileUploadId !== undefined ||
      data.links !== undefined ||
      data.minScoreRatio !== undefined ||
      data.maxScoreRatio !== undefined,
    {
      message: "최소 하나의 필드를 수정해야 합니다.",
    },
  );

export type MissionCompletionInput = z.infer<typeof missionCompletionInputSchema>;
export type MissionCompletionForm = z.infer<typeof missionCompletionFormSchema>;
export type MissionCompletionUpdate = z.infer<typeof missionCompletionUpdateSchema>;
