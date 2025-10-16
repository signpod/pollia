import { Typo } from "@repo/ui/components";
import { useAtom, PrimitiveAtom } from "jotai";
import { useCallback } from "react";

interface DescriptionInputProps {
  descriptionAtom: PrimitiveAtom<string>;
}

export function DescriptionInput({ descriptionAtom }: DescriptionInputProps) {
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
        onChange={(e) => setDescription(e.target.value)}
        onBlur={handleBlur}
        placeholder="설명을 작성해주세요"
        maxLength={100}
        rows={2}
        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-sm resize-none focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder:text-zinc-300"
      />
    </div>
  );
}
