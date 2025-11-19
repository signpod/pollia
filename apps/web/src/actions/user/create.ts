"use server";

import { userService } from "@/server/services/user/userService";
import type { EnsureUserExistsOptions } from "@/types/dto/user";

/**
 * Prisma에 사용자가 존재하는지 확인하고, 없으면 생성
 * @param options - Supabase User와 사용자 이름
 * @returns 사용자가 새로 생성되었는지 여부
 */
export async function createUserIfNotExists(options: EnsureUserExistsOptions): Promise<boolean> {
  try {
    return await userService.createUserIfNotExists(options);
  } catch (error) {
    console.error("❌ 사용자 생성 실패:", error);
    throw error;
  }
}
