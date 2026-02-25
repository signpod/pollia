import { userRepository } from "@/server/repositories/user/userRepository";
import { UserStatus } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { CreateUserIfNotExistsInput, UpdateUserInput } from "./types";

export class UserService {
  constructor(private repo = userRepository) {}

  async getUserById(userId: string) {
    const user = await this.repo.findById(userId);

    if (!user) {
      const error = new Error("사용자 정보를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return user;
  }

  async createUserIfNotExists(input: CreateUserIfNotExistsInput): Promise<boolean> {
    const { user, name, phone, email, kakaoProfileImageUrl } = input;

    const existingUser = await this.repo.findById(user.id);

    if (existingUser) {
      return false;
    }

    const normalizedPhone = phone ? this.normalizePhoneNumber(phone) : undefined;

    if (!normalizedPhone) {
      const error = new Error("전화번호는 필수입니다.");
      error.cause = 400;
      throw error;
    }

    const userName = this.determineUserName(user, name);

    await this.repo.create({
      id: user.id,
      email,
      name: userName,
      phone: normalizedPhone,
      kakaoProfileImageUrl: kakaoProfileImageUrl ?? undefined,
    });

    return true;
  }

  private determineUserName(user: SupabaseUser, providedName?: string): string {
    return providedName || user.user_metadata?.name || user.email?.split("@")[0] || "사용자";
  }

  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/^\+82\s?0?/, "0").replace(/[^0-9]/g, "");
  }

  async updateUser(userId: string, input: UpdateUserInput) {
    await this.getUserById(userId);
    const normalizedInput = this.normalizeUpdateInput(input);
    return this.repo.update(userId, normalizedInput);
  }

  private normalizeUpdateInput(input: UpdateUserInput): UpdateUserInput {
    const result: UpdateUserInput = {};

    if (input.name !== undefined) {
      result.name = input.name;
    }

    if (typeof input.phone === "string") {
      result.phone = this.normalizePhoneNumber(input.phone);
    }

    if (input.profileImageFileUploadId !== undefined) {
      result.profileImageFileUploadId = input.profileImageFileUploadId;
    }

    if (input.kakaoProfileImageUrl !== undefined) {
      result.kakaoProfileImageUrl = input.kakaoProfileImageUrl;
    }

    return result;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.getUserById(userId);
    await this.repo.delete(userId);
  }

  /**
   * 탈퇴 상태 머신의 1단계: ACTIVE -> WITHDRAWING 전환.
   * 이미 WITHDRAWING/WITHDRAWN이면 멱등하게 현재 상태를 반환합니다.
   */
  async startWithdrawal(userId: string, reason?: string) {
    const user = await this.getUserById(userId);

    if (user.status === UserStatus.WITHDRAWN) {
      return { status: "already_withdrawn" as const, user };
    }

    if (user.status === UserStatus.WITHDRAWING) {
      return { status: "already_withdrawing" as const, user };
    }

    const updated = await this.repo.startWithdrawal(userId, reason);
    return { status: "started" as const, user: updated };
  }

  /**
   * 탈퇴 상태 머신의 2단계: WITHDRAWING -> WITHDRAWN 전환 + 개인정보 익명화.
   * 이미 WITHDRAWN이면 멱등하게 성공 반환합니다.
   */
  async completeWithdrawal(userId: string) {
    const user = await this.getUserById(userId);

    if (user.status === UserStatus.WITHDRAWN) {
      return { status: "already_withdrawn" as const, user };
    }

    if (user.status !== UserStatus.WITHDRAWING) {
      const error = new Error("탈퇴 진행 중인 계정만 완료할 수 있습니다.");
      error.cause = 409;
      throw error;
    }

    const updated = await this.repo.completeWithdrawal(userId);
    return { status: "completed" as const, user: updated };
  }
}

export const userService = new UserService();
