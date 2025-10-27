import { z } from "zod";
import { baseInfoSchema } from "./baseInfoSchema";

export const subjectiveInfoSchema = baseInfoSchema;

export type SubjectiveInfoFormData = z.infer<typeof subjectiveInfoSchema>;
