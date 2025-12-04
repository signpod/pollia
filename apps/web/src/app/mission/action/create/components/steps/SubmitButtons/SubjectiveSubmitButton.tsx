import { subjectiveDataAtom } from "@/atoms/action/creation/subjectiveAtoms";
import { toast } from "@/components/common/Toast";
import { useCreateSubjectiveAction } from "@/hooks/action";
// TODO: @/schemas_legacy는 deprecated. 새로운 @/schemas/{domain}/ 스키마로 교체 필요
import { subjectiveInfoSchema } from "@/schemas_legacy/survey/question/creation/subjectiveInfoSchema";
import type { CreateSubjectiveActionRequest } from "@/types/dto";
import { Button, FixedBottomLayout, Typo } from "@repo/ui/components";
import { useAtomValue } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";

export function SubjectiveSubmitButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams.get("missionId") || undefined;
  const order = Number(searchParams.get("order") || "0");

  const subjectiveData = useAtomValue(subjectiveDataAtom);
  const { mutate, isPending } = useCreateSubjectiveAction({
    onSuccess: data => {
      toast.success("주관식 질문이 생성되었습니다!");
      router.push(
        `/mission/action/create/done?actionId=${data.data.id}${data.data.missionId ? `&missionId=${data.data.missionId}` : ""}`,
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

    const request: CreateSubjectiveActionRequest = {
      missionId,
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
