"use client";

import { useEffect, useRef, useState } from "react";

interface UseImageMenuOptions {
  imageUrl?: string;
  title?: string;
}

export function useImageMenu({ imageUrl, title }: UseImageMenuOptions) {
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

  const handleImageSave = async () => {
    if (!imageUrl) return;
    setIsMenuOpen(false);
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title ?? "image"}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageShare = async () => {
    if (!imageUrl) return;
    setIsMenuOpen(false);
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `${title ?? "image"}.png`, { type: blob.type });
    if (navigator.share) {
      await navigator.share({ files: [file] });
    }
  };

  return {
    isMenuOpen,
    menuRef,
    toggleMenu,
    handleImageSave,
    handleImageShare,
  };
}
