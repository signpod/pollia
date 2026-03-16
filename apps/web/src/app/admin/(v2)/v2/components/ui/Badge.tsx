import styled from "@emotion/styled";
import type { HTMLAttributes } from "react";
import { color, fontSize, radius } from "./tokens";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: `
    background: ${color.blue600};
    color: ${color.white};
    border-color: ${color.blue600};
  `,
  secondary: `
    background: ${color.gray100};
    color: ${color.gray600};
    border-color: ${color.gray100};
  `,
  outline: `
    background: transparent;
    color: ${color.gray700};
    border-color: ${color.gray200};
  `,
  destructive: `
    background: ${color.red600};
    color: ${color.white};
    border-color: ${color.red600};
  `,
};

const StyledBadge = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${radius.full};
  border: 1px solid;
  padding: 2px 10px;
  font-size: ${fontSize.xs};
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;

  ${({ $variant }) => variantStyles[$variant]}
`;

export function Badge({ variant = "default", ...props }: BadgeProps) {
  return <StyledBadge $variant={variant} {...props} />;
}
