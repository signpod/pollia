import { z } from "zod";
import { baseInfoSchema } from "../baseInfoSchema";

export const scaleInfoSchema = baseInfoSchema;

export type ScaleInfoFormData = z.infer<typeof scaleInfoSchema>;
