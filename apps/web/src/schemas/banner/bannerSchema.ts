import { z } from "zod";

export const BANNER_TITLE_MAX_LENGTH = 100;
export const BANNER_SUBTITLE_MAX_LENGTH = 200;

export const bannerCreateSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(BANNER_TITLE_MAX_LENGTH, `제목은 ${BANNER_TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`)
    .trim(),
  subtitle: z
    .string()
    .max(
      BANNER_SUBTITLE_MAX_LENGTH,
      `부제목은 ${BANNER_SUBTITLE_MAX_LENGTH}자를 초과할 수 없습니다.`,
    )
    .trim()
    .optional()
    .nullable(),
  imageUrl: z.string().min(1, "이미지 URL을 입력해주세요.").trim(),
  imageFileUploadId: z.string().optional().nullable(),
});

export const bannerUpdateSchema = bannerCreateSchema.partial();

export const bannerReorderSchema = z.object({
  orders: z
    .array(
      z.object({
        id: z.string(),
        order: z.number().int().min(0),
      }),
    )
    .min(1, "순서 변경할 배너가 없습니다."),
});
