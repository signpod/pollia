import { ButtonV2, Typo } from "@repo/ui/components";
import { DeleteIcon } from "lucide-react";
import { useEffect, useRef } from "react";

interface KeyboardProps {
  onPasswordChange: (value: string) => void;
  onPasswordDelete: () => void;
  disabled?: boolean;
}

const KEYBOARD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function Keyboard({ onPasswordChange, onPasswordDelete, disabled }: KeyboardProps) {
  const onPasswordChangeRef = useRef(onPasswordChange);
  const onPasswordDeleteRef = useRef(onPasswordDelete);

  useEffect(() => {
    onPasswordChangeRef.current = onPasswordChange;
    onPasswordDeleteRef.current = onPasswordDelete;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key >= "0" && e.key <= "9") {
        onPasswordChangeRef.current(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        onPasswordDeleteRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled]);

  return (
    <div className="grid grid-cols-3 px-5 pb-8 gap-y-4 none-select">
      {KEYBOARD_NUMBERS.map(num => (
        <ButtonV2
          variant="tertiary"
          key={`keyboard-button-${num}`}
          onClick={() => onPasswordChange(String(num))}
          disabled={disabled}
        >
          <div className="flex items-center justify-center w-full h-full">
            <Typo.MainTitle size="medium">{num}</Typo.MainTitle>
          </div>
        </ButtonV2>
      ))}
      <ButtonV2 variant="tertiary" disabled>
        <div />
      </ButtonV2>
      <ButtonV2 variant="tertiary" onClick={() => onPasswordChange("0")} disabled={disabled}>
        <div className="flex items-center justify-center w-full h-full">
          <Typo.MainTitle size="medium">0</Typo.MainTitle>
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
