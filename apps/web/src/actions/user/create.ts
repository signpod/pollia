"use server";

import type { CreateUserIfNotExistsInput } from "@/server/services/user/types";
import { userService } from "@/server/services/user/userService";
import type { EnsureUserExistsOptions } from "@/types/dto/user";

function toCreateUserIfNotExistsInput(dto: EnsureUserExistsOptions): CreateUserIfNotExistsInput {
  return {
    user: dto.user,
    name: dto.name,
  };
}

export async function createUserIfNotExists(request: EnsureUserExistsOptions): Promise<boolean> {
  try {
    const input = toCreateUserIfNotExistsInput(request);
    return await userService.createUserIfNotExists(input);
  } catch (error) {
    console.error("createUserIfNotExists error:", error);
    throw error;
  }
}
