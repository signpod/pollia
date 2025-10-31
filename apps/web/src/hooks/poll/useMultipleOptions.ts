import { useAtomValue, useSetAtom } from "jotai";
import {
  addOptionAtom,
  clearOptionsAtom,
  multiplePollOptionsAtom,
  removeOptionAtom,
  resetOptionsAtom,
  updateOptionAtom,
} from "@/atoms/create/multiplePollAtoms";
import { PollOption } from "@/types/domain/poll";

export type OptionUpdateData = Partial<Omit<PollOption, "id" | "order">>;

const MAX_OPTIONS = 10;
const MIN_OPTIONS = 2;

export interface UseMultipleOptionsReturn {
  options: PollOption[];
  addOption: () => void;
  removeOption: (optionId: string) => void;
  updateOption: (optionId: string, data: OptionUpdateData) => void;
  clearOptions: () => void;
  resetOptions: () => void;
  optionCount: number;
  findOption: (optionId: string) => PollOption | undefined;
  hasOptionId: (optionId: string) => boolean;
  validOptionCount: number;

  canAddMore: boolean;
  canRemove: boolean;
  maxOptions: number;
  minOptions: number;
  isAtMaxLimit: boolean;
  isAtMinLimit: boolean;
}

export function useMultipleOptions(): UseMultipleOptionsReturn {
  const options = useAtomValue(multiplePollOptionsAtom);
  const add = useSetAtom(addOptionAtom);
  const remove = useSetAtom(removeOptionAtom);
  const update = useSetAtom(updateOptionAtom);
  const clear = useSetAtom(clearOptionsAtom);
  const reset = useSetAtom(resetOptionsAtom);

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) {
      console.warn(`최대 ${MAX_OPTIONS}개까지만 옵션을 추가할 수 있습니다.`);
      return;
    }
    add();
  };

  const removeOption = (optionId: string) => {
    if (options.length <= MIN_OPTIONS) {
      console.warn(`최소 ${MIN_OPTIONS}개의 옵션이 필요합니다.`);
      return;
    }
    remove(optionId);
  };

  const updateOption = (optionId: string, data: OptionUpdateData) => {
    update({ id: optionId, data });
  };

  const clearOptions = () => {
    clear();
  };

  const resetOptions = () => {
    reset();
  };

  const findOption = (optionId: string): PollOption | undefined => {
    return options.find(option => option.id === optionId);
  };

  const hasOptionId = (optionId: string): boolean => {
    return options.some(option => option.id === optionId);
  };

  const validOptionCount = options.filter(option => option.description.trim().length > 0).length;

  const optionCount = options.length;
  const canAddMore = optionCount < MAX_OPTIONS;
  const canRemove = optionCount > MIN_OPTIONS;
  const isAtMaxLimit = optionCount >= MAX_OPTIONS;
  const isAtMinLimit = optionCount <= MIN_OPTIONS;

  return {
    options,
    addOption,
    removeOption,
    updateOption,
    clearOptions,
    resetOptions,
    optionCount,
    findOption,
    hasOptionId,
    validOptionCount,

    canAddMore,
    canRemove,
    maxOptions: MAX_OPTIONS,
    minOptions: MIN_OPTIONS,
    isAtMaxLimit,
    isAtMinLimit,
  };
}
