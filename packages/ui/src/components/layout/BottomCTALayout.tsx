"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface BottomCTAContextType {
  currentCTA: ReactNode | null;
  setCTA: (cta: ReactNode) => void;
  clearCTA: () => void;
}

const BottomCTAContext = createContext<BottomCTAContextType | null>(null);

interface BottomCTALayoutProps {
  children: ReactNode;
}

export function BottomCTALayout({ children }: BottomCTALayoutProps) {
  const [currentCTA, setCurrentCTA] = useState<ReactNode | null>(null);

  const setCTA = (cta: ReactNode) => {
    setCurrentCTA(cta);
  };

  const clearCTA = () => {
    setCurrentCTA(null);
  };

  return (
    <BottomCTAContext.Provider value={{ currentCTA, setCTA, clearCTA }}>
      <div className="relative">
        {children}

        {currentCTA && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white">
            {currentCTA}
          </div>
        )}
      </div>
    </BottomCTAContext.Provider>
  );
}

interface CTAProps {
  children: ReactNode;
}

function CTA({ children }: CTAProps) {
  const context = useContext(BottomCTAContext);

  if (!context) {
    throw new Error("BottomCTALayout.CTA must be used within BottomCTALayout");
  }

  const { setCTA, clearCTA } = context;

  useEffect(() => {
    setCTA(children);

    return () => {
      clearCTA();
    };
  }, [children, setCTA, clearCTA]);

  return null;
}

BottomCTALayout.CTA = CTA;
