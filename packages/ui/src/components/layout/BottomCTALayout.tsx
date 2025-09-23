"use client";

import { cn } from "../../lib/utils";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useLayoutEffect,
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
  hasBottomGap?: boolean;
}

export function BottomCTALayout({
  children,
  className,
  hasBottomGap = true,
}: BottomCTALayoutProps) {
  const [currentCTA, setCurrentCTA] = useState<ReactNode | null>(null);
  const [ctaClassName, setCTAClassName] = useState<string | null>(null);
  const [ctaHeight, setCTAHeight] = useState(0);
  const ctaRef = useRef<HTMLDivElement>(null);

  const setCTA = (cta: ReactNode, className: string) => {
    setCurrentCTA(cta);
    setCTAClassName(className);
  };

  const clearCTA = () => {
    setCurrentCTA(null);
    setCTAClassName(null);
  };

  useLayoutEffect(() => {
    if (currentCTA && ctaRef.current) {
      const updateHeight = () => {
        setCTAHeight(ctaRef.current?.offsetHeight || 0);
      };

      updateHeight();

      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(ctaRef.current);

      return () => resizeObserver.disconnect();
    } else {
      setCTAHeight(0);
    }
  }, [currentCTA]);

  return (
    <BottomCTAContext.Provider value={{ currentCTA, setCTA, clearCTA }}>
      <div className={cn("relative", className)}>
        <div
          style={{
            paddingBottom: hasBottomGap ? `${ctaHeight + 20}px` : "0px",
          }}
        >
          {children}
        </div>

        {currentCTA && (
          <div
            ref={ctaRef}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 bg-white",
              ctaClassName
            )}
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

  useLayoutEffect(() => {
    setCTA(children, className ?? "");

    return () => {
      clearCTA();
    };
  }, [children, setCTA, clearCTA, className]);

  return null;
}

BottomCTALayout.CTA = CTA;
