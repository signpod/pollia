import type { Prisma } from "@prisma/client";

export type OptionInput = Omit<Prisma.ActionOptionUncheckedCreateInput, "actionId">;

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
