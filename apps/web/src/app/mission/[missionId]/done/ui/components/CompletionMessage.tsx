"use client";

import { cleanTiptapHTML } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { TiptapViewer } from "@repo/ui/components/common/TiptapViewer";
import { motion } from "framer-motion";

interface CompletionMessageProps {
  title?: string;
  description?: string;
  showTitle: boolean;
  showDescription: boolean;
}

const fadeInAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.3, duration: 0.3, ease: "easeOut" as const },
};

export function CompletionMessage({
  title,
  description,
  showTitle,
  showDescription,
}: CompletionMessageProps) {
  return (
    <div className="flex flex-col items-center gap-2 p-10">
      {showTitle && (
        <motion.div {...fadeInAnimation}>
          <Typo.MainTitle size="small" className="text-center break-keep">
            {title}
          </Typo.MainTitle>
        </motion.div>
      )}
      {showDescription && description && (
        <motion.div {...fadeInAnimation}>
          <TiptapViewer content={cleanTiptapHTML(description)} className="break-keep text-center" />
        </motion.div>
      )}
    </div>
  );
}
