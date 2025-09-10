"use client";

import { cn } from "../../lib/utils";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface BottomCTAContextType {
  currentCTA: ReactNode | null;
  setCTA: (cta: ReactNode, className: string) => void;
  clearCTA: () => void;
}

const BottomCTAContext = createContext<BottomCTAContextType | null>(null);

interface BottomCTALayoutProps {
  children: ReactNode;
  className?: string;
}

export function BottomCTALayout({ children, className }: BottomCTALayoutProps) {
  const [currentCTA, setCurrentCTA] = useState<ReactNode | null>(null);
  const [ctaClassName, setCTAClassName] = useState<string | null>(null);

  const setCTA = (cta: ReactNode, className: string) => {
    setCurrentCTA(cta);
    setCTAClassName(className);
  };

  const clearCTA = () => {
    setCurrentCTA(null);
    setCTAClassName(null);
  };

  return (
    <BottomCTAContext.Provider value={{ currentCTA, setCTA, clearCTA }}>
      <div className={cn("relative", className)}>
        {children}

        {currentCTA && (
          <div
            className={cn("fixed bottom-0 left-0 right-0 z-50", ctaClassName)}
          >
            {currentCTA}
          </div>
        )}
      </div>
    </BottomCTAContext.Provider>
  );
}

interface CTAProps {
  children: ReactNode;
  className?: string;
}

function CTA({ children, className }: CTAProps) {
  const context = useContext(BottomCTAContext);

  if (!context) {
    throw new Error("BottomCTALayout.CTA must be used within BottomCTALayout");
  }

  const { setCTA, clearCTA } = context;

  useEffect(() => {
    setCTA(children, className ?? "");

    return () => {
      clearCTA();
    };
  }, [children, setCTA, clearCTA, className]);

  return null;
}

BottomCTALayout.CTA = CTA;
