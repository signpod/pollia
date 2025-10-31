import { useCallback, useState } from "react";
import { PrimitiveAtom, useAtom } from "jotai";
import { z } from "zod";
import { Input } from "@repo/ui/components";

interface SubjectInputSectionProps {
  titleAtom: PrimitiveAtom<string>;
  schema: z.ZodObject<z.ZodRawShape>;
}

export function SubjectInputSection({ titleAtom, schema }: SubjectInputSectionProps) {
  const [title, setTitle] = useAtom(titleAtom);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleBlur = useCallback(() => {
    const trimmed = title.trim();
    setTitle(trimmed);
    setTouched(true);

    try {
      const result = schema.safeParse({ title: trimmed });

      if (!result.success) {
        const titleError = result.error.issues.find(issue => issue.path[0] === "title");
        setError(titleError?.message);
      } else {
        setError(undefined);
      }
    } catch {
      setError(undefined);
    }
  }, [title, setTitle, schema]);

  return (
    <Input
      label="주제"
      required
      value={title}
      onChange={e => setTitle(e.target.value)}
      onFocus={() => setTouched(false)}
      onBlur={handleBlur}
      placeholder="주제를 작성해주세요"
      maxLength={30}
      errorMessage={touched ? error : undefined}
    />
  );
}
