import styled from "@emotion/styled";
import { type TdHTMLAttributes, type ThHTMLAttributes, forwardRef } from "react";
import { color, fontSize } from "./tokens";

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${fontSize.sm};
`;

export const TableHeader = styled.thead`
  border-bottom: 1px solid ${color.gray200};
`;

export const TableBody = styled.tbody`
  & > tr:not(:last-child) {
    border-bottom: 1px solid ${color.gray100};
  }
`;

export const TableRow = styled.tr`
  transition: background 150ms ease;
  &:hover {
    background: ${color.gray50};
  }
`;

export const TableHead = styled.th<ThHTMLAttributes<HTMLTableCellElement>>`
  padding: 8px 16px;
  text-align: left;
  font-weight: 500;
  color: ${color.gray500};
  font-size: ${fontSize.xs};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  center?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ center, style, ...props }, ref) => (
    <StyledTd
      ref={ref}
      style={{
        ...style,
        ...(center ? { textAlign: "center" } : {}),
      }}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

const StyledTd = styled.td`
  padding: 12px 16px;
  color: ${color.gray800};
  vertical-align: middle;
`;
