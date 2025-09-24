import { ResultMode, PollType, PollCategory } from "@prisma/client";

export interface CreatePollRequest {
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string; // 폴 대표 이미지의 fileUploadId
  type: PollType;
  category: PollCategory;

  startDate: Date;
  endDate?: Date;
  isIndefinite?: boolean;

  maxSelections?: number;
  showResultsMode?: ResultMode;
  isPublic?: boolean;

  options: CreatePollOptionRequest[];
}

export interface CreatePollOptionRequest {
  description: string;
  imageUrl?: string;
  imageFileUploadId?: string; // 옵션 이미지의 fileUploadId
  link?: string;
  order: number;
}

export interface CreatePollResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    type: PollType;
    category: PollCategory;
    createdAt: Date;
  };
  error?: string;
}

export interface GetUserPollsResponse {
  success: boolean;
  data?: Array<{
    id: string;
    title: string;
    type: PollType;
    category: PollCategory;
    createdAt: Date;
    _count: {
      votes: number;
      likes: number;
    };
  }>;
  error?: string;
}
