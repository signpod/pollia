import { ButtonV2, Typo } from "@repo/ui/components";
import { DeleteIcon } from "lucide-react";

interface KeyboardProps {
  onPasswordChange: (value: string) => void;
  onPasswordDelete: () => void;
  disabled?: boolean;
}

export function Keyboard({ onPasswordChange, onPasswordDelete, disabled }: KeyboardProps) {
  return (
    <div className="grid grid-cols-3 px-5 pb-8 gap-y-4 none-select">
      {Array.from({ length: 9 }).map((_, index) => (
        <ButtonV2
          variant="tertiary"
          key={`keyboard-button-${index}`}
          onClick={() => onPasswordChange(String(index + 1))}
          disabled={disabled}
        >
          <div className="flex items-center justify-center w-full h-full">
            <Typo.MainTitle size="large">{index + 1}</Typo.MainTitle>
          </div>
        </ButtonV2>
      ))}
      <ButtonV2 variant="tertiary" disabled>
        <div />
      </ButtonV2>
      <ButtonV2 variant="tertiary" onClick={() => onPasswordChange("0")} disabled={disabled}>
        <div className="flex items-center justify-center w-full h-full">
          <Typo.MainTitle size="large">0</Typo.MainTitle>
        </div>
      </ButtonV2>
      <ButtonV2 variant="tertiary" onClick={onPasswordDelete} disabled={disabled}>
        <div className="flex items-center justify-center w-full h-full">
          <DeleteIcon className="text-info size-6" />
        </div>
      </ButtonV2>
    </div>
  );
}
