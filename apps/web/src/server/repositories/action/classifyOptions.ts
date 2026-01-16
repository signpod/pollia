export interface OptionInput {
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  order: number;
  imageFileUploadId?: string | null;
}

export interface ClassifiedOptions {
  toUpdate: OptionInput[];
  toCreate: OptionInput[];
  toDeleteIds: string[];
}

export function classifyOptions(
  existingIds: Set<string>,
  options: OptionInput[],
): ClassifiedOptions {
  // TODO: 구현 필요
  throw new Error("Not implemented");
}
