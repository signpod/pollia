import * as React from "react";
import { cn } from "../../lib/utils";
import { XCircleIcon } from "lucide-react";
import { Typo, bodyVariants } from "./Typo";
import { LabelText } from "./LabelText";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "ref"> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  showLength?: boolean;
  required?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const Input = ({
  value,
  defaultValue,
  maxLength,
  onChange,
  errorMessage,
  containerClassName,
  inputClassName,
  label,
  helperText,
  showLength = true,
  required = false,
  type,
  className,
  ref,
  ...props
}: InputProps) => {
  const [internalValue, setInternalValue] = React.useState(
    value !== undefined ? value : defaultValue || ""
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  // ref를 inputRef와 전달받은 ref 모두에 연결
  React.useImperativeHandle(ref, () => inputRef.current!);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // maxLength가 설정되어 있고, 현재 값이 제한을 초과하는 경우
    if (maxLength && newValue.length > maxLength) {
      // 제한된 길이만큼만 잘라서 사용
      const truncatedValue = newValue.slice(0, maxLength);
      setInternalValue(truncatedValue);

      // 잘린 값으로 synthetic event 생성
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: truncatedValue },
        currentTarget: { ...e.currentTarget, value: truncatedValue },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
      return;
    }

    setInternalValue(newValue);
    onChange?.(e);
  };

  const handleClear = () => {
    setInternalValue("");
    if (inputRef.current) {
      // onChange 이벤트를 수동으로 발생시켜서 부모 컴포넌트에 알림
      const syntheticEvent = {
        target: { value: "" },
        currentTarget: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
      inputRef.current.focus();
    }
  };

  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = currentValue && currentValue.toString().length > 0;

  // x 버튼이 보여야 하는 조건:
  // 1. focus를 가지고 있고, 값이 있으면 무조건 보여줘야함
  // 2. error인 상태이고, 값이 있다면 무조건 보여줘야 함
  const shouldShowClearButton = hasValue && (isFocused || errorMessage);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {label && (
        <div className="flex items-center justify-between">
          <LabelText required={required}>{label}</LabelText>
          {showLength && maxLength && (
            <Typo.Body size="small" className="text-zinc-400">
              {currentValue.toString().length}/{maxLength}
            </Typo.Body>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-sm ring-1 ring-zinc-200 bg-white px-3 py-2 placeholder:text-zinc-300 focus-visible:outline-none focus-visible:ring-primary disabled:bg-zinc-100 disabled:text-zinc-500 pr-8",
            bodyVariants({ size: "large" }),
            errorMessage && "ring-red-500 focus-visible:ring-red-500",
            inputClassName || className
          )}
          ref={inputRef}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          {...props}
        />
        {shouldShowClearButton && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleClear();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-colors"
            aria-label="입력 내용 지우기"
          >
            <XCircleIcon size={24} className="fill-zinc-200 text-white" />
          </button>
        )}
      </div>
      {(helperText || errorMessage) && (
        <Typo.Body
          size="small"
          className={cn(errorMessage ? "text-red-500" : "text-zinc-400")}
        >
          {errorMessage || helperText}
        </Typo.Body>
      )}
    </div>
  );
};

Input.displayName = "Input";

export { Input };
