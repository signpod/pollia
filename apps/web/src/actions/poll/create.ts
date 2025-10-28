"use server";

import {
  ResultMode,
  FileStatus,
  RelatedEntityType,
  PollType,
} from "@prisma/client";
import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";
import { CreatePollRequest, CreatePollResponse } from "@/types/dto";
import { BINARY_POLL_OPTIONS, isBinaryPollType } from "@/constants/poll";
import { binaryPollSchema } from "@/schemas/binaryPollSchema";
import { multiplePollSchema } from "@/schemas/multiplePollSchema";

function validatePollRequestWithClientSchema(
  request: CreatePollRequest
): string | null {
  try {
    if (!request.startDate) {
      return "시작 날짜는 필수입니다.";
    }

    const startDateTime = request.startDate!;
    const startDate = startDateTime.toISOString().split("T")[0];
    const startTime =
      startDateTime.toISOString().split("T")[1]?.slice(0, 5) || "";

    const endDate = request.endDate?.toISOString().split("T")[0];
    const endTime = request.endDate
      ? request.endDate.toISOString().split("T")[1]?.slice(0, 5) || ""
      : "";

    const baseFormData = {
      category: request.category,
      title: request.title,
      description: request.description || "",
      thumbnailUrl: request.imageUrl || "",
      isUnlimited: request.isIndefinite ?? false,
      startDate,
      startTime,
      endDate: endDate || "",
      endTime: endTime || "",
    };

    if (isBinaryPollType(request.type)) {
      const result = binaryPollSchema.safeParse(baseFormData);
      if (!result.success) {
        return result.error.issues[0]?.message || "유효성 검사에 실패했습니다.";
      }
    } else if (request.type === PollType.MULTIPLE_CHOICE) {
      const multipleFormData = {
        ...baseFormData,
        maxSelections: request.maxSelections || 1,
        options: request.options.map((opt) => ({
          id: `temp-${opt.order}`,
          description: opt.description,
          imageUrl: opt.imageUrl,
          link: opt.link,
          order: opt.order,
          fileUploadId: opt.imageFileUploadId,
        })),
      };

      const result = multiplePollSchema.safeParse(multipleFormData);
      if (!result.success) {
        return result.error.issues[0]?.message || "유효성 검사에 실패했습니다.";
      }
    }

    return null;
  } catch {
    return "유효성 검사 중 오류가 발생했습니다.";
  }
}

export async function createPoll(
  request: CreatePollRequest
): Promise<CreatePollResponse> {
  try {
    const user = await requireAuth();

    const validationError = validatePollRequestWithClientSchema(request);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    const poll = await prisma.$transaction(async (tx) => {
      const createdPoll = await tx.poll.create({
        data: {
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          type: request.type,
          category: request.category,
          startDate: request.startDate,
          endDate: request.endDate,
          isIndefinite: request.isIndefinite ?? false,
          maxSelections: request.maxSelections,
          showResultsMode: request.showResultsMode ?? ResultMode.IMMEDIATE,
          isPublic: request.isPublic ?? true,
          creatorId: user.id,
        },
      });

      if (isBinaryPollType(request.type)) {
        const binaryOptions =
          BINARY_POLL_OPTIONS[request.type as keyof typeof BINARY_POLL_OPTIONS];
        await tx.pollOption.createMany({
          data: binaryOptions.map(
            (option: { description: string; order: number }) => ({
              pollId: createdPoll.id,
              description: option.description,
              order: option.order,
            })
          ),
        });
      } else {
        await tx.pollOption.createMany({
          data: request.options.map((option) => ({
            pollId: createdPoll.id,
            description: option.description,
            imageUrl: option.imageUrl,
            link: option.link,
            order: option.order,
          })),
        });
      }

      if (request.imageFileUploadId) {
        await tx.fileUpload.update({
          where: {
            id: request.imageFileUploadId,
            userId: user.id,
            status: FileStatus.TEMPORARY,
          },
          data: {
            status: FileStatus.CONFIRMED,
            confirmedAt: new Date(),
            relatedEntityType: RelatedEntityType.POLL,
            relatedEntityId: createdPoll.id,
          },
        });
      }

      if (!isBinaryPollType(request.type) && request.options) {
        const optionFileUploadIds = request.options
          .map((option) => option.imageFileUploadId)
          .filter(Boolean) as string[];

        if (optionFileUploadIds.length > 0) {
          await tx.fileUpload.updateMany({
            where: {
              id: { in: optionFileUploadIds },
              userId: user.id,
              status: FileStatus.TEMPORARY,
            },
            data: {
              status: FileStatus.CONFIRMED,
              confirmedAt: new Date(),
              relatedEntityType: RelatedEntityType.POLL_OPTION,
              relatedEntityId: createdPoll.id,
            },
          });
        }
      }

      return createdPoll;
    });

    return {
      data: {
        id: poll.id,
        title: poll.title,
        type: poll.type,
        category: poll.category,
        createdAt: poll.createdAt,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("폴 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
