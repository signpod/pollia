import styled from "@emotion/styled";
import { type InputHTMLAttributes, forwardRef } from "react";
import { color, fontSize, radius, transition } from "./tokens";

const StyledInput = styled.input`
  display: block;
  width: 100%;
  height: 36px;
  padding: 0 12px;
  font-size: ${fontSize.sm};
  line-height: 1.5;
  color: ${color.gray900};
  background: ${color.white};
  border: 1px solid ${color.gray200};
  border-radius: ${radius.md};
  outline: none;
  transition: border-color ${transition.fast};

  &::placeholder {
    color: ${color.gray400};
  }

  &:focus {
    border-color: ${color.blue500};
    box-shadow: 0 0 0 2px ${color.blue100};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${color.gray50};
  }
`;

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <StyledInput ref={ref} {...props} />,
);
Input.displayName = "Input";
