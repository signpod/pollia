import { formatDateToHHMM, formatDateToYYYYMMDD } from "@/lib/date";
import type { ActionAnswer, ActionAnswerItem } from "@/types/dto";
import { ActionType } from "@prisma/client";

export function isAnswerSameAsSubmitted(
  answer: ActionAnswerItem,
  submittedAnswers: ActionAnswer[],
): boolean {
  const answersForAction = submittedAnswers.filter(
    submitted => submitted.actionId === answer.actionId,
  );

  if (answersForAction.length === 0) {
    return false;
  }

  if (
    answer.type === ActionType.MULTIPLE_CHOICE ||
    answer.type === ActionType.TAG ||
    answer.type === ActionType.BRANCH
  ) {
    const submittedOptionIds = answersForAction.flatMap(a => a.options.map(opt => opt.id)).sort();
    const currentOptionIds = answer.selectedOptionIds ? [...answer.selectedOptionIds].sort() : [];

    const submittedTextAnswer = answersForAction.find(a => a.textAnswer)?.textAnswer ?? "";
    const currentTextAnswer = "textAnswer" in answer ? (answer.textAnswer ?? "") : "";

    const optionsMatch =
      submittedOptionIds.length === currentOptionIds.length &&
      submittedOptionIds.every((id, index) => id === currentOptionIds[index]);

    const textAnswerMatch = submittedTextAnswer === currentTextAnswer;

    return optionsMatch && textAnswerMatch;
  }

  if (answer.type === ActionType.SCALE || answer.type === ActionType.RATING) {
    const submittedScaleValue = answersForAction[0]?.scaleAnswer;
    return submittedScaleValue !== null && submittedScaleValue === answer.scaleValue;
  }

  if (answer.type === ActionType.SUBJECTIVE || answer.type === ActionType.SHORT_TEXT) {
    const submittedTextAnswer = answersForAction[0]?.textAnswer;
    return submittedTextAnswer !== null && submittedTextAnswer === answer.textAnswer;
  }

  if (
    answer.type === ActionType.IMAGE ||
    answer.type === ActionType.VIDEO ||
    answer.type === ActionType.PDF
  ) {
    const submittedAnswer = answersForAction[0];
    if (!submittedAnswer) {
      return false;
    }

    const submittedFileUploads = (
      submittedAnswer as typeof submittedAnswer & {
        fileUploads?: Array<{ id: string }>;
      }
    ).fileUploads;

    const submittedFileUploadIds = submittedFileUploads?.map(f => f.id).sort() ?? [];
    const currentFileUploadIds = (answer.fileUploadIds ?? []).sort();

    if (submittedFileUploadIds.length === 0 && currentFileUploadIds.length === 0) {
      return false;
    }

    return (
      submittedFileUploadIds.length === currentFileUploadIds.length &&
      submittedFileUploadIds.length > 0 &&
      submittedFileUploadIds.every((id, index) => id === currentFileUploadIds[index])
    );
  }

  if (answer.type === ActionType.DATE) {
    const submittedDates = answersForAction
      .flatMap(a => {
        if (!a.dateAnswers) return [];
        return a.dateAnswers.map(d => formatDateToYYYYMMDD(d));
      })
      .sort();
    const currentDates = (answer.dateAnswers || []).map(d => formatDateToYYYYMMDD(d)).sort();
    return (
      submittedDates.length === currentDates.length &&
      submittedDates.every((date, index) => date === currentDates[index])
    );
  }

  if (answer.type === ActionType.TIME) {
    const submittedTimes = answersForAction
      .flatMap(a => {
        if (!a.dateAnswers) return [];
        return a.dateAnswers.map(d => formatDateToHHMM(d));
      })
      .sort();
    const currentTimes = (answer.dateAnswers || []).map(d => formatDateToHHMM(d)).sort();
    return (
      submittedTimes.length === currentTimes.length &&
      submittedTimes.every((time, index) => time === currentTimes[index])
    );
  }

  return false;
}
