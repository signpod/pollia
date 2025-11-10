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
  const [isFocused, setIsFocused] = React.useState(false);
  const [textareaSize, setTextareaSize] = React.useState({ width: 0, height: 0 });

  React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setTextareaSize({ width, height });
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
      <div className="relative">
        <textarea
          className={cn(
            "w-full rounded-sm bg-white px-4 py-3 ring-1 ring-default placeholder:text-disabled",
            "focus-visible:ring-primary focus-visible:outline-none disabled:bg-zinc-100 disabled:text-disabled",
            bodyVariants({ size: "large" }),
            resizeClassMap[resize],
            errorMessage && "ring-error focus-visible:ring-error",
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
            className="absolute top-2 right-2 flex items-center justify-center rounded-full transition-colors"
            aria-label="입력 내용 지우기"
          >
            <XCircleIcon size={24} className="fill-icon-disabled text-white" />
          </button>
        )}
        {showLength && maxLength && (
          <Typo.Body
            size="small"
            className="absolute text-disabled pointer-events-none"
            style={{
              bottom: "12px",
              left: textareaSize.width > 0 ? `${textareaSize.width - 16}px` : "auto",
              right: textareaSize.width > 0 ? "auto" : "16px",
            }}
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
