import { Input } from "@repo/ui/components";
import { useAtom } from "jotai";
import { PrimitiveAtom } from "jotai";

interface SubjectInputProps {
  titleAtom: PrimitiveAtom<string>;
}

export function SubjectInput({ titleAtom }: SubjectInputProps) {
  const [title, setTitle] = useAtom(titleAtom);

  return (
    <Input
      label="주제"
      required
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="주제를 작성해주세요"
      maxLength={30}
    />
  );
}
