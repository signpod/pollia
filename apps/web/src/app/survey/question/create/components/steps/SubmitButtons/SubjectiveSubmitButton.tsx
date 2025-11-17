import { subjectiveDataAtom } from "@/atoms/survey/question/creation/subjectiveAtoms";
import { toast } from "@/components/common/Toast";
import { useCreateSubjectiveQuestion } from "@/hooks/survey/question";
import { subjectiveInfoSchema } from "@/schemas/survey/question/creation/subjectiveInfoSchema";
import type { CreateSubjectiveQuestionRequest } from "@/types/dto";
import { Button, FixedBottomLayout, Typo } from "@repo/ui/components";
import { useAtomValue } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";

export function SubjectiveSubmitButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("surveyId") || undefined;
  const order = Number(searchParams.get("order") || "0");

  const subjectiveData = useAtomValue(subjectiveDataAtom);
  const { mutate, isPending } = useCreateSubjectiveQuestion({
    onSuccess: data => {
      toast.success("주관식 질문이 생성되었습니다!");
      router.push(
        `/survey/question/create/done?surveyQuestionId=${data.data.id}${data.data.surveyId ? `&surveyId=${data.data.surveyId}` : ""}`,
      );
    },
    onError: error => {
      toast.warning(error.message || "질문 생성에 실패했습니다.");
    },
  });

  const handleCreateQuestion = () => {
    const validationResult = subjectiveInfoSchema.safeParse(subjectiveData);
    if (!validationResult.success) {
      toast.warning("입력 정보를 확인해주세요.");
      return;
    }

    const request: CreateSubjectiveQuestionRequest = {
      surveyId,
      title: subjectiveData.title,
      description: subjectiveData.description,
      imageUrl: subjectiveData.imageUrl,
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
          disabled={isPending || !subjectiveData.title.trim()}
          loading={isPending}
        >
          <Typo.ButtonText>{isPending ? "생성 중..." : "질문 생성하기"}</Typo.ButtonText>
        </Button>
      </div>
    </FixedBottomLayout.Content>
  );
}
