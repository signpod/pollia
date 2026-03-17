import type { BannerRepository } from "@/server/repositories/banner/bannerRepository";
import type { Banner } from "@prisma/client";
import { BannerService } from "./bannerService";

jest.mock("@/database/utils/prisma/client", () => ({
  __esModule: true,
  default: {
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => fn({}),
  },
}));

jest.mock("@/server/repositories/common/confirmFileUploads", () => ({
  confirmFileUploads: jest.fn(),
}));

const createMockBanner = (overrides: Partial<Banner> = {}): Banner => ({
  id: "banner1",
  title: "테스트 배너",
  subtitle: null,
  imageUrl: "https://example.com/image.jpg",
  linkUrl: null,
  order: 0,
  imageFileUploadId: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ...overrides,
});

describe("BannerService", () => {
  let service: BannerService;
  let mockRepo: jest.Mocked<BannerRepository>;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateManyOrders: jest.fn(),
      getMaxOrder: jest.fn(),
    } as unknown as jest.Mocked<BannerRepository>;

    service = new BannerService(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getBanner", () => {
    it("배너를 성공적으로 조회한다", async () => {
      // Given
      const mockBanner = createMockBanner();
      mockRepo.findById.mockResolvedValue(mockBanner);

      // When
      const result = await service.getBanner("banner1");

      // Then
      expect(result).toEqual(mockBanner);
      expect(mockRepo.findById).toHaveBeenCalledWith("banner1");
    });

    it("배너가 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getBanner("invalid")).rejects.toThrow("배너를 찾을 수 없습니다.");

      try {
        await service.getBanner("invalid");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("listBanners", () => {
    it("전체 배너 목록을 order 순으로 조회한다", async () => {
      // Given
      const banners = [
        createMockBanner({ id: "b1", order: 0 }),
        createMockBanner({ id: "b2", order: 1 }),
      ];
      mockRepo.findAll.mockResolvedValue(banners);

      // When
      const result = await service.listBanners();

      // Then
      expect(result).toEqual(banners);
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("createBanner", () => {
    it("배너를 성공적으로 생성한다", async () => {
      // Given
      const newBanner = createMockBanner({ id: "new-banner", order: 3 });
      mockRepo.getMaxOrder.mockResolvedValue(2);
      mockRepo.create.mockResolvedValue(newBanner);

      // When
      const result = await service.createBanner({
        title: "새 배너",
        imageUrl: "https://example.com/new.jpg",
      });

      // Then
      expect(result).toEqual(newBanner);
      expect(mockRepo.create).toHaveBeenCalledWith(
        {
          title: "새 배너",
          subtitle: null,
          imageUrl: "https://example.com/new.jpg",
          linkUrl: null,
          imageFileUploadId: null,
          order: 3,
        },
        expect.anything(),
      );
    });

    it("첫 번째 배너는 order 0으로 생성된다", async () => {
      // Given
      const newBanner = createMockBanner({ order: 0 });
      mockRepo.getMaxOrder.mockResolvedValue(-1);
      mockRepo.create.mockResolvedValue(newBanner);

      // When
      await service.createBanner({
        title: "첫 배너",
        imageUrl: "https://example.com/first.jpg",
      });

      // Then
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ order: 0 }),
        expect.anything(),
      );
    });

    it("이미지 URL이 비어있으면 400 에러를 던진다", async () => {
      // When & Then
      await expect(service.createBanner({ title: "배너", imageUrl: "" })).rejects.toThrow(
        "배너 이미지 URL은 필수입니다.",
      );

      try {
        await service.createBanner({ title: "배너", imageUrl: "  " });
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(400);
      }
    });
  });

  describe("updateBanner", () => {
    it("배너를 성공적으로 수정한다", async () => {
      // Given
      const existing = createMockBanner();
      const updated = createMockBanner({ title: "수정된 배너" });
      mockRepo.findById.mockResolvedValue(existing);
      mockRepo.update.mockResolvedValue(updated);

      // When
      const result = await service.updateBanner("banner1", { title: "수정된 배너" });

      // Then
      expect(result.title).toBe("수정된 배너");
      expect(mockRepo.update).toHaveBeenCalledWith("banner1", { title: "수정된 배너" });
    });

    it("존재하지 않는 배너는 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.updateBanner("invalid", { title: "수정" })).rejects.toThrow(
        "배너를 찾을 수 없습니다.",
      );
    });
  });

  describe("deleteBanner", () => {
    it("배너를 성공적으로 삭제한다", async () => {
      // Given
      const existing = createMockBanner();
      mockRepo.findById.mockResolvedValue(existing);
      mockRepo.delete.mockResolvedValue(existing);

      // When
      await service.deleteBanner("banner1");

      // Then
      expect(mockRepo.delete).toHaveBeenCalledWith("banner1");
    });

    it("존재하지 않는 배너는 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteBanner("invalid")).rejects.toThrow("배너를 찾을 수 없습니다.");
    });
  });

  describe("reorderBanners", () => {
    it("배너 순서를 변경한다", async () => {
      // Given
      const orders = [
        { id: "b1", order: 1 },
        { id: "b2", order: 0 },
      ];
      mockRepo.updateManyOrders.mockResolvedValue([
        createMockBanner({ id: "b1", order: 1 }),
        createMockBanner({ id: "b2", order: 0 }),
      ]);

      // When
      await service.reorderBanners(orders);

      // Then
      expect(mockRepo.updateManyOrders).toHaveBeenCalledWith(orders);
    });

    it("빈 배열이면 400 에러를 던진다", async () => {
      // When & Then
      await expect(service.reorderBanners([])).rejects.toThrow("순서 변경할 배너가 없습니다.");

      try {
        await service.reorderBanners([]);
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(400);
      }
    });
  });
});
