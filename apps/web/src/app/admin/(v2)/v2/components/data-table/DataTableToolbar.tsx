"use client";

import styled from "@emotion/styled";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../ui/Input";
import { color } from "../ui/tokens";

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
    <Container>
      <SearchGroup>
        <SearchWrapper>
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
          <Input
            placeholder={searchPlaceholder}
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
            style={{ paddingLeft: 32, height: 36 }}
          />
        </SearchWrapper>
        {children}
      </SearchGroup>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 384px;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${color.gray400};
  pointer-events: none;
  display: flex;
`;
