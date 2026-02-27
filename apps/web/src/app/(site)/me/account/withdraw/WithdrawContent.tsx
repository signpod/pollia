"use client";

import { useGoBack } from "@/hooks/common/useGoBack";
import { useWithdrawUser } from "@/hooks/user/useWithdrawUser";
import { withdrawalFormSchema } from "@/schemas/user/userSchema";
import {
  ButtonV2,
  FixedBottomLayout,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Typo,
  useModal,
} from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { useState } from "react";

const WITHDRAWAL_REASONS = [
  { value: "no-project", label: "원하는 프로젝트가 없음" },
  { value: "low-usage", label: "사용 빈도 낮음" },
  { value: "inconvenient", label: "기능이 불편함" },
  { value: "other", label: "기타" },
] as const;

interface WithdrawContentProps {
  userName: string;
}

export function WithdrawContent({ userName }: WithdrawContentProps) {
  const router = useRouter();
  const goBack = useGoBack();
  const { withdrawAsync } = useWithdrawUser();
  const { showModal } = useModal();

  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const isOther = reason === "other";
  const canProceed = withdrawalFormSchema.safeParse({ reason, customReason }).success;

  const handleProceed = () => {
    if (!canProceed) return;

    const selectedLabel = WITHDRAWAL_REASONS.find(r => r.value === reason)?.label;
    const finalReason = isOther ? customReason.trim() || "기타" : (selectedLabel ?? reason);

    showModal({
      title: "정말 탈퇴를 진행할까요?",
      description: "계정 정보와 활동 기록은 복구할 수 없어요",
      showCancelButton: true,
      cancelText: "취소하기",
      confirmText: "탈퇴하기",
      onConfirm: async () => {
        await withdrawAsync({ reason: finalReason });
        setTimeout(() => {
          showModal({
            title: "탈퇴가 완료되었습니다",
            description: "그동안 서비스를 이용해 주셔서 감사드립니다",
            confirmText: "확인",
            onConfirm: () => router.push("/"),
          });
        }, 0);
      },
    });
  };

  return (
    <FixedBottomLayout>
      <div className="flex flex-1 flex-col px-5">
        <div className="flex flex-col gap-2 py-6">
          <Typo.MainTitle size="medium">정말 폴리아를 떠나실건가요?</Typo.MainTitle>
          <Typo.Body size="large" className="text-sub">
            회원 탈퇴를 진행하기 전에 아래 내용을 꼭 확인해 주세요.
          </Typo.Body>
        </div>

        <div className="flex flex-col rounded-lg bg-zinc-50 p-5 gap-8">
          <div className="flex flex-col gap-2">
            <Typo.SubTitle>탈퇴 시 유의 사항</Typo.SubTitle>
            <ul className="list-disc ms-[21px] text-info">
              <li>
                <Typo.Body size="medium" className="text-info">
                  회원 탈퇴를 진행하면 로그인이 필요한 모든 서비스 이용이 불가능합니다.
                </Typo.Body>
              </li>
              <li>
                <Typo.Body size="medium" className="text-info">
                  계정 정보와 활동 기록은 복구할 수 없습니다.
                </Typo.Body>
              </li>
              <li>
                <Typo.Body size="medium" className="text-info">
                  탈퇴 시 보유 중인 리워드 내역은 모두 소멸됩니다.
                </Typo.Body>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Typo.SubTitle>이런 경우에는 탈퇴를 잠시 보류해 주세요</Typo.SubTitle>
            <ul className="list-disc ms-[21px] text-info">
              <li>
                <Typo.Body size="medium" className="text-info">
                  아직 참여 중인 프로젝트가 있는 경우
                </Typo.Body>
              </li>
              <li>
                <Typo.Body size="medium" className="text-info">
                  확인하지 않은 결과나 리워드가 있는 경우
                </Typo.Body>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-8">
          <Typo.MainTitle size="small">{userName}님이 떠나시려는 이유가 궁금해요</Typo.MainTitle>

          <div className="flex flex-col gap-3">
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {WITHDRAWAL_REASONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    <Typo.ButtonText size="medium">{label}</Typo.ButtonText>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isOther && (
              <Input
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="계정을 삭제하려는 이유를 알려주세요"
                maxLength={500}
              />
            )}
          </div>

          <Typo.Body size="medium" className="text-sub">
            작성해주신 소중한 의견을 반영하여
            <br />더 나은 경험을 제공할 수 있도록 노력할게요
          </Typo.Body>
        </div>
      </div>

      <FixedBottomLayout.Content className="px-5 py-4">
        <div className="flex gap-3">
          <ButtonV2 variant="secondary" size="large" className="flex-1" onClick={goBack}>
            <div className="flex items-center justify-center w-full">
              <Typo.ButtonText size="medium">나중에 진행하기</Typo.ButtonText>
            </div>
          </ButtonV2>
          <ButtonV2
            variant="primary"
            size="large"
            className="flex-1"
            disabled={!canProceed}
            onClick={handleProceed}
          >
            <div className="flex items-center justify-center w-full">
              <Typo.ButtonText size="medium">계속 진행하기</Typo.ButtonText>
            </div>
          </ButtonV2>
        </div>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}
