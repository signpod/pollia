import { Typo } from "@repo/ui/components";
import { Construction } from "lucide-react";

interface QuizSkeletonSectionProps {
  message: string;
}

export function QuizSkeletonSection({ message }: QuizSkeletonSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-5 py-12">
      <Construction className="size-8 text-zinc-300" />
      <Typo.Body size="medium" className="text-zinc-400">
        {message}
      </Typo.Body>
    </div>
  );
}
