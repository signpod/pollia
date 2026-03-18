import { ActionType, MatchMode } from "@prisma/client";
import { z } from "zod";

const actionTypeSchema = z.enum(ActionType);

const saveActionOptionInputSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  order: z.number(),
  isCorrect: z.boolean().optional(),
  fileUploadId: z.string().nullable().optional(),
  nextActionId: z.string().nullable().optional(),
  nextCompletionId: z.string().nullable().optional(),
});

const actionFormValuesSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imageFileUploadId: z.string().nullable().optional(),
  isRequired: z.boolean(),
  hasOther: z.boolean().optional(),
  maxSelections: z.number().optional(),
  options: z.array(saveActionOptionInputSchema).optional(),
  nextActionId: z.string().nullable().optional(),
  nextCompletionId: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  matchMode: z.nativeEnum(MatchMode).nullable().optional(),
  hint: z.string().nullable().optional(),
});

const actionFormRawSnapshotSchema = z.object({
  actionType: actionTypeSchema,
  values: actionFormValuesSchema,
  nextLinkType: z.enum(["action", "completion"]).optional(),
});

const draftActionItemSchema = z.object({
  key: z.string(),
});

export const actionSectionDraftSnapshotSchema = z.object({
  draftItems: z.array(draftActionItemSchema),
  formSnapshotByItemKey: z.record(z.string(), actionFormRawSnapshotSchema),
  actionTypeByItemKey: z.record(z.string(), actionTypeSchema),
  dirtyByItemKey: z.record(z.string(), z.boolean()),
  itemOrderKeys: z.array(z.string()).optional(),
});

export type ParsedActionSectionDraftSnapshot = z.infer<typeof actionSectionDraftSnapshotSchema>;

export type ParsedActionFormRawSnapshot = z.infer<typeof actionFormRawSnapshotSchema>;

const completionFormSnapshotSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable(),
  imageFileUploadId: z.string().nullable(),
});

const draftCompletionItemSchema = z.object({
  key: z.string(),
  title: z.string(),
});

export const completionSectionDraftSnapshotSchema = z.object({
  draftItems: z.array(draftCompletionItemSchema),
  formSnapshotByItemKey: z.record(z.string(), completionFormSnapshotSchema),
});

export type ParsedCompletionSectionDraftSnapshot = z.infer<
  typeof completionSectionDraftSnapshotSchema
>;

export type ParsedCompletionFormSnapshot = z.infer<typeof completionFormSnapshotSchema>;
