import prisma from "@/database/utils/prisma/client";
import { type MissionCompletionInferenceSource, Prisma } from "@prisma/client";

export class MissionCompletionInferenceCacheRepository {
  async findByMissionAndFingerprint(missionId: string, fingerprintHash: string) {
    return prisma.missionCompletionInferenceCache.findUnique({
      where: {
        missionId_fingerprintHash: {
          missionId,
          fingerprintHash,
        },
      },
    });
  }

  async upsertByMissionAndFingerprint(input: {
    missionId: string;
    fingerprintHash: string;
    fingerprintPayload: Prisma.InputJsonValue;
    missionCompletionId: string;
    source: MissionCompletionInferenceSource;
    confidence?: number | null;
    modelName?: string | null;
  }) {
    return prisma.missionCompletionInferenceCache.upsert({
      where: {
        missionId_fingerprintHash: {
          missionId: input.missionId,
          fingerprintHash: input.fingerprintHash,
        },
      },
      create: {
        missionId: input.missionId,
        fingerprintHash: input.fingerprintHash,
        fingerprintPayload: input.fingerprintPayload,
        missionCompletionId: input.missionCompletionId,
        source: input.source,
        confidence: input.confidence ?? null,
        modelName: input.modelName ?? null,
      },
      update: {
        fingerprintPayload: input.fingerprintPayload,
        missionCompletionId: input.missionCompletionId,
        source: input.source,
        confidence: input.confidence ?? null,
        modelName: input.modelName ?? null,
      },
    });
  }

  async deleteByMissionId(missionId: string) {
    return prisma.missionCompletionInferenceCache.deleteMany({
      where: { missionId },
    });
  }
}

export const missionCompletionInferenceCacheRepository =
  new MissionCompletionInferenceCacheRepository();
