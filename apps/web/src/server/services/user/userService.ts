import { userRepository } from "@/server/repositories/user/userRepository";
import type { GetCurrentUserResponse, EnsureUserExistsOptions } from "@/types/dto";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * User Service
 * User 도메인의 비즈니스 로직 계층
 */
export class UserService {
  constructor(private repo = userRepository) {}

  /**
   * User ID로 User 정보 조회
   * @param userId - User ID
   * @returns User 정보
   * @throws 404 - User를 찾을 수 없는 경우
   */
  async getCurrentUser(userId: string): Promise<GetCurrentUserResponse["data"]> {
    const user = await this.repo.findById(userId);

    if (!user) {
      const error = new Error("사용자 정보를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return user;
  }

  /**
   * Prisma에 사용자가 존재하는지 확인하고, 없으면 생성
   * @param options - Supabase User와 사용자 이름
   * @returns 사용자가 새로 생성되었는지 여부
   */
  async ensureUserExists(options: EnsureUserExistsOptions): Promise<boolean> {
    const { user, name } = options;

    const existingUser = await this.repo.findFirst(user.id);

    if (existingUser) {
      return false;
    }

    // 사용자 이름 우선순위: name > user_metadata.name > email 앞부분 > "사용자"
    const userName = this.determineUserName(user, name);

    await this.repo.create({
      id: user.id,
      email: user.email ?? "",
      name: userName,
    });

    return true;
  }

  /**
   * 사용자 이름 결정 로직
   * @param user - Supabase User
   * @param providedName - 제공된 이름 (선택)
   * @returns 결정된 사용자 이름
   */
  private determineUserName(user: SupabaseUser, providedName?: string): string {
    return (
      providedName ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "사용자"
    );
  }
}

export const userService = new UserService();

