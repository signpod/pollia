import { z } from "zod";
import { baseInfoSchema } from "./baseInfoSchema";

export const eitherOrInfoSchema = baseInfoSchema;

export type EitherOrInfoFormData = z.infer<typeof eitherOrInfoSchema>;
