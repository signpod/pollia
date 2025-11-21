import { Typo } from "@repo/ui/components";
import { Check } from "lucide-react";

export function Before() {
  return (
    <div className="w-full flex flex-col items-center gap-6 pt-[220px]">
      <div className="flex justify-center items-center bg-violet-100 rounded-[20px] size-[80px]">
        <Check className=" text-primary size-10" strokeWidth={3} />
      </div>
      <div>
        <Typo.MainTitle size="small" className="text-center text-primary">
          가나디 설문조사
        </Typo.MainTitle>
        <Typo.MainTitle size="small" className="text-center">
          응답을 성공적으로 제출했어요
        </Typo.MainTitle>
      </div>
    </div>
  );
}
