import { userRepository } from "@/server/repositories/user/userRepository";
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
    const { user, name, phone } = input;

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
      email: user.email ?? "",
      name: userName,
      phone: normalizedPhone,
    });

    return true;
  }

  private determineUserName(user: SupabaseUser, providedName?: string): string {
    return providedName || user.user_metadata?.name || user.email?.split("@")[0] || "사용자";
  }

  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/^\+82\s?/, "0").replace(/[^0-9]/g, "");
  }

  async updateUser(userId: string, input: UpdateUserInput) {
    await this.getUserById(userId);
    const normalizedInput = this.normalizeUpdateInput(input);
    return this.repo.update(userId, normalizedInput);
  }

  private normalizeUpdateInput(input: UpdateUserInput): UpdateUserInput {
    if (typeof input.phone === "string") {
      return { ...input, phone: this.normalizePhoneNumber(input.phone) };
    }
    return input;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.getUserById(userId);
    await this.repo.delete(userId);
  }
}

export const userService = new UserService();
