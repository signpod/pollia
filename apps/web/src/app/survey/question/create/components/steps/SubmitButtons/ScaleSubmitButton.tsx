import { scaleDataAtom } from "@/atoms/survey/quetion/scaleInfoAtoms";
import { useCreateScaleQuestion } from "@/hooks/survey/question";
import { scaleInfoSchema } from "@/schemas/survey/question/scaleInfoSchema";
import type { CreateScaleQuestionRequest } from "@/types/dto/survey";
import { Button, FixedBottomLayout, Typo, toast } from "@repo/ui/components";
import { useAtomValue } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";

export function ScaleSubmitButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("surveyId") || undefined;
  const order = Number(searchParams.get("order") || "0");

  const scaleData = useAtomValue(scaleDataAtom);
  const { mutate, isPending } = useCreateScaleQuestion({
    onSuccess: data => {
      toast.success("척도형 질문이 생성되었습니다!");
      router.push(
        `/survey/question/create/done?surveyQuestionId=${data.data.id}${data.data.surveyId ? `&surveyId=${data.data.surveyId}` : ""}`,
      );
    },
    onError: error => {
      toast.error(error.message || "질문 생성에 실패했습니다.");
    },
  });

  const handleCreateQuestion = () => {
    const validationResult = scaleInfoSchema.safeParse(scaleData);
    if (!validationResult.success) {
      toast.error("입력 정보를 확인해주세요.");
      return;
    }

    const request: CreateScaleQuestionRequest = {
      surveyId,
      title: scaleData.title,
      description: scaleData.description,
      imageUrl: scaleData.imageUrl,
      order,
    };

    mutate(request);
  };

  return (
    <FixedBottomLayout.Content>
      <div className="p-5">
        <Button
          variant="primary"
          fullWidth={true}
          onClick={handleCreateQuestion}
          disabled={isPending || !scaleData.title.trim()}
          loading={isPending}
        >
          <Typo.ButtonText>{isPending ? "생성 중..." : "질문 생성하기"}</Typo.ButtonText>
        </Button>
      </div>
    </FixedBottomLayout.Content>
  );
}
