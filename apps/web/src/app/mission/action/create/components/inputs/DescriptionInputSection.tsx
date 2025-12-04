import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { PrimitiveAtom, useAtom } from "jotai";
import { useCallback } from "react";

interface DescriptionInputSectionProps {
  descriptionAtom: PrimitiveAtom<string>;
}

export function DescriptionInputSection({ descriptionAtom }: DescriptionInputSectionProps) {
  const [description, setDescription] = useAtom(descriptionAtom);

  const handleBlur = useCallback(() => {
    setDescription(description.trim());
  }, [description, setDescription]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Typo.SubTitle size="large">설명</Typo.SubTitle>
        </div>
        <Typo.Body size="small" className="text-zinc-400">
          {description.length}/100
        </Typo.Body>
      </div>

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        onBlur={handleBlur}
        placeholder="설명을 작성해주세요"
        maxLength={100}
        rows={2}
        className={cn(
          "w-full resize-none rounded-sm border border-zinc-200 bg-white px-4 py-3",
          "focus:ring-primary focus:ring-1 focus:outline-none",
          "placeholder:text-zinc-300",
          description.length >= 100 && "border-red-500",
        )}
      />
    </div>
  );
}
