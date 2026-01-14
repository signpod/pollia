import type { Action } from "@prisma/client";
import type {
  BuildSubmissionTablesInput,
  ColumnDef,
  MissionResponseWithUserAndAnswers,
  SubmissionAnswer,
  SubmissionRow,
  SubmissionTablesData,
} from "./types";

export function buildSubmissionTables(input: BuildSubmissionTablesInput): SubmissionTablesData {
  const { actions, responses } = input;

  const sortedActions = [...actions].sort((a, b) => a.order - b.order);
  const columns = buildColumns(sortedActions);

  const allRows = responses.map(r => buildRow(r, sortedActions));
  const completedRows = allRows.filter(r => r.isCompleted);
  const inProgressRows = allRows.filter(r => !r.isCompleted);

  return {
    columns,
    allRows,
    completedRows,
    inProgressRows,
  };
}

function buildColumns(sortedActions: Action[]): ColumnDef[] {
  return sortedActions.map(action => ({
    id: action.id,
    title: action.title,
    type: action.type,
  }));
}

function buildAnswers(
  response: MissionResponseWithUserAndAnswers,
  sortedActions: Action[],
): SubmissionAnswer[] {
  return sortedActions.map(action => {
    const answer = response.answers.find(a => a.actionId === action.id);
    return {
      actionId: action.id,
      value: answer ? formatAnswerValue(answer, action) : null,
    };
  });
}

function buildRow(
  response: MissionResponseWithUserAndAnswers,
  sortedActions: Action[],
): SubmissionRow {
  return {
    id: response.id,
    user: {
      name: response.user.name,
      phone: response.user.phone,
    },
    startedAt: response.startedAt,
    completedAt: response.completedAt,
    isCompleted: response.completedAt !== null,
    answers: buildAnswers(response, sortedActions),
  };
}

function formatAnswerValue(
  answer: MissionResponseWithUserAndAnswers["answers"][number],
  action: Action,
): string | null {
  switch (action.type) {
    case "MULTIPLE_CHOICE":
    case "TAG": {
      const options = answer.options.map(opt => opt.title);
      const optionsText = options.length > 0 ? options.join(", ") : null;

      if (action.hasOther && answer.textAnswer) {
        return optionsText
          ? `${optionsText} (기타: ${answer.textAnswer})`
          : `(기타: ${answer.textAnswer})`;
      }

      return optionsText;
    }
    case "SCALE":
    case "RATING":
      return answer.scaleAnswer !== null ? String(answer.scaleAnswer) : null;
    case "SUBJECTIVE":
    case "SHORT_TEXT":
      return answer.textAnswer || null;
    case "IMAGE":
    case "VIDEO":
    case "PDF": {
      const fileUpload = answer.fileUploads[0];
      return fileUpload?.publicUrl || null;
    }
    case "DATE": {
      if (answer.dateAnswers.length > 0 && answer.dateAnswers[0]) {
        return answer.dateAnswers[0].toISOString().split("T")[0] || null;
      }
      return null;
    }
    case "TIME": {
      if (answer.dateAnswers.length > 0 && answer.dateAnswers[0]) {
        return answer.dateAnswers[0].toISOString().split("T")[1]?.slice(0, 5) || null;
      }
      return null;
    }
    default:
      return answer.textAnswer || null;
  }
}
