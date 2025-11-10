import { XCircleIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { LabelText } from "./LabelText";
import { Typo, bodyVariants } from "./Typo";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "ref"> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  showLength?: boolean;
  required?: boolean;
  containerClassName?: string;
  textareaClassName?: string;
  resize?: "none" | "vertical" | "horizontal" | "both";
  ref?: React.Ref<HTMLTextAreaElement>;
}

const Textarea = ({
  value,
  defaultValue,
  maxLength,
  onChange,
  errorMessage,
  containerClassName,
  textareaClassName,
  label,
  helperText,
  showLength = true,
  required = false,
  rows = 4,
  resize = "vertical",
  className,
  ref,
  ...props
}: TextareaProps) => {
  const [internalValue, setInternalValue] = React.useState(
    value !== undefined ? value : defaultValue || "",
  );
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useImperativeHandle(ref, () => textareaRef.current!);

  // textarea가 리사이즈될 때 container도 따라가도록 동기화
  React.useEffect(() => {
    const textarea = textareaRef.current;
    const container = containerRef.current;
    if (!textarea || !container) return;

    let previousWidth: number | null = null;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;

        // 첫 observation: 초기 너비만 저장하고 max-width는 설정하지 않음
        if (previousWidth === null) {
          previousWidth = width;
          return;
        }

        // width가 실제로 변경되었을 때만 적용 (세로 리사이즈는 무시)
        if (Math.abs(width - previousWidth) > 1) {
          container.style.maxWidth = `${width}px`;
          previousWidth = width;
        }
      }
    });

    resizeObserver.observe(textarea);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (maxLength && newValue.length > maxLength) {
      const truncatedValue = newValue.slice(0, maxLength);
      setInternalValue(truncatedValue);

      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: truncatedValue },
        currentTarget: { ...e.currentTarget, value: truncatedValue },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange?.(syntheticEvent);
      return;
    }

    setInternalValue(newValue);
    onChange?.(e);
  };

  const handleClear = () => {
    setInternalValue("");
    if (textareaRef.current) {
      const syntheticEvent = {
        target: { value: "" },
        currentTarget: { value: "" },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange?.(syntheticEvent);
      textareaRef.current.focus();
    }
  };

  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = currentValue && currentValue.toString().length > 0;

  const shouldShowClearButton = hasValue && (isFocused || errorMessage);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const resizeClassMap = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  };

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {label && (
        <div className="flex items-center justify-between">
          <LabelText required={required}>{label}</LabelText>
        </div>
      )}
      <div ref={containerRef} className="grid w-full">
        <textarea
          className={cn(
            "col-start-1 row-start-1 w-full rounded-sm bg-white px-4 py-3 placeholder:text-disabled min-h-12",
            "focus-visible:outline-none disabled:bg-zinc-100 disabled:text-disabled",
            "transition-all duration-150",
            bodyVariants({ size: "large" }),
            resizeClassMap[resize],
            errorMessage && "ring-1 ring-error",
            !errorMessage && isFocused && "ring-1 ring-primary",
            !errorMessage && !isFocused && "ring-1 ring-default",
            textareaClassName || className,
          )}
          ref={textareaRef}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          rows={rows}
          {...props}
        />
        {shouldShowClearButton && (
          <button
            type="button"
            onMouseDown={e => {
              e.preventDefault();
              handleClear();
            }}
            className="col-start-1 row-start-1 self-start justify-self-end mt-3 mr-4 flex items-center justify-center rounded-full transition-colors w-fit h-fit"
            aria-label="입력 내용 지우기"
          >
            <XCircleIcon size={24} className="fill-icon-disabled text-white" />
          </button>
        )}
        {showLength && maxLength && (
          <Typo.Body
            size="small"
            className="col-start-1 row-start-1 place-self-end text-disabled pointer-events-none mb-3 mr-4"
          >
            {currentValue.toString().length}/{maxLength}
          </Typo.Body>
        )}
      </div>
      {(helperText || errorMessage) && (
        <Typo.Body
          size="medium"
          className={cn("px-2", errorMessage ? "text-error" : "text-disabled")}
        >
          {errorMessage || helperText}
        </Typo.Body>
      )}
    </div>
  );
};

Textarea.displayName = "Textarea";

export { Textarea };
