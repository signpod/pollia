import { ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { Input } from "@repo/ui/components";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { useActionContext } from "../providers/ActionContext";

export function ActionUrl({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

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
    [actionData.id, actionData.isRequired, validateUrl],
  );

  useEffect(() => {
    if (existingAnswer) {
      setUrl("");
      validateAndUpdateAnswer("");
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
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
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
