import { multipleChoiceDataAtom } from "@/atoms/survey/question/multipleChoiceInfoAtoms";
import { toast } from "@/components/common/Toast";
import { useCreateMultipleChoiceQuestion } from "@/hooks/survey/question";
import { multipleChoiceInfoSchema } from "@/schemas/survey/question/multipleChoiceInfoSchema";
import type { CreateMultipleChoiceQuestionRequest } from "@/types/dto/survey";
import { Button, FixedBottomLayout, Typo } from "@repo/ui/components";
import { useAtomValue } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";

export function MultipleChoiceSubmitButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("surveyId") || undefined;
  const order = Number(searchParams.get("order") || "0");

  const multipleChoiceData = useAtomValue(multipleChoiceDataAtom);
  const { mutate, isPending } = useCreateMultipleChoiceQuestion({
    onSuccess: data => {
      toast.success("객관식 질문이 생성되었습니다!");
      router.push(
        `/survey/question/create/done?surveyQuestionId=${data.data.id}${data.data.surveyId ? `&surveyId=${data.data.surveyId}` : ""}`,
      );
    },
    onError: error => {
      toast.warning(error.message || "질문 생성에 실패했습니다.");
    },
  });

  const handleCreateQuestion = () => {
    const validationResult = multipleChoiceInfoSchema.safeParse(multipleChoiceData);
    if (!validationResult.success) {
      toast.warning("입력 정보를 확인해주세요.");
      return;
    }

    const request: CreateMultipleChoiceQuestionRequest = {
      surveyId,
      title: multipleChoiceData.title,
      description: multipleChoiceData.description,
      imageUrl: multipleChoiceData.imageUrl,
      maxSelections: multipleChoiceData.maxSelections,
      order,
      options: multipleChoiceData.options.map(option => ({
        title: option.title,
        description: option.description,
        imageUrl: option.imageUrl,
        order: option.order,
        imageFileUploadId: option.fileUploadId,
      })),
    };

    mutate(request);
  };

  const isDisabled =
    isPending || !multipleChoiceData.title.trim() || multipleChoiceData.validOptionsCount < 2;

  return (
    <FixedBottomLayout.Content>
      <div className="p-5">
        <Button
          variant="primary"
          fullWidth={true}
          onClick={handleCreateQuestion}
          disabled={isDisabled}
          loading={isPending}
        >
          <Typo.ButtonText>{isPending ? "생성 중..." : "질문 생성하기"}</Typo.ButtonText>
        </Button>
      </div>
    </FixedBottomLayout.Content>
  );
}
