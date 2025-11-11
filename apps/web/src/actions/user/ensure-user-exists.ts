"use server";

import prisma from "@/database/utils/prisma/client";
import type { EnsureUserExistsOptions } from "@/types/dto/user";

/**
 * Prisma에 사용자가 존재하는지 확인하고, 없으면 생성
 *
 * @param options - Supabase User와 사용자 이름
 * @returns 사용자가 새로 생성되었는지 여부
 */
export async function ensureUserExists(options: EnsureUserExistsOptions): Promise<boolean> {
  const { user, name } = options;

  const existingUser = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (existingUser) {
    return false;
  }

  // 사용자 이름 우선순위: name > user_metadata.name > email 앞부분 > "사용자"
  const userName = name || user.user_metadata?.name || user.email?.split("@")[0] || "사용자";

  await prisma.user.create({
    data: {
      id: user.id,
      email: user.email ?? "",
      name: userName,
    },
  });

  return true;
}
