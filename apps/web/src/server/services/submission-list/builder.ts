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

  const columns = buildColumns(actions);

  const completedResponses = responses.filter(
    (r): r is MissionResponseWithUserAndAnswers & { completedAt: Date } => r.completedAt !== null,
  );
  const inProgressResponses = responses.filter(r => r.completedAt === null);

  const completedRows = completedResponses.map(r => buildCompletedRow(r, actions));
  const inProgressRows = inProgressResponses.map(r => buildInProgressRow(r, actions));

  return {
    columns,
    completedRows,
    inProgressRows,
  };
}

function buildColumns(actions: Action[]): ColumnDef[] {
  return actions
    .sort((a, b) => a.order - b.order)
    .map(action => ({
      id: action.id,
      title: action.title,
      type: action.type,
    }));
}

function buildAnswers(
  response: MissionResponseWithUserAndAnswers,
  actions: Action[],
): SubmissionAnswer[] {
  return actions
    .sort((a, b) => a.order - b.order)
    .map(action => {
      const answer = response.answers.find(a => a.actionId === action.id);
      return {
        actionId: action.id,
        value: answer ? formatAnswerValue(answer, action) : null,
      };
    });
}

function buildCompletedRow(
  response: MissionResponseWithUserAndAnswers & { completedAt: Date },
  actions: Action[],
): SubmissionRow {
  return {
    id: response.id,
    user: {
      name: response.user.name,
      phone: response.user.phone,
    },
    time: response.completedAt,
    answers: buildAnswers(response, actions),
  };
}

function buildInProgressRow(
  response: MissionResponseWithUserAndAnswers,
  actions: Action[],
): SubmissionRow {
  return {
    id: response.id,
    user: {
      name: response.user.name,
      phone: response.user.phone,
    },
    time: response.startedAt,
    answers: buildAnswers(response, actions),
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
