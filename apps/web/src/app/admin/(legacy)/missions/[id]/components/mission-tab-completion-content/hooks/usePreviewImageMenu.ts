"use client";

import { useEffect, useRef, useState } from "react";

export function usePreviewImageMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const noop = () => {};

  return {
    isMenuOpen,
    menuRef,
    toggleMenu,
    handleImageSave: noop,
    handleImageShare: noop,
  };
}
