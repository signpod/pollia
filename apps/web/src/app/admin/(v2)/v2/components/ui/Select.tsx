import styled from "@emotion/styled";
import { type SelectHTMLAttributes, forwardRef } from "react";
import { color, fontSize, radius, transition } from "./tokens";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
}

const StyledSelect = styled.select`
  height: 32px;
  padding: 0 28px 0 8px;
  font-size: ${fontSize.sm};
  color: ${color.gray700};
  background: ${color.white};
  border: 1px solid ${color.gray200};
  border-radius: ${radius.md};
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: border-color ${transition.fast};

  &:focus {
    border-color: ${color.blue500};
    box-shadow: 0 0 0 2px ${color.blue100};
  }
`;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ options, ...props }, ref) => (
  <StyledSelect ref={ref} {...props}>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </StyledSelect>
));
Select.displayName = "Select";
