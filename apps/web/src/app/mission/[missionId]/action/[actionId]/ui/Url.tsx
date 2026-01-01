import { ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { Input } from "@repo/ui/components";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";

export function ActionUrl({
  actionData,
  currentOrder,
  totalActionCount,
  isFirstAction,
  onPrevious,
  onNext,
  nextButtonText,
  isNextDisabled: isNextDisabledProp,
  updateCanGoNext,
  onAnswerChange,
  missionResponse,
  isLoading,
}: ActionStepContentProps) {
  const [url, setUrl] = useState<string>("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const existingAnswer = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return null;
    }
    return missionResponse.data.answers.find(answer => answer.actionId === actionData.id) ?? null;
  }, [missionResponse, actionData.id]);

  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  const validateUrl = useCallback((urlString: string): boolean => {
    if (!urlString.trim()) {
      return false;
    }

    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, []);

  const validateAndUpdateAnswer = useCallback(
    (urlString: string) => {
      const trimmedUrl = urlString.trim();

      if (!trimmedUrl) {
        setUrlError(null);
        updateCanGoNextRef.current?.(false);
        return;
      }

      if (!validateUrl(trimmedUrl)) {
        setUrlError("http:// 혹은 https:// 형태로 입력해주세요.");
        updateCanGoNextRef.current?.(false);
        return;
      }

      setUrlError(null);

      // TODO: 백엔드 API 스펙 확인 후 실제 필드명으로 수정 필요
      // 현재는 textAnswer를 사용하지만, urlAnswer 같은 별도 필드가 필요할 수 있음
      // URL 타입은 현재 지원하지 않으므로, 이 컴포넌트는 사용되지 않습니다. - [2026-01-02-러기]
      const answer: ActionAnswerItem = {
        actionId: actionData.id,
        type: ActionType.SHORT_TEXT,
        isRequired: actionData.isRequired,
        textAnswer: trimmedUrl,
      };

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      updateCanGoNextRef.current?.(validationResult.success);

      if (validationResult.success) {
        onAnswerChangeRef.current?.(answer);
      } else {
        setUrlError(validationResult.error.issues[0]?.message || "URL 입력에 오류가 있습니다.");
        updateCanGoNextRef.current?.(false);
      }
    },
    [actionData.id, validateUrl],
  );

  useEffect(() => {
    if (existingAnswer) {
      // TODO: 백엔드 응답 구조 확인 후 실제 필드명으로 수정 필요
      // const existingUrl = existingAnswer.urlAnswer || existingAnswer.textAnswer;
      // if (existingUrl) {
      //   setUrl(existingUrl);
      //   validateAndUpdateAnswer(existingUrl);
      // } else {
      setUrl("");
      validateAndUpdateAnswer("");
      // }
    }
  }, [existingAnswer, validateAndUpdateAnswer]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
  }, []);

  const handleUrlBlur = useCallback(() => {
    validateAndUpdateAnswer(url);
  }, [url, validateAndUpdateAnswer]);

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalActionCount={totalActionCount}
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isFirstAction={isFirstAction}
      isNextDisabled={isNextDisabledProp}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      isLoading={isLoading}
    >
      <Input
        type="url"
        placeholder="https://"
        value={url}
        onChange={handleUrlChange}
        onBlur={handleUrlBlur}
        errorMessage={urlError || undefined}
      />
    </SurveyQuestionTemplate>
  );
}
