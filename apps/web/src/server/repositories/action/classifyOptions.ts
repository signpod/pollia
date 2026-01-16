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
  const toUpdate = options.filter(o => o.id && existingIds.has(o.id));
  const toCreate = options.filter(o => !o.id);
  const receivedIds = new Set(
    options.map(o => o.id).filter((id): id is string => id !== undefined),
  );
  const toDeleteIds = [...existingIds].filter(id => !receivedIds.has(id));

  return { toUpdate, toCreate, toDeleteIds };
}
