import { ComponentProps } from "react";
import { cn } from "../../lib";

interface GridBoxProps extends ComponentProps<"div"> {
  children: React.ReactNode;
  columns: number;
}

export function GridBox({ children, columns, className, ...props }: GridBoxProps) {
  const columnsClass = createColumnsClass(columns);

  return (
    <div className={cn("grid gap-4 w-full", columnsClass, className)} {...props}>
      {children}
    </div>
  );
}

function createColumnsClass(columns: number) {
  const columnsMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };
  return columnsMap[columns] || "grid-cols-2";
}
