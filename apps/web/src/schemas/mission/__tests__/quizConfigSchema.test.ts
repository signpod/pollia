import { parseQuizConfig } from "../quizConfigSchema";

describe("parseQuizConfig", () => {
  const DEFAULT_CONFIG = {
    gradingMode: "instant" as const,
    showExplanation: true,
    showCorrectOnWrong: true,
    shuffleQuestions: false,
    shuffleChoices: false,
  };

  // Given: raw가 null/undefined/비객체일 때
  // Then: 기본값을 반환한다
  it.each([null, undefined, 0, "", false, "string"])("raw가 %p이면 기본값을 반환한다", raw => {
    expect(parseQuizConfig(raw)).toEqual(DEFAULT_CONFIG);
  });

  // Given: 완전한 설정 데이터
  // Then: 그대로 파싱한다
  it("완전한 설정 데이터를 정상 파싱한다", () => {
    const raw = {
      gradingMode: "final",
      showExplanation: false,
      showCorrectOnWrong: false,
      shuffleQuestions: true,
      shuffleChoices: true,
    };

    expect(parseQuizConfig(raw)).toEqual({
      gradingMode: "final",
      showExplanation: false,
      showCorrectOnWrong: false,
      shuffleQuestions: true,
      shuffleChoices: true,
    });
  });

  // Given: 부분 데이터만 있을 때
  // Then: 없는 필드는 기본값으로 채운다
  it("부분 데이터는 나머지를 기본값으로 채운다", () => {
    const raw = { gradingMode: "final" };

    expect(parseQuizConfig(raw)).toEqual({
      gradingMode: "final",
      showExplanation: true,
      showCorrectOnWrong: true,
      shuffleQuestions: false,
      shuffleChoices: false,
    });
  });

  // Given: 빈 객체
  // Then: 모든 필드를 기본값으로 채운다
  it("빈 객체는 기본값을 반환한다", () => {
    expect(parseQuizConfig({})).toEqual(DEFAULT_CONFIG);
  });

  // Given: gradingMode에 잘못된 값
  // Then: instant로 fallback한다
  it("gradingMode에 잘못된 값이면 instant로 fallback한다", () => {
    const raw = { gradingMode: "invalid" };

    expect(parseQuizConfig(raw).gradingMode).toBe("instant");
  });

  // Given: boolean 필드에 boolean이 아닌 값
  // Then: 각 필드의 기본값으로 fallback한다
  it("boolean 필드에 비-boolean 값이면 기본값으로 fallback한다", () => {
    const raw = {
      showExplanation: "yes",
      showCorrectOnWrong: 1,
      shuffleQuestions: "true",
      shuffleChoices: null,
    };

    expect(parseQuizConfig(raw)).toEqual({
      gradingMode: "instant",
      showExplanation: true,
      showCorrectOnWrong: true,
      shuffleQuestions: false,
      shuffleChoices: false,
    });
  });

  // Given: 추가 필드가 포함된 객체
  // Then: 알려진 필드만 추출한다
  it("알려진 필드만 추출하고 나머지는 무시한다", () => {
    const raw = {
      gradingMode: "final",
      unknownField: "should be ignored",
      anotherField: 42,
    };

    const result = parseQuizConfig(raw);
    expect(result).toEqual({
      gradingMode: "final",
      showExplanation: true,
      showCorrectOnWrong: true,
      shuffleQuestions: false,
      shuffleChoices: false,
    });
    expect(result).not.toHaveProperty("unknownField");
  });
});
