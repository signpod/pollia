import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { MissionCategory, MissionType, PaymentType } from "@prisma/client";
import type { CreateMissionFormData } from "../schema";
import { mapCreateMissionRequest, mapCreateRewardRequest, mapIntroUpdateRequest } from "./mappers";

function createBaseFormData(): CreateMissionFormData {
  return {
    category: MissionCategory.RESEARCH,
    creationMode: "custom",
    title: `신규 ${UBIQUITOUS_CONSTANTS.MISSION}`,
    description: `${UBIQUITOUS_CONSTANTS.MISSION} 설명`,
    isActive: true,
    isExposed: false,
    allowGuestResponse: true,
    allowMultipleResponses: true,
    useAiCompletion: false,
    hasReward: false,
    reward: undefined,
  };
}

describe("create mappers", () => {
  describe("mapCreateMissionRequest", () => {
    it("type과 isActive를 create 페이지 정책으로 고정한다", () => {
      const result = mapCreateMissionRequest(createBaseFormData());

      expect(result.type).toBe(MissionType.GENERAL);
      expect(result.isActive).toBe(false);
    });

    it("핵심 미션 필드를 정상 매핑한다", () => {
      const formData = createBaseFormData();
      const result = mapCreateMissionRequest(formData);

      expect(result).toEqual(
        expect.objectContaining({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          actionIds: [],
          eventId: null,
        }),
      );
    });
  });

  describe("mapCreateRewardRequest", () => {
    it("hasReward가 true일 때 리워드 요청 payload를 만든다", () => {
      const scheduledDate = new Date("2026-03-01T12:00:00.000Z");
      const formData: CreateMissionFormData = {
        ...createBaseFormData(),
        hasReward: true,
        reward: {
          name: "스타벅스 아메리카노",
          description: "기프티콘 지급",
          paymentType: PaymentType.SCHEDULED,
          scheduledDate,
        },
      };

      const result = mapCreateRewardRequest("mission-1", formData);

      expect(result).toEqual({
        missionId: "mission-1",
        name: "스타벅스 아메리카노",
        description: "기프티콘 지급",
        paymentType: PaymentType.SCHEDULED,
        scheduledDate,
      });
    });

    it("hasReward가 false면 에러를 던진다", () => {
      expect(() => mapCreateRewardRequest("mission-1", createBaseFormData())).toThrow(
        "리워드가 비활성화된 상태입니다.",
      );
    });
  });

  describe("mapIntroUpdateRequest", () => {
    it("intro 토글 값을 미션 업데이트 payload로 매핑한다", () => {
      const formData: CreateMissionFormData = {
        ...createBaseFormData(),
        allowGuestResponse: false,
        allowMultipleResponses: true,
        useAiCompletion: true,
      };

      const result = mapIntroUpdateRequest(formData);

      expect(result).toEqual({
        allowGuestResponse: false,
        allowMultipleResponses: true,
        useAiCompletion: true,
      });
    });
  });
});
