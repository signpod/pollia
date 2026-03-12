import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import {
  getValidFileUploadIds,
  sanitizeFileUploadRefs,
} from "@/server/repositories/common/sanitizeFileUploadRefs";
import type { CompletionLinkInput } from "@/types/dto";
import { Prisma } from "@prisma/client";

const linksInclude = {
  include: {
    fileUpload: {
      select: { id: true, publicUrl: true },
    },
  },
  orderBy: { order: "asc" as const },
};

const baseInclude = {
  imageFileUpload: {
    select: { id: true, publicUrl: true },
  },
  links: linksInclude,
};

const includeWithMission = {
  ...baseInclude,
  mission: {
    select: { id: true, creatorId: true },
  },
};

interface CreateData {
  title: string;
  description: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  missionId: string;
  links?: CompletionLinkInput[];
}

interface UpdateData {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  links?: CompletionLinkInput[];
}

function collectFileUploadIds(
  imageFileUploadId?: string | null,
  links?: CompletionLinkInput[],
): string[] {
  const ids: string[] = [];
  if (imageFileUploadId) ids.push(imageFileUploadId);
  if (links) {
    for (const link of links) {
      if (link.fileUploadId) ids.push(link.fileUploadId);
    }
  }
  return ids;
}

async function sanitizeLinks(
  tx: Parameters<typeof getValidFileUploadIds>[0],
  links?: CompletionLinkInput[],
): Promise<CompletionLinkInput[] | undefined> {
  if (!links?.length) return links;

  const candidateIds = links.map(l => l.fileUploadId).filter((id): id is string => Boolean(id));

  if (candidateIds.length === 0) return links;

  const validIds = await getValidFileUploadIds(tx, candidateIds);

  return links.map(link => {
    if (!link.fileUploadId || validIds.has(link.fileUploadId)) return link;
    return { ...link, fileUploadId: null, imageUrl: null };
  });
}

function buildLinksCreate(links?: CompletionLinkInput[]) {
  if (!links?.length) return {};
  return {
    links: {
      create: links.map(link => ({
        name: link.name,
        url: link.url,
        imageUrl: link.imageUrl ?? null,
        order: link.order,
        fileUploadId: link.fileUploadId ?? null,
      })),
    },
  };
}

export class MissionCompletionRepository {
  async findById(id: string) {
    return prisma.missionCompletion.findUnique({
      where: { id },
      include: includeWithMission,
    });
  }

  async findByMissionId(missionId: string) {
    return prisma.missionCompletion.findFirst({
      where: { missionId },
      include: baseInclude,
      orderBy: { createdAt: "asc" },
    });
  }

  async findAllByMissionId(missionId: string) {
    return prisma.missionCompletion.findMany({
      where: { missionId },
      include: includeWithMission,
      orderBy: { createdAt: "asc" },
    });
  }

  async create(data: CreateData, userId?: string, client?: Prisma.TransactionClient) {
    const { links: rawLinks, ...rawCompletionData } = data;
    const queryClient = client ?? prisma;

    const sanitizedData = await sanitizeFileUploadRefs(
      queryClient,
      rawCompletionData as Record<string, unknown>,
      [{ idField: "imageFileUploadId", urlField: "imageUrl" }],
    );
    const completionData = sanitizedData as typeof rawCompletionData;
    const links = await sanitizeLinks(queryClient, rawLinks);

    const fileUploadIds = collectFileUploadIds(completionData.imageFileUploadId, links);
    const needsTransaction = fileUploadIds.length > 0 && userId;
    const linksCreate = buildLinksCreate(links);

    const execute = async (tx: Prisma.TransactionClient) => {
      const missionCompletion = await tx.missionCompletion.create({
        data: {
          ...completionData,
          ...linksCreate,
        },
        include: baseInclude,
      });

      if (fileUploadIds.length > 0 && userId) {
        await confirmFileUploads(tx, userId, fileUploadIds);
      }

      return missionCompletion;
    };

    if (client) return execute(client);
    if (needsTransaction) return prisma.$transaction(execute);

    return prisma.missionCompletion.create({
      data: {
        ...completionData,
        ...linksCreate,
      },
      include: baseInclude,
    });
  }

  async update(id: string, data: UpdateData, userId?: string) {
    const { links: rawLinks, ...rawCompletionFields } = data;
    const hasLinks = rawLinks !== undefined;

    const sanitizedData = await sanitizeFileUploadRefs(
      prisma,
      rawCompletionFields as Record<string, unknown>,
      [{ idField: "imageFileUploadId", urlField: "imageUrl" }],
    );
    const completionFields = sanitizedData as typeof rawCompletionFields;
    const links = hasLinks ? await sanitizeLinks(prisma, rawLinks) : undefined;

    const fileUploadIds = collectFileUploadIds(
      typeof completionFields.imageFileUploadId === "string"
        ? completionFields.imageFileUploadId
        : undefined,
      links,
    );
    const needsTransaction = hasLinks || fileUploadIds.length > 0;

    if (needsTransaction) {
      return prisma.$transaction(async tx => {
        if (hasLinks) {
          await tx.completionLink.deleteMany({ where: { missionCompletionId: id } });
        }

        const missionCompletion = await tx.missionCompletion.update({
          where: { id },
          data: {
            ...completionFields,
            ...buildLinksCreate(hasLinks ? links : undefined),
          },
          include: includeWithMission,
        });

        if (fileUploadIds.length > 0 && userId) {
          await confirmFileUploads(tx, userId, fileUploadIds);
        }

        return missionCompletion;
      });
    }

    return prisma.missionCompletion.update({
      where: { id },
      data: completionFields,
      include: includeWithMission,
    });
  }

  async delete(id: string) {
    return prisma.missionCompletion.delete({
      where: { id },
    });
  }
}

export const missionCompletionRepository = new MissionCompletionRepository();
