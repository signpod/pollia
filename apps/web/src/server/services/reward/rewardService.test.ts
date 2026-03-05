import type { RewardRepository } from "@/server/repositories/reward/rewardRepository";
import type { PaymentType } from "@prisma/client";
import { RewardService } from "./rewardService";

const TEST_USER_ID = "user1";

// Mock 데이터 생성 헬퍼 함수
const createMockReward = (
  overrides: Partial<{
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    imageFileUploadId: string | null;
    paymentType: PaymentType;
    scheduledDate: Date | null;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    missions: { id: string }[];
  }> = {},
) => ({
  id: "reward1",
  name: "스타벅스 아메리카노",
  description: "Tall 사이즈",
  imageUrl: null,
  imageFileUploadId: null,
  paymentType: "IMMEDIATE" as PaymentType,
  scheduledDate: null,
  paidAt: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  missions: [] as { id: string }[],
  ...overrides,
});

describe("RewardService", () => {
  let service: RewardService;
  let mockRepo: jest.Mocked<RewardRepository>;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<RewardRepository>;

    service = new RewardService(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getReward", () => {
    it("Reward를 성공적으로 조회한다", async () => {
      // Given
      const mockReward = createMockReward({
        imageUrl: "https://example.com/image.jpg",
      });
      mockRepo.findById.mockResolvedValue(mockReward);

      // When
      const result = await service.getReward("reward1");

      // Then
      expect(result).toEqual(mockReward);
      expect(mockRepo.findById).toHaveBeenCalledWith("reward1");
      expect(mockRepo.findById).toHaveBeenCalledTimes(1);
    });

    it("Reward가 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getReward("invalid-id")).rejects.toThrow("Reward를 찾을 수 없습니다.");

      try {
        await service.getReward("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("getRewards", () => {
    it("Reward 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockRewards = [
        createMockReward({
          id: "reward1",
          imageUrl: "https://example.com/image1.jpg",
        }),
        createMockReward({
          id: "reward2",
          name: "기프티콘",
          description: "1만원권",
          imageUrl: "https://example.com/image2.jpg",
          paymentType: "SCHEDULED",
          scheduledDate: new Date("2025-12-31"),
        }),
      ];
      mockRepo.findMany.mockResolvedValue(mockRewards);

      // When
      const result = await service.getRewards();

      // Then
      expect(result).toEqual(mockRewards);
      expect(mockRepo.findMany).toHaveBeenCalledTimes(1);
    });

    it("빈 배열을 반환할 수 있다", async () => {
      // Given
      mockRepo.findMany.mockResolvedValue([]);

      // When
      const result = await service.getRewards();

      // Then
      expect(result).toEqual([]);
    });
  });

  describe("createReward", () => {
    it("IMMEDIATE 타입 Reward를 성공적으로 생성한다", async () => {
      // Given
      const createData = {
        name: "스타벅스 아메리카노",
        description: "Tall 사이즈",
        imageUrl: "https://example.com/image.jpg",
        paymentType: "IMMEDIATE" as PaymentType,
      };
      const mockCreatedReward = {
        id: "reward1",
        ...createData,
        imageFileUploadId: null,
        scheduledDate: null,
        createdAt: new Date(),
      };
      mockRepo.create.mockResolvedValue(mockCreatedReward);

      // When
      const result = await service.createReward(createData, TEST_USER_ID);

      // Then
      expect(result).toEqual(mockCreatedReward);
      expect(mockRepo.create).toHaveBeenCalledWith(createData, TEST_USER_ID);
    });

    it("SCHEDULED 타입 Reward를 성공적으로 생성한다", async () => {
      // Given
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const createData = {
        name: "기프티콘",
        description: "1만원권",
        paymentType: "SCHEDULED" as PaymentType,
        scheduledDate: futureDate,
      };
      const mockCreatedReward = {
        id: "reward2",
        ...createData,
        imageUrl: null,
        imageFileUploadId: null,
        createdAt: new Date(),
      };
      mockRepo.create.mockResolvedValue(mockCreatedReward);

      // When
      const result = await service.createReward(createData, TEST_USER_ID);

      // Then
      expect(result).toEqual(mockCreatedReward);
      expect(mockRepo.create).toHaveBeenCalledWith(createData, TEST_USER_ID);
    });

    it("이름이 없으면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        name: "",
        paymentType: "IMMEDIATE" as PaymentType,
      };

      // When & Then
      await expect(service.createReward(invalidData, TEST_USER_ID)).rejects.toThrow(
        "Reward 이름을 입력해주세요.",
      );

      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("이름이 100자를 초과하면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        name: "a".repeat(101),
        paymentType: "IMMEDIATE" as PaymentType,
      };

      // When & Then
      await expect(service.createReward(invalidData, TEST_USER_ID)).rejects.toThrow(
        "Reward 이름은 100자를 초과할 수 없습니다.",
      );

      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("SCHEDULED 타입에서 scheduledDate가 없으면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        name: "기프티콘",
        paymentType: "SCHEDULED" as PaymentType,
      };

      // When & Then
      await expect(service.createReward(invalidData, TEST_USER_ID)).rejects.toThrow(
        "예약 지급의 경우 예약 일시는 필수입니다.",
      );

      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("SCHEDULED 타입에서 scheduledDate가 과거이면 400 에러를 던진다", async () => {
      // Given
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24시간 전

      const invalidData = {
        name: "기프티콘",
        paymentType: "SCHEDULED" as PaymentType,
        scheduledDate: pastDate,
      };

      // When & Then
      await expect(service.createReward(invalidData, TEST_USER_ID)).rejects.toThrow(
        "예약 일시는 현재 시간보다 이후여야 합니다.",
      );

      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("updateReward", () => {
    it("Reward를 성공적으로 수정한다", async () => {
      // Given
      const existingReward = createMockReward();
      mockRepo.findById.mockResolvedValue(existingReward);

      const updateData = {
        name: "스타벅스 카페라떼",
        description: "Grande 사이즈",
      };
      const mockUpdatedReward = {
        id: "reward1",
        name: "스타벅스 카페라떼",
        description: "Grande 사이즈",
        imageUrl: null,
        imageFileUploadId: null,
        paymentType: "IMMEDIATE" as PaymentType,
        scheduledDate: null,
        paidAt: null,
        updatedAt: new Date("2025-01-02"),
      };
      mockRepo.update.mockResolvedValue(mockUpdatedReward);

      // When
      const result = await service.updateReward("reward1", updateData, TEST_USER_ID);

      // Then
      expect(result).toEqual(mockUpdatedReward);
      expect(mockRepo.findById).toHaveBeenCalledWith("reward1");
      expect(mockRepo.update).toHaveBeenCalledWith("reward1", updateData, TEST_USER_ID);
    });

    it("description만 수정할 수 있다", async () => {
      // Given
      const existingReward = createMockReward();
      mockRepo.findById.mockResolvedValue(existingReward);

      const updateData = {
        description: "Grande 사이즈",
      };
      const mockUpdatedReward = {
        id: "reward1",
        name: "스타벅스 아메리카노",
        description: "Grande 사이즈",
        imageUrl: null,
        imageFileUploadId: null,
        paymentType: "IMMEDIATE" as PaymentType,
        scheduledDate: null,
        paidAt: null,
        updatedAt: new Date("2025-01-02"),
      };
      mockRepo.update.mockResolvedValue(mockUpdatedReward);

      // When
      const result = await service.updateReward("reward1", updateData, TEST_USER_ID);

      // Then
      expect(result).toEqual(mockUpdatedReward);
      expect(mockRepo.update).toHaveBeenCalledWith("reward1", updateData, TEST_USER_ID);
    });

    it("paymentType을 SCHEDULED에서 IMMEDIATE로 변경할 수 있다", async () => {
      // Given
      const existingReward = createMockReward({
        paymentType: "SCHEDULED",
        scheduledDate: new Date("2025-12-31"),
      });
      mockRepo.findById.mockResolvedValue(existingReward);

      const updateData = {
        paymentType: "IMMEDIATE" as PaymentType,
      };
      const mockUpdatedReward = {
        id: "reward1",
        name: "스타벅스 아메리카노",
        description: "Tall 사이즈",
        imageUrl: null,
        imageFileUploadId: null,
        paymentType: "IMMEDIATE" as PaymentType,
        scheduledDate: null,
        paidAt: null,
        updatedAt: new Date("2025-01-02"),
      };
      mockRepo.update.mockResolvedValue(mockUpdatedReward);

      // When
      const result = await service.updateReward("reward1", updateData, TEST_USER_ID);

      // Then
      expect(result).toEqual(mockUpdatedReward);
      expect(mockRepo.update).toHaveBeenCalledWith("reward1", updateData, TEST_USER_ID);
    });

    it("존재하지 않는 Reward를 수정하려고 하면 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      const updateData = {
        name: "스타벅스 카페라떼",
      };

      // When & Then
      await expect(service.updateReward("invalid-id", updateData, TEST_USER_ID)).rejects.toThrow(
        "Reward를 찾을 수 없습니다.",
      );

      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("이름을 빈 문자열로 수정하려고 하면 400 에러를 던진다", async () => {
      // Given
      const existingReward = createMockReward({ description: null });
      mockRepo.findById.mockResolvedValue(existingReward);

      const invalidData = {
        name: "",
      };

      // When & Then
      await expect(service.updateReward("reward1", invalidData, TEST_USER_ID)).rejects.toThrow(
        "Reward 이름을 입력해주세요.",
      );

      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("paymentType을 SCHEDULED로 변경할 때 scheduledDate가 없으면 400 에러를 던진다", async () => {
      // Given
      const existingReward = createMockReward({ description: null });
      mockRepo.findById.mockResolvedValue(existingReward);

      const invalidData = {
        paymentType: "SCHEDULED" as PaymentType,
      };

      // When & Then
      await expect(service.updateReward("reward1", invalidData, TEST_USER_ID)).rejects.toThrow(
        "예약 지급의 경우 예약 일시는 필수입니다.",
      );

      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteReward", () => {
    it("Reward를 성공적으로 삭제한다", async () => {
      // Given
      const existingReward = createMockReward({ description: null });
      mockRepo.findById.mockResolvedValue(existingReward);
      mockRepo.delete.mockResolvedValue(existingReward);

      // When
      await service.deleteReward("reward1");

      // Then
      expect(mockRepo.findById).toHaveBeenCalledWith("reward1");
      expect(mockRepo.delete).toHaveBeenCalledWith("reward1");
    });

    it("존재하지 않는 Reward를 삭제하려고 하면 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteReward("invalid-id")).rejects.toThrow(
        "Reward를 찾을 수 없습니다.",
      );

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});
