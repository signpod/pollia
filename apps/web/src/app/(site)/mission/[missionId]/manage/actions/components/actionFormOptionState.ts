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
