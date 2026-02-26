"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { GUEST_ID_COOKIE_NAME } from "@/constants/cookie";
import prisma from "@/database/utils/prisma/client";
import { cookies } from "next/headers";

export async function claimGuestResponses(): Promise<{ claimed: number }> {
  const user = await requireActiveUser();
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_ID_COOKIE_NAME)?.value;

  if (!guestId) {
    return { claimed: 0 };
  }

  const guestResponses = await prisma.missionResponse.findMany({
    where: { guestId, userId: null },
    select: { id: true, missionId: true },
  });

  if (guestResponses.length === 0) {
    return { claimed: 0 };
  }

  const existingUserResponses = await prisma.missionResponse.findMany({
    where: {
      userId: user.id,
      missionId: { in: guestResponses.map(r => r.missionId) },
    },
    select: { missionId: true },
  });

  const existingMissionIds = new Set(existingUserResponses.map(r => r.missionId));
  const claimableIds = guestResponses
    .filter(r => !existingMissionIds.has(r.missionId))
    .map(r => r.id);

  if (claimableIds.length === 0) {
    return { claimed: 0 };
  }

  const result = await prisma.missionResponse.updateMany({
    where: { id: { in: claimableIds } },
    data: { userId: user.id, guestId: null },
  });

  return { claimed: result.count };
}
