import { Button, Typo, FixedBottomLayout, toast } from "@repo/ui/components";
import { useAtomValue } from "jotai";
import { useSearchParams, useRouter } from "next/navigation";
import { eitherOrDataAtom } from "@/atoms/survey/create/eitherOrInfoAtoms";
import { eitherOrInfoSchema } from "@/schemas/survey/eitherOrInfoSchema";
import { useCreateEitherOrQuestion } from "@/hooks/survey/question";
import type { CreateEitherOrQuestionRequest } from "@/types/dto/survey";

export function EitherOrSubmitButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("surveyId") || undefined;
  const order = Number(searchParams.get("order") || "0");

  const eitherOrData = useAtomValue(eitherOrDataAtom);
  const { mutate, isPending } = useCreateEitherOrQuestion({
    onSuccess: (data) => {
      toast.success("양자택일 질문이 생성되었습니다!");
      router.push(
        `/survey/question/create/done?surveyQuestionId=${data.data.id}&surveyId=${data.data.surveyId}`
      );
    },
    onError: (error) => {
      toast.error(error.message || "질문 생성에 실패했습니다.");
    },
  });

  const handleCreateQuestion = () => {
    const validationResult = eitherOrInfoSchema.safeParse(eitherOrData);
    if (!validationResult.success) {
      toast.error("입력 정보를 확인해주세요.");
      return;
    }

    const request: CreateEitherOrQuestionRequest = {
      surveyId,
      title: eitherOrData.title,
      description: eitherOrData.description,
      imageUrl: eitherOrData.imageUrl,
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
          disabled={isPending || !eitherOrData.title.trim()}
          loading={isPending}
        >
          <Typo.ButtonText>
            {isPending ? "생성 중..." : "질문 생성하기"}
          </Typo.ButtonText>
        </Button>
      </div>
    </FixedBottomLayout.Content>
  );
}
