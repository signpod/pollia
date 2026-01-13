"use server";

import type { CreateUserIfNotExistsInput } from "@/server/services/user/types";
import { userService } from "@/server/services/user/userService";

export async function createUserIfNotExists(request: CreateUserIfNotExistsInput): Promise<boolean> {
  try {
    return await userService.createUserIfNotExists(request);
  } catch (error) {
    console.error("createUserIfNotExists error:", error);
    throw error;
  }
}
