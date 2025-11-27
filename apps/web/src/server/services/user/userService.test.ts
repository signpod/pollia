import type { UserRepository } from "@/server/repositories/user/userRepository";
import { UserRole } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { UserService } from "./userService";

const createMockUser = (
  overrides: Partial<{
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) => ({
  id: "user1",
  email: "test@example.com",
  name: "테스트 사용자",
  role: UserRole.USER,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ...overrides,
});

const createMockSupabaseUser = (overrides: Partial<SupabaseUser> = {}): SupabaseUser =>
  ({
    id: "user1",
    email: "test@example.com",
    user_metadata: {
      name: "테스트 사용자",
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: "2025-01-01T00:00:00Z",
    ...overrides,
  }) as SupabaseUser;

describe("UserService", () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<UserRepository>;

    service = new UserService(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("User를 성공적으로 조회한다", async () => {
      // Given
      const mockUser = createMockUser();
      mockRepo.findById.mockResolvedValue(mockUser);

      // When
      const result = await service.getUserById("user1");

      // Then
      expect(result).toEqual(mockUser);
      expect(mockRepo.findById).toHaveBeenCalledWith("user1");
      expect(mockRepo.findById).toHaveBeenCalledTimes(1);
    });

    it("User가 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getUserById("invalid-id")).rejects.toThrow(
        "사용자 정보를 찾을 수 없습니다.",
      );

      try {
        await service.getUserById("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("createUserIfNotExists", () => {
    it("기존 사용자가 있으면 false를 반환한다", async () => {
      // Given
      const mockUser = createMockUser();
      const supabaseUser = createMockSupabaseUser();
      mockRepo.findFirst.mockResolvedValue(mockUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
      });

      // Then
      expect(result).toBe(false);
      expect(mockRepo.findFirst).toHaveBeenCalledWith("user1");
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("새 사용자를 생성하고 true를 반환한다 (name 제공)", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser();
      mockRepo.findFirst.mockResolvedValue(null);
      const mockCreatedUser = createMockUser({ name: "제공된 이름" });
      mockRepo.create.mockResolvedValue(mockCreatedUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
        name: "제공된 이름",
      });

      // Then
      expect(result).toBe(true);
      expect(mockRepo.findFirst).toHaveBeenCalledWith("user1");
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: "user1",
        email: "test@example.com",
        name: "제공된 이름",
      });
    });

    it("새 사용자를 생성하고 true를 반환한다 (user_metadata.name 사용)", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser({
        user_metadata: { name: "메타데이터 이름" },
      });
      mockRepo.findFirst.mockResolvedValue(null);
      const mockCreatedUser = createMockUser({ name: "메타데이터 이름" });
      mockRepo.create.mockResolvedValue(mockCreatedUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
      });

      // Then
      expect(result).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: "user1",
        email: "test@example.com",
        name: "메타데이터 이름",
      });
    });

    it("새 사용자를 생성하고 true를 반환한다 (email 앞부분 사용)", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser({
        email: "testuser@example.com",
        user_metadata: {},
      });
      mockRepo.findFirst.mockResolvedValue(null);
      const mockCreatedUser = createMockUser({ name: "testuser" });
      mockRepo.create.mockResolvedValue(mockCreatedUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
      });

      // Then
      expect(result).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: "user1",
        email: "testuser@example.com",
        name: "testuser",
      });
    });

    it("새 사용자를 생성하고 true를 반환한다 (기본값 사용자)", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser({
        email: undefined,
        user_metadata: {},
      });
      mockRepo.findFirst.mockResolvedValue(null);
      const mockCreatedUser = createMockUser({ name: "사용자", email: "" });
      mockRepo.create.mockResolvedValue(mockCreatedUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
      });

      // Then
      expect(result).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: "user1",
        email: "",
        name: "사용자",
      });
    });

    it("name이 우선순위가 가장 높다", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser({
        email: "testuser@example.com",
        user_metadata: { name: "메타데이터 이름" },
      });
      mockRepo.findFirst.mockResolvedValue(null);
      const mockCreatedUser = createMockUser({ name: "제공된 이름" });
      mockRepo.create.mockResolvedValue(mockCreatedUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
        name: "제공된 이름",
      });

      // Then
      expect(result).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: "user1",
        email: "testuser@example.com",
        name: "제공된 이름",
      });
    });
  });

  describe("updateUser", () => {
    it("User를 성공적으로 수정한다", async () => {
      // Given
      const mockUser = createMockUser();
      const updatedUser = createMockUser({ name: "새 이름" });
      mockRepo.findById.mockResolvedValue(mockUser);
      mockRepo.update.mockResolvedValue(updatedUser);

      // When
      const result = await service.updateUser("user1", { name: "새 이름" });

      // Then
      expect(result.name).toBe("새 이름");
      expect(mockRepo.findById).toHaveBeenCalledWith("user1");
      expect(mockRepo.update).toHaveBeenCalledWith("user1", { name: "새 이름" });
    });

    it("User가 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.updateUser("invalid-id", { name: "새 이름" })).rejects.toThrow(
        "사용자 정보를 찾을 수 없습니다.",
      );

      try {
        await service.updateUser("invalid-id", { name: "새 이름" });
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("이름이 빈 문자열이면 400 에러를 던진다", async () => {
      // Given
      const mockUser = createMockUser();
      mockRepo.findById.mockResolvedValue(mockUser);

      // When & Then
      await expect(service.updateUser("user1", { name: "" })).rejects.toThrow("이름은 필수입니다.");

      try {
        await service.updateUser("user1", { name: "" });
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(400);
      }

      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("User를 성공적으로 삭제한다", async () => {
      // Given
      const mockUser = createMockUser();
      mockRepo.findById.mockResolvedValue(mockUser);
      mockRepo.delete.mockResolvedValue(mockUser);

      // When
      await service.deleteUser("user1");

      // Then
      expect(mockRepo.findById).toHaveBeenCalledWith("user1");
      expect(mockRepo.delete).toHaveBeenCalledWith("user1");
    });

    it("User가 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteUser("invalid-id")).rejects.toThrow(
        "사용자 정보를 찾을 수 없습니다.",
      );

      try {
        await service.deleteUser("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});
