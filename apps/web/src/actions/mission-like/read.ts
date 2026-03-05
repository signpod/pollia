"use server";

import { requireActiveUser } from "@/actions/common/auth";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { missionLikeService } from "@/server/services/mission-like";

export async function getMissionLikeStatus(missionId: string) {
  try {
    const likesCount = await missionLikeService.getLikesCount(missionId);
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: { isLiked: false, likesCount } };
    }

    const isLiked = await missionLikeService.isLiked(missionId, user.id);
    return { data: { isLiked, likesCount } };
  } catch (error) {
    console.error("getMissionLikeStatus error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("좋아요 상태를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getLikedMissions() {
  try {
    const user = await requireActiveUser();
    const missions = await missionLikeService.getLikedMissions(user.id);
    return { data: missions };
  } catch (error) {
    console.error("getLikedMissions error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(
      `좋아요한 ${UBIQUITOUS_CONSTANTS.MISSION} 목록을 불러올 수 없습니다.`,
    );
    serverError.cause = 500;
    throw serverError;
  }
}
