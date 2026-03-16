import styled from "@emotion/styled";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { color, fontSize, radius, transition } from "./tokens";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: `
    background: ${color.blue600};
    color: ${color.white};
    border: 1px solid ${color.blue600};
    &:hover:not(:disabled) { background: ${color.blue700}; }
  `,
  outline: `
    background: ${color.white};
    color: ${color.gray700};
    border: 1px solid ${color.gray200};
    &:hover:not(:disabled) { background: ${color.gray50}; }
  `,
  ghost: `
    background: transparent;
    color: ${color.gray700};
    border: 1px solid transparent;
    &:hover:not(:disabled) { background: ${color.gray100}; }
  `,
  destructive: `
    background: ${color.red600};
    color: ${color.white};
    border: 1px solid ${color.red600};
    &:hover:not(:disabled) { background: ${color.red700}; }
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  default: `
    height: 36px;
    padding: 0 16px;
    font-size: ${fontSize.sm};
  `,
  sm: `
    height: 28px;
    padding: 0 12px;
    font-size: ${fontSize.xs};
  `,
  icon: `
    height: 28px;
    width: 28px;
    padding: 0;
    font-size: ${fontSize.sm};
  `,
};

const StyledButton = styled.button<{ $variant: ButtonVariant; $size: ButtonSize }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${radius.md};
  font-weight: 500;
  cursor: pointer;
  transition: all ${transition.fast};
  white-space: nowrap;
  line-height: 1;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", ...props }, ref) => (
    <StyledButton ref={ref} $variant={variant} $size={size} {...props} />
  ),
);
Button.displayName = "Button";
