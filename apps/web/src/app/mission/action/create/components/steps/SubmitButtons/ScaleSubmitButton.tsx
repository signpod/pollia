import { scaleDataAtom } from "@/atoms/action/creation/scaleAtoms";
import { toast } from "@/components/common/Toast";
import { useCreateScaleAction } from "@/hooks/action";
// TODO: @/schemas_legacy는 deprecated. 새로운 @/schemas/{domain}/ 스키마로 교체 필요
import { scaleInfoSchema } from "@/schemas_legacy/survey/question/creation/scaleInfoSchema";
import type { CreateScaleActionRequest } from "@/types/dto";
import { Button, FixedBottomLayout, Typo } from "@repo/ui/components";
import { useAtomValue } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";

export function ScaleSubmitButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams.get("missionId") || undefined;
  const order = Number(searchParams.get("order") || "0");

  const scaleData = useAtomValue(scaleDataAtom);
  const { mutate, isPending } = useCreateScaleAction({
    onSuccess: data => {
      toast.success("척도형 질문이 생성되었습니다!");
      router.push(
        `/mission/action/create/done?actionId=${data.data.id}${data.data.missionId ? `&missionId=${data.data.missionId}` : ""}`,
      );
    },
    onError: error => {
      toast.warning(error.message || "질문 생성에 실패했습니다.");
    },
  });

  const handleCreateQuestion = () => {
    const validationResult = scaleInfoSchema.safeParse(scaleData);
    if (!validationResult.success) {
      toast.warning("입력 정보를 확인해주세요.");
      return;
    }

    const request: CreateScaleActionRequest = {
      missionId,
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
