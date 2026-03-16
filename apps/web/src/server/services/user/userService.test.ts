import type { UserRepository } from "@/server/repositories/user/userRepository";
import { UserRole, UserStatus } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { UserService } from "./userService";

const createMockUser = (
  overrides: Partial<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: UserRole;
    status: UserStatus;
    profileImageFileUploadId: string | null;
    profileImageFileUpload: { publicUrl: string } | null;
    createdAt: Date;
    updatedAt: Date;
    withdrawnAt: Date | null;
    withdrawalReason: string | null;
    authDeletedAt: Date | null;
  }> = {},
) => ({
  id: "user1",
  email: "test@example.com",
  name: "테스트 사용자",
  phone: "01012345678",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  profileImageFileUploadId: null,
  profileImageFileUpload: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  withdrawnAt: null,
  withdrawalReason: null,
  authDeletedAt: null,
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
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      startWithdrawal: jest.fn(),
      completeWithdrawal: jest.fn(),
      forceWithdrawal: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

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
      mockRepo.findById.mockResolvedValue(mockUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
        phone: "+82 010-1234-5678",
        email: "test@example.com",
      });

      // Then
      expect(result).toBe(false);
      expect(mockRepo.findById).toHaveBeenCalledWith("user1");
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("새 사용자를 생성하고 true를 반환한다 (name 제공)", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser();
      mockRepo.findById.mockResolvedValue(null);
      const mockCreatedUser = createMockUser({ name: "제공된 이름" });
      mockRepo.create.mockResolvedValue(mockCreatedUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
        name: "제공된 이름",
        phone: "+82 010-1234-5678",
        email: "test@example.com",
      });

      // Then
      expect(result).toBe(true);
      expect(mockRepo.findById).toHaveBeenCalledWith("user1");
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: "user1",
        email: "test@example.com",
        name: "제공된 이름",
        phone: "01012345678",
      });
    });

    it("새 사용자를 생성하고 true를 반환한다 (user_metadata.name 사용)", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser({
        user_metadata: { name: "메타데이터 이름" },
      });
      mockRepo.findById.mockResolvedValue(null);
      const mockCreatedUser = createMockUser({ name: "메타데이터 이름" });
      mockRepo.create.mockResolvedValue(mockCreatedUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
        phone: "01087654321",
        email: "test@example.com",
      });

      // Then
      expect(result).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: "user1",
        email: "test@example.com",
        name: "메타데이터 이름",
        phone: "01087654321",
      });
    });

    it("새 사용자를 생성하고 true를 반환한다 (email 앞부분 사용)", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser({
        email: "testuser@example.com",
        user_metadata: {},
      });
      mockRepo.findById.mockResolvedValue(null);
      const mockCreatedUser = createMockUser({ name: "testuser" });
      mockRepo.create.mockResolvedValue(mockCreatedUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
        phone: "01011112222",
        email: "testuser@example.com",
      });

      // Then
      expect(result).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: "user1",
        email: "testuser@example.com",
        name: "testuser",
        phone: "01011112222",
      });
    });

    it("새 사용자를 생성하고 true를 반환한다 (기본값 사용자)", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser({
        email: undefined,
        user_metadata: {},
      });
      mockRepo.findById.mockResolvedValue(null);
      const mockCreatedUser = createMockUser({ name: "사용자", email: "default@example.com" });
      mockRepo.create.mockResolvedValue(mockCreatedUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
        phone: "01099998888",
        email: "default@example.com",
      });

      // Then
      expect(result).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: "user1",
        email: "default@example.com",
        name: "사용자",
        phone: "01099998888",
      });
    });

    it("name이 우선순위가 가장 높다", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser({
        email: "testuser@example.com",
        user_metadata: { name: "메타데이터 이름" },
      });
      mockRepo.findById.mockResolvedValue(null);
      const mockCreatedUser = createMockUser({ name: "제공된 이름" });
      mockRepo.create.mockResolvedValue(mockCreatedUser);

      // When
      const result = await service.createUserIfNotExists({
        user: supabaseUser,
        name: "제공된 이름",
        phone: "01012345678",
        email: "testuser@example.com",
      });

      // Then
      expect(result).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: "user1",
        email: "testuser@example.com",
        name: "제공된 이름",
        phone: "01012345678",
      });
    });

    it("전화번호가 없으면 400 에러를 던진다", async () => {
      // Given
      const supabaseUser = createMockSupabaseUser();
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.createUserIfNotExists({
          user: supabaseUser,
          name: "테스트",
          email: "test@example.com",
        }),
      ).rejects.toThrow("전화번호는 필수입니다.");

      try {
        await service.createUserIfNotExists({
          user: supabaseUser,
          name: "테스트",
          email: "test@example.com",
        });
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(400);
      }

      expect(mockRepo.create).not.toHaveBeenCalled();
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

    it("전화번호를 정규화하여 수정한다", async () => {
      // Given
      const mockUser = createMockUser();
      const updatedUser = createMockUser({ phone: "01098765432" });
      mockRepo.findById.mockResolvedValue(mockUser);
      mockRepo.update.mockResolvedValue(updatedUser);

      // When
      const result = await service.updateUser("user1", { phone: "+82 010-9876-5432" });

      // Then
      expect(result.phone).toBe("01098765432");
      expect(mockRepo.update).toHaveBeenCalledWith("user1", { phone: "01098765432" });
    });

    it("프로필 이미지를 수정한다", async () => {
      // Given
      const mockUser = createMockUser();
      const updatedUser = createMockUser({ profileImageFileUploadId: "file-123" });
      mockRepo.findById.mockResolvedValue(mockUser);
      mockRepo.update.mockResolvedValue(updatedUser);

      // When
      const result = await service.updateUser("user1", { profileImageFileUploadId: "file-123" });

      // Then
      expect(result.profileImageFileUploadId).toBe("file-123");
      expect(mockRepo.update).toHaveBeenCalledWith("user1", {
        profileImageFileUploadId: "file-123",
      });
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

  describe("listUsers", () => {
    it("유저 목록을 페이지 기반으로 조회한다", async () => {
      // Given
      const mockUsers = [createMockUser({ id: "user1" }), createMockUser({ id: "user2" })];
      mockRepo.findMany.mockResolvedValue(mockUsers);
      mockRepo.count.mockResolvedValue(2);

      // When
      const result = await service.listUsers({ page: 1, pageSize: 20 });

      // Then
      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(mockRepo.findMany).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      expect(mockRepo.count).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
    });

    it("옵션 없이 호출하면 기본값으로 조회한다", async () => {
      // Given
      mockRepo.findMany.mockResolvedValue([]);
      mockRepo.count.mockResolvedValue(0);

      // When
      const result = await service.listUsers();

      // Then
      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
      expect(mockRepo.findMany).toHaveBeenCalledWith(undefined);
      expect(mockRepo.count).toHaveBeenCalledWith(undefined);
    });

    it("검색어로 필터링하여 조회한다", async () => {
      // Given
      const mockUsers = [createMockUser({ id: "user1", name: "검색결과" })];
      mockRepo.findMany.mockResolvedValue(mockUsers);
      mockRepo.count.mockResolvedValue(1);

      // When
      const result = await service.listUsers({ search: "검색" });

      // Then
      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockRepo.findMany).toHaveBeenCalledWith({ search: "검색" });
    });
  });

  describe("adminForceWithdraw", () => {
    it("ACTIVE 유저를 강제 탈퇴 처리한다", async () => {
      // Given
      const activeUser = createMockUser({ status: UserStatus.ACTIVE });
      const withdrawnUser = createMockUser({
        status: UserStatus.WITHDRAWN,
        email: "withdrawn+user1@withdrawn.local",
        name: "탈퇴한 사용자",
        phone: null,
      });
      mockRepo.findById.mockResolvedValue(activeUser);
      mockRepo.forceWithdrawal.mockResolvedValue(withdrawnUser);

      // When
      const result = await service.adminForceWithdraw("user1");

      // Then
      expect(result.status).toBe(UserStatus.WITHDRAWN);
      expect(mockRepo.forceWithdrawal).toHaveBeenCalledWith("user1");
    });

    it("WITHDRAWING 유저를 강제 탈퇴 처리한다", async () => {
      // Given
      const withdrawingUser = createMockUser({ status: UserStatus.WITHDRAWING });
      const withdrawnUser = createMockUser({ status: UserStatus.WITHDRAWN });
      mockRepo.findById.mockResolvedValue(withdrawingUser);
      mockRepo.forceWithdrawal.mockResolvedValue(withdrawnUser);

      // When
      const result = await service.adminForceWithdraw("user1");

      // Then
      expect(result.status).toBe(UserStatus.WITHDRAWN);
      expect(mockRepo.forceWithdrawal).toHaveBeenCalledWith("user1");
    });

    it("이미 탈퇴한 유저는 409 에러를 던진다", async () => {
      // Given
      const withdrawnUser = createMockUser({ status: UserStatus.WITHDRAWN });
      mockRepo.findById.mockResolvedValue(withdrawnUser);

      // When & Then
      await expect(service.adminForceWithdraw("user1")).rejects.toThrow(
        "이미 탈퇴한 사용자입니다.",
      );

      try {
        await service.adminForceWithdraw("user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(409);
      }

      expect(mockRepo.forceWithdrawal).not.toHaveBeenCalled();
    });

    it("존재하지 않는 유저는 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.adminForceWithdraw("invalid-id")).rejects.toThrow(
        "사용자 정보를 찾을 수 없습니다.",
      );

      try {
        await service.adminForceWithdraw("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(mockRepo.forceWithdrawal).not.toHaveBeenCalled();
    });
  });

  describe("startWithdrawal", () => {
    it("ACTIVE 사용자를 WITHDRAWING으로 전환한다 (사유 있음)", async () => {
      // Given
      const activeUser = createMockUser({ status: UserStatus.ACTIVE });
      const withdrawingUser = createMockUser({
        status: UserStatus.WITHDRAWING,
        withdrawalReason: "서비스 불만족",
      });
      mockRepo.findById.mockResolvedValue(activeUser);
      mockRepo.startWithdrawal.mockResolvedValue(withdrawingUser);

      // When
      const result = await service.startWithdrawal("user1", "서비스 불만족");

      // Then
      expect(result.status).toBe("started");
      expect(result.user.status).toBe(UserStatus.WITHDRAWING);
      expect(mockRepo.startWithdrawal).toHaveBeenCalledWith("user1", "서비스 불만족");
    });

    it("ACTIVE 사용자를 WITHDRAWING으로 전환한다 (사유 없음)", async () => {
      // Given
      const activeUser = createMockUser({ status: UserStatus.ACTIVE });
      const withdrawingUser = createMockUser({
        status: UserStatus.WITHDRAWING,
        withdrawalReason: null,
      });
      mockRepo.findById.mockResolvedValue(activeUser);
      mockRepo.startWithdrawal.mockResolvedValue(withdrawingUser);

      // When
      const result = await service.startWithdrawal("user1");

      // Then
      expect(result.status).toBe("started");
      expect(mockRepo.startWithdrawal).toHaveBeenCalledWith("user1", undefined);
    });

    it("WITHDRAWING 사용자는 멱등하게 already_withdrawing을 반환한다", async () => {
      // Given
      const withdrawingUser = createMockUser({ status: UserStatus.WITHDRAWING });
      mockRepo.findById.mockResolvedValue(withdrawingUser);

      // When
      const result = await service.startWithdrawal("user1", "새 사유");

      // Then
      expect(result.status).toBe("already_withdrawing");
      expect(result.user).toEqual(withdrawingUser);
      expect(mockRepo.startWithdrawal).not.toHaveBeenCalled();
    });

    it("WITHDRAWN 사용자는 멱등하게 already_withdrawn을 반환한다", async () => {
      // Given
      const withdrawnUser = createMockUser({
        status: UserStatus.WITHDRAWN,
        withdrawnAt: new Date("2025-06-01"),
      });
      mockRepo.findById.mockResolvedValue(withdrawnUser);

      // When
      const result = await service.startWithdrawal("user1");

      // Then
      expect(result.status).toBe("already_withdrawn");
      expect(result.user).toEqual(withdrawnUser);
      expect(mockRepo.startWithdrawal).not.toHaveBeenCalled();
    });

    it("존재하지 않는 사용자는 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.startWithdrawal("invalid-id")).rejects.toThrow(
        "사용자 정보를 찾을 수 없습니다.",
      );

      try {
        await service.startWithdrawal("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(mockRepo.startWithdrawal).not.toHaveBeenCalled();
    });
  });

  describe("completeWithdrawal", () => {
    it("WITHDRAWING 사용자를 WITHDRAWN으로 전환하고 익명화한다", async () => {
      // Given
      const withdrawingUser = createMockUser({ status: UserStatus.WITHDRAWING });
      const withdrawnUser = createMockUser({
        status: UserStatus.WITHDRAWN,
        email: "withdrawn+user1@withdrawn.local",
        name: "탈퇴한 사용자",
        phone: null,
        profileImageFileUploadId: null,
        withdrawnAt: new Date("2025-06-01"),
        authDeletedAt: new Date("2025-06-01"),
      });
      mockRepo.findById.mockResolvedValue(withdrawingUser);
      mockRepo.completeWithdrawal.mockResolvedValue(withdrawnUser);

      // When
      const result = await service.completeWithdrawal("user1");

      // Then
      expect(result.status).toBe("completed");
      expect(result.user.status).toBe(UserStatus.WITHDRAWN);
      expect(result.user.email).toBe("withdrawn+user1@withdrawn.local");
      expect(result.user.name).toBe("탈퇴한 사용자");
      expect(result.user.phone).toBeNull();
      expect(result.user.profileImageFileUploadId).toBeNull();
      expect(result.user.withdrawnAt).not.toBeNull();
      expect(result.user.authDeletedAt).not.toBeNull();
      expect(mockRepo.completeWithdrawal).toHaveBeenCalledWith("user1");
    });

    it("WITHDRAWN 사용자는 멱등하게 already_withdrawn을 반환한다", async () => {
      // Given
      const withdrawnUser = createMockUser({
        status: UserStatus.WITHDRAWN,
        withdrawnAt: new Date("2025-06-01"),
      });
      mockRepo.findById.mockResolvedValue(withdrawnUser);

      // When
      const result = await service.completeWithdrawal("user1");

      // Then
      expect(result.status).toBe("already_withdrawn");
      expect(result.user).toEqual(withdrawnUser);
      expect(mockRepo.completeWithdrawal).not.toHaveBeenCalled();
    });

    it("ACTIVE 사용자는 409 에러를 던진다 (잘못된 상태 전이)", async () => {
      // Given
      const activeUser = createMockUser({ status: UserStatus.ACTIVE });
      mockRepo.findById.mockResolvedValue(activeUser);

      // When & Then
      await expect(service.completeWithdrawal("user1")).rejects.toThrow(
        "탈퇴 진행 중인 계정만 완료할 수 있습니다.",
      );

      try {
        await service.completeWithdrawal("user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(409);
      }

      expect(mockRepo.completeWithdrawal).not.toHaveBeenCalled();
    });

    it("존재하지 않는 사용자는 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.completeWithdrawal("invalid-id")).rejects.toThrow(
        "사용자 정보를 찾을 수 없습니다.",
      );

      try {
        await service.completeWithdrawal("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(mockRepo.completeWithdrawal).not.toHaveBeenCalled();
    });
  });
});
