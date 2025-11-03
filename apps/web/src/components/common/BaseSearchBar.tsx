import { Input } from "@repo/ui/components";
import { ComponentProps } from "react";

interface SearchBarProps extends ComponentProps<"input"> {
  placeholder?: string;
  containerClassName?: string;
  inputClassName?: string;
}

export function BaseSearchBar({
  placeholder = "검색어를 입력해주세요",
  containerClassName,
  inputClassName,
  ...props
}: SearchBarProps) {
  return (
    <Input
      placeholder={placeholder}
      containerClassName={containerClassName}
      inputClassName={inputClassName}
      {...props}
    />
  );
}
