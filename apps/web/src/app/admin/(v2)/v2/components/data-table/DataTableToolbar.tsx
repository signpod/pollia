"use client";

import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
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
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <TextField
        placeholder={searchPlaceholder}
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        sx={{ maxWidth: 384, flex: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          },
        }}
      />
      {children}
    </div>
  );
}
