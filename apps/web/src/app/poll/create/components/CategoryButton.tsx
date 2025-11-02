import { CATEGORY_LABELS } from "@/constants/poll";
import { PollCategory } from "@prisma/client";
import { Button, Typo, useStep } from "@repo/ui/components";
import { PrimitiveAtom, useAtomValue } from "jotai";
import { ChevronRight } from "lucide-react";

interface CategoryButtonProps {
  categoryAtom: PrimitiveAtom<PollCategory | undefined>;
}

export function CategoryButton({ categoryAtom }: CategoryButtonProps) {
  const { goNext } = useStep();
  const selectedCategory = useAtomValue(categoryAtom);

  return (
    <Button
      variant="secondary"
      onClick={goNext}
      fullWidth
      textAlign="left"
      rightIcon={<ChevronRight className="h-6 w-6" />}
    >
      <div className="flex items-center gap-1">
        <Typo.ButtonText size="large">
          {selectedCategory ? CATEGORY_LABELS[selectedCategory] : "카테고리"}
        </Typo.ButtonText>
        {!selectedCategory && <span className="text-red-500">*</span>}
      </div>
    </Button>
  );
}
