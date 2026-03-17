import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import { createMockMission, expectServiceErrorWithCause } from "../testUtils";
import { MissionAiReportService } from "./index";

jest.mock("@/server/repositories/mission/missionRepository", () => ({
  missionRepository: {
    findById: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("@/server/repositories/mission-response/missionResponseRepository", () => ({
  missionResponseRepository: {
    findByMissionId: jest.fn(),
  },
}));

jest.mock("@/server/repositories/action/actionRepository", () => ({
  actionRepository: {
    findDetailsByMissionId: jest.fn(),
  },
}));

jest.mock("@/server/repositories/tracking-action-entry/trackingActionEntryRepository", () => ({
  trackingActionEntryRepository: {
    findByMissionId: jest.fn(),
  },
}));

jest.mock(
  "@/server/repositories/tracking-action-response/trackingActionResponseRepository",
  () => ({
    trackingActionResponseRepository: {
      findByMissionId: jest.fn(),
    },
  }),
);

jest.mock("@/server/repositories/mission-completion-stat/missionCompletionStatRepository", () => ({
  missionCompletionStatRepository: {
    findByMissionId: jest.fn(),
  },
}));

jest.mock("@/server/services/ai/anthropicClient", () => ({
  AnthropicAiProvider: jest.fn().mockImplementation(() => ({
    generateText: jest.fn(),
  })),
}));

const mockMissionRepo = missionRepository as jest.Mocked<typeof missionRepository>;
const mockResponseRepo = missionResponseRepository as jest.Mocked<typeof missionResponseRepository>;

describe("MissionAiReportService - generate 소유권 체크", () => {
  let service: MissionAiReportService;

  beforeEach(() => {
    service = new MissionAiReportService();
    jest.clearAllMocks();
  });

  it("소유자가 아니면 403 에러를 던진다", async () => {
    // Given
    const mockMission = createMockMission({ id: "mission-1", creatorId: "owner" });
    mockMissionRepo.findById.mockResolvedValue(mockMission);

    // When & Then
    await expectServiceErrorWithCause(
      service.generate("mission-1", "non-owner"),
      "AI 리포트 생성 권한이 없습니다.",
      403,
    );
  });

  it("isAdmin이면 소유자가 아니어도 소유권 체크를 통과한다", async () => {
    // Given
    const mockMission = createMockMission({ id: "mission-1", creatorId: "owner" });
    mockMissionRepo.findById.mockResolvedValue(mockMission);
    mockResponseRepo.findByMissionId.mockResolvedValue([]);

    // When & Then
    await expect(service.generate("mission-1", "non-owner", true)).rejects.toThrow(
      "분석할 응답 데이터가 없습니다.",
    );
  });
});
