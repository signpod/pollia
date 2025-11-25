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
    const { user, name } = input;

    const existingUser = await this.repo.findFirst(user.id);

    if (existingUser) {
      return false;
    }

    const userName = this.determineUserName(user, name);

    await this.repo.create({
      id: user.id,
      email: user.email ?? "",
      name: userName,
    });

    return true;
  }

  private determineUserName(user: SupabaseUser, providedName?: string): string {
    return providedName || user.user_metadata?.name || user.email?.split("@")[0] || "사용자";
  }

  async updateUser(userId: string, input: UpdateUserInput) {
    const user = await this.repo.findById(userId);

    if (!user) {
      const error = new Error("사용자 정보를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (input.name !== undefined && (!input.name || input.name.trim().length === 0)) {
      const error = new Error("이름은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    const updatedUser = await this.repo.update(userId, input);
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.repo.findById(userId);

    if (!user) {
      const error = new Error("사용자 정보를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    await this.repo.delete(userId);
  }
}

export const userService = new UserService();
