"use client";

import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "검색...",
  children,
}: DataTableToolbarProps) {
  const [localValue, setLocalValue] = useState(searchValue);

  useEffect(() => {
    setLocalValue(searchValue);
  }, [searchValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== searchValue) {
        onSearchChange(localValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, searchValue, onSearchChange]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
