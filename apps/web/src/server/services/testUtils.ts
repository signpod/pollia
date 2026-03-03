import type { Action, ActionOption, FileUpload, Mission, MissionCompletion } from "@prisma/client";
import { FileStatus, MissionCategory, MissionType } from "@prisma/client";

export const createMockMission = (overrides: Partial<Mission> = {}): Mission => ({
  id: "mission1",
  title: "미션",
  choseong: "",
  description: null,
  target: null,
  imageUrl: null,
  brandLogoUrl: null,
  estimatedMinutes: null,
  startDate: null,
  deadline: null,
  isActive: true,
  allowGuestResponse: false,
  allowMultipleResponses: false,
  maxParticipants: null,
  type: MissionType.GENERAL,
  category: MissionCategory.EVENT,
  password: null,
  likesCount: 0,
  creatorId: "user1",
  rewardId: null,
  imageFileUploadId: null,
  brandLogoFileUploadId: null,
  eventId: null,
  entryActionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
  editorDraft: overrides.editorDraft ?? null,
});

export const createMockAction = (overrides: Partial<Action> = {}): Action => ({
  id: "action1",
  missionId: "mission1",
  title: "액션",
  description: null,
  imageUrl: null,
  type: "MULTIPLE_CHOICE",
  order: 0,
  maxSelections: null,
  isRequired: true,
  hasOther: false,
  imageFileUploadId: null,
  nextActionId: null,
  nextCompletionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

type ActionWithOptions = Action & { options: ActionOption[] };

export const createMockActionOption = (overrides: Partial<ActionOption> = {}): ActionOption => ({
  id: "option1",
  actionId: "action1",
  title: "옵션",
  description: null,
  imageUrl: null,
  fileUploadId: null,
  order: 0,
  nextActionId: null,
  nextCompletionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockActionWithOptions = (
  overrides: Partial<Action> = {},
  options: Partial<ActionOption>[] = [],
): ActionWithOptions => ({
  ...createMockAction(overrides),
  options: options.map(opt => createMockActionOption(opt)),
});

/**
 * 서비스 에러와 cause 코드를 함께 검증하는 헬퍼 함수
 */
export async function expectServiceErrorWithCause(
  promise: Promise<unknown>,
  expectedMessage: string,
  expectedCause: number,
): Promise<void> {
  await expect(promise).rejects.toThrow(expectedMessage);

  try {
    await promise;
  } catch (error) {
    expect(error instanceof Error && error.cause).toBe(expectedCause);
  }
}

/**
 * request 기반으로 mock action 응답을 생성하는 헬퍼 함수
 * 테스트에서 request의 값이 응답에 반영되는 것을 시뮬레이션
 */
export const createMockActionResponse = (
  request: {
    title?: string;
    description?: string | null;
    imageUrl?: string | null;
    order: number;
    maxSelections?: number | null;
    isRequired: boolean;
  },
  type: Action["type"],
  overrides: Partial<Action> = {},
): Action => ({
  id: "action1",
  missionId: "mission1",
  title: request.title ?? "액션",
  description: request.description ?? null,
  imageUrl: request.imageUrl ?? null,
  type,
  order: request.order,
  maxSelections: request.maxSelections ?? null,
  isRequired: request.isRequired,
  hasOther: false,
  imageFileUploadId: null,
  nextActionId: null,
  nextCompletionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockFileUpload = (overrides: Partial<FileUpload> = {}): FileUpload => ({
  id: "file1",
  userId: "user1",
  originalFileName: "test.jpg",
  filePath: "user1/123456789.jpg",
  publicUrl: "https://example.com/user1/123456789.jpg",
  fileSize: 1024,
  mimeType: "image/jpeg",
  bucket: "pollia-images",
  status: FileStatus.TEMPORARY,
  actionAnswerId: null,
  confirmedAt: null,
  createdAt: new Date(),
  ...overrides,
});

type MissionCompletionWithRelations = MissionCompletion & {
  imageFileUpload: { id: string; publicUrl: string } | null;
  mission: { id: string; creatorId: string };
};

export const createMockMissionCompletion = (
  overrides: Partial<MissionCompletionWithRelations> = {},
): MissionCompletionWithRelations => ({
  id: "completion1",
  title: "미션 완료!",
  description: "축하합니다!",
  imageUrl: null,
  imageFileUploadId: null,
  links: null,
  missionId: "mission1",
  createdAt: new Date(),
  updatedAt: new Date(),
  imageFileUpload: null,
  mission: {
    id: "mission1",
    creatorId: "user1",
  },
  ...overrides,
});
