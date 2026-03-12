export interface KeyedOptionItem {
  _key: string;
}

export function patchOptionByKey<T extends KeyedOptionItem>(
  options: T[],
  optionKey: string,
  patch: Partial<T>,
): T[] {
  return options.map(option => (option._key === optionKey ? { ...option, ...patch } : option));
}

export function removeOptionByKey<T extends KeyedOptionItem>(options: T[], optionKey: string): T[] {
  return options.filter(option => option._key !== optionKey);
}

export function moveOptionByKey<T extends KeyedOptionItem>(
  options: T[],
  optionKey: string,
  direction: "up" | "down",
): T[] {
  const index = options.findIndex(o => o._key === optionKey);
  if (index === -1) return options;
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= options.length) return options;
  const next = [...options];
  const temp = next[index];
  // biome-ignore lint/style/noNonNullAssertion: 인덱스 범위가 위에서 검증됨
  next[index] = next[newIndex]!;
  // biome-ignore lint/style/noNonNullAssertion: 인덱스 범위가 위에서 검증됨
  next[newIndex] = temp!;
  return next;
}
