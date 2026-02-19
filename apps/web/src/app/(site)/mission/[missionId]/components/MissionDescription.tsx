import { TiptapViewer } from "@repo/ui/components/common/TiptapViewer";
import { cn } from "@repo/ui/lib";

interface MissionDescriptionProps {
  content: string;
  className?: string;
}

export function MissionDescription({ content, className }: MissionDescriptionProps) {
  return (
    <TiptapViewer
      content={content}
      className={cn(
        "prose prose-sm break-keep",
        "max-w-none focus:outline-none",
        "text-sub",
        className,
      )}
    />
  );
}
