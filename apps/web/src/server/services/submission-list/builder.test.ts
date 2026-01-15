import type { Action } from "@prisma/client";
import { buildSubmissionTables } from "./builder";
import type { MissionResponseWithUserAndAnswers } from "./types";

const createMockAction = (overrides: Partial<Action> = {}): Action => ({
  id: "action1",
  title: "액션 제목",
  description: null,
  imageUrl: null,
  type: "SHORT_TEXT",
  order: 1,
  maxSelections: null,
  isRequired: true,
  hasOther: false,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  missionId: "mission1",
  imageFileUploadId: null,
  ...overrides,
});

const createMockResponse = (
  overrides: Partial<MissionResponseWithUserAndAnswers> = {},
): MissionResponseWithUserAndAnswers => ({
  id: "response1",
  startedAt: new Date("2025-01-01T10:00:00Z"),
  completedAt: null,
  user: {
    name: "홍길동",
    phone: "01012345678",
  },
  answers: [],
  ...overrides,
});

const createMockAnswer = (
  actionId: string,
  overrides: Partial<MissionResponseWithUserAndAnswers["answers"][number]> = {},
): MissionResponseWithUserAndAnswers["answers"][number] => ({
  actionId,
  textAnswer: null,
  scaleAnswer: null,
  booleanAnswer: null,
  dateAnswers: [],
  options: [],
  fileUploads: [],
  ...overrides,
});

describe("buildSubmissionTables", () => {
  describe("기본 테스트", () => {
    it("빈 응답 목록을 처리한다", () => {
      // Given
      const actions: Action[] = [];
      const responses: MissionResponseWithUserAndAnswers[] = [];

      // When
      const result = buildSubmissionTables({ actions, responses });

      // Then
      expect(result.columns).toEqual([]);
      expect(result.completedRows).toEqual([]);
      expect(result.inProgressRows).toEqual([]);
    });

    it("완료자와 진행중인 응답을 분리한다", () => {
      // Given
      const actions = [createMockAction()];
      const completedResponse = createMockResponse({
        id: "completed1",
        completedAt: new Date("2025-01-01T11:00:00Z"),
      });
      const inProgressResponse = createMockResponse({
        id: "inProgress1",
        completedAt: null,
      });

      // When
      const result = buildSubmissionTables({
        actions,
        responses: [completedResponse, inProgressResponse],
      });

      // Then
      expect(result.completedRows).toHaveLength(1);
      expect(result.completedRows[0]?.id).toBe("completed1");
      expect(result.inProgressRows).toHaveLength(1);
      expect(result.inProgressRows[0]?.id).toBe("inProgress1");
    });

    it("완료자는 completedAt을, 진행중은 startedAt만 가진다", () => {
      // Given
      const actions = [createMockAction()];
      const completedAt = new Date("2025-01-01T11:00:00Z");
      const startedAt = new Date("2025-01-01T10:00:00Z");

      const completedResponse = createMockResponse({
        id: "completed1",
        startedAt,
        completedAt,
      });
      const inProgressResponse = createMockResponse({
        id: "inProgress1",
        startedAt,
        completedAt: null,
      });

      // When
      const result = buildSubmissionTables({
        actions,
        responses: [completedResponse, inProgressResponse],
      });

      // Then
      expect(result.completedRows[0]?.completedAt).toEqual(completedAt);
      expect(result.completedRows[0]?.startedAt).toEqual(startedAt);
      expect(result.inProgressRows[0]?.completedAt).toBeNull();
      expect(result.inProgressRows[0]?.startedAt).toEqual(startedAt);
    });

    it("Action 순서대로 컬럼을 생성한다", () => {
      // Given
      const actions = [
        createMockAction({ id: "action3", title: "세 번째", order: 3 }),
        createMockAction({ id: "action1", title: "첫 번째", order: 1 }),
        createMockAction({ id: "action2", title: "두 번째", order: 2 }),
      ];

      // When
      const result = buildSubmissionTables({ actions, responses: [] });

      // Then
      expect(result.columns).toHaveLength(3);
      expect(result.columns[0]?.title).toBe("첫 번째");
      expect(result.columns[1]?.title).toBe("두 번째");
      expect(result.columns[2]?.title).toBe("세 번째");
    });

    it("사용자 정보(이름, 전화번호)를 포함한다", () => {
      // Given
      const actions = [createMockAction()];
      const response = createMockResponse({
        user: { name: "김철수", phone: "01098765432" },
        completedAt: new Date(),
      });

      // When
      const result = buildSubmissionTables({ actions, responses: [response] });

      // Then
      expect(result.completedRows[0]?.user.name).toBe("김철수");
      expect(result.completedRows[0]?.user.phone).toBe("01098765432");
    });
  });

  describe("엣지 케이스", () => {
    it("전화번호가 null인 경우를 처리한다", () => {
      // Given
      const actions = [createMockAction()];
      const response = createMockResponse({
        user: { name: "이영희", phone: null },
        completedAt: new Date(),
      });

      // When
      const result = buildSubmissionTables({ actions, responses: [response] });

      // Then
      expect(result.completedRows[0]?.user.phone).toBeNull();
    });

    it("응답이 없는 액션은 null로 표시한다", () => {
      // Given
      const actions = [
        createMockAction({ id: "action1", title: "첫 번째", order: 1 }),
        createMockAction({ id: "action2", title: "두 번째", order: 2 }),
      ];
      const response = createMockResponse({
        completedAt: new Date(),
        answers: [createMockAnswer("action1", { textAnswer: "답변1" })],
      });

      // When
      const result = buildSubmissionTables({ actions, responses: [response] });

      // Then
      const row = result.completedRows[0];
      expect(row?.answers[0]?.value).toBe("답변1");
      expect(row?.answers[1]?.value).toBeNull();
    });

    it("MULTIPLE_CHOICE에서 hasOther가 true일 때 옵션과 textAnswer를 함께 표시한다", () => {
      // Given
      const actions = [
        createMockAction({
          id: "action1",
          type: "MULTIPLE_CHOICE",
          hasOther: true,
        }),
      ];
      const response = createMockResponse({
        completedAt: new Date(),
        answers: [
          createMockAnswer("action1", {
            options: [{ title: "옵션1" }, { title: "옵션2" }],
            textAnswer: "기타 답변",
          }),
        ],
      });

      // When
      const result = buildSubmissionTables({ actions, responses: [response] });

      // Then
      const row = result.completedRows[0];
      expect(row?.answers[0]?.value).toBe("옵션1, 옵션2 (기타: 기타 답변)");
    });

    it("MULTIPLE_CHOICE에서 hasOther가 true이지만 textAnswer가 없으면 옵션만 표시한다", () => {
      // Given
      const actions = [
        createMockAction({
          id: "action1",
          type: "MULTIPLE_CHOICE",
          hasOther: true,
        }),
      ];
      const response = createMockResponse({
        completedAt: new Date(),
        answers: [
          createMockAnswer("action1", {
            options: [{ title: "옵션1" }],
            textAnswer: null,
          }),
        ],
      });

      // When
      const result = buildSubmissionTables({ actions, responses: [response] });

      // Then
      const row = result.completedRows[0];
      expect(row?.answers[0]?.value).toBe("옵션1");
    });

    it("파일 업로드가 없는 IMAGE 액션은 null을 반환한다", () => {
      // Given
      const actions = [createMockAction({ id: "action1", type: "IMAGE" })];
      const response = createMockResponse({
        completedAt: new Date(),
        answers: [createMockAnswer("action1", { fileUploads: [] })],
      });

      // When
      const result = buildSubmissionTables({ actions, responses: [response] });

      // Then
      expect(result.completedRows[0]?.answers[0]?.value).toBeNull();
    });
  });
});
