import { multipleChoiceDataAtom } from "@/atoms/action/creation/multipleChoice";
import { toast } from "@/components/common/Toast";
import { useCreateMultipleChoiceAction } from "@/hooks/action";
// TODO: @/schemas_legacy는 deprecated. 새로운 @/schemas/{domain}/ 스키마로 교체 필요
import { multipleChoiceInfoSchema } from "@/schemas_legacy/survey/question/creation/multipleChoiceInfoSchema";
import type { CreateMultipleChoiceActionRequest } from "@/types/dto";
import { Button, FixedBottomLayout, Typo } from "@repo/ui/components";
import { useAtomValue } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";

export function MultipleChoiceSubmitButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams.get("missionId") || undefined;
  const order = Number(searchParams.get("order") || "0");

  const multipleChoiceData = useAtomValue(multipleChoiceDataAtom);
  const { mutate, isPending } = useCreateMultipleChoiceAction({
    onSuccess: data => {
      toast.success("객관식 질문이 생성되었습니다!");
      router.push(
        `/mission/action/create/done?actionId=${data.data.id}${data.data.missionId ? `&missionId=${data.data.missionId}` : ""}`,
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

    const request: CreateMultipleChoiceActionRequest = {
      missionId,
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
