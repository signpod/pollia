"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { IconButton } from "./IconButton";
import { Typo } from "./Typo";

interface DrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const DrawerContext = React.createContext<DrawerContextType | undefined>(undefined);

export const useDrawer = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
};

interface DrawerProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function DrawerProvider({ children, defaultOpen = false }: DrawerProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

  const value = React.useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
    }),
    [isOpen, open, close, toggle],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

interface DrawerContentProps {
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}

export function DrawerContent({ className, containerClassName, children }: DrawerContentProps) {
  const { isOpen, close } = useDrawer();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, close]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn("fixed inset-0 z-50 flex items-end justify-center", containerClassName)}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("absolute inset-0 bg-black/50")}
          onClick={close}
        />

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
          }}
          className={cn(
            "relative z-10 w-full",
            "bg-background rounded-t-lg shadow-lg",
            "flex max-h-[85vh] flex-col overflow-hidden",
            "mx-auto max-w-[600px]",
            "pb-[env(safe-area-inset-bottom)]",
            className,
          )}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

interface DrawerHeaderProps {
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export function DrawerHeader({ className, children, showCloseButton = true }: DrawerHeaderProps) {
  const { close } = useDrawer();
  return (
    <div className={cn("flex items-center justify-between p-5 pb-6", className)}>
      <Typo.MainTitle size="small" className="flex-1">
        {children}
      </Typo.MainTitle>
      {showCloseButton && <IconButton icon={X} onClick={close} aria-label="닫기" />}
    </div>
  );
}
