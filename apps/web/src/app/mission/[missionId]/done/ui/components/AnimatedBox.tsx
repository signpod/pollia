import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import React from "react";

interface AnimatedBoxProps {
  showContent: boolean;
  checkIconRef: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}

export const AnimatedBox = React.forwardRef<HTMLDivElement, AnimatedBoxProps>(
  ({ showContent, checkIconRef, children }, ref) => (
    <motion.div
      layout
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      ref={ref}
      className="relative flex flex-col justify-center items-center bg-violet-100 rounded-[20px] p-4 overflow-visible"
      style={{
        width: showContent ? "100%" : "80px",
        minHeight: showContent ? "auto" : "80px",
      }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <DotLottieReact
          src="/lotties/Pop.lottie"
          loop={false}
          autoplay
          speed={2}
          style={{ width: "600px", height: "600px", zIndex: 0 }}
        />
      </div>

      <div ref={checkIconRef} className="absolute inset-0 flex items-center justify-center z-20">
        <Check className="text-primary size-10" strokeWidth={3} />
      </div>

      {children}
    </motion.div>
  ),
);

AnimatedBox.displayName = "AnimatedBox";
