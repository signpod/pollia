import { PollType, PollCategory, ResultMode } from "@prisma/client";

export interface CreatePollRequest {
  title: string;
  description?: string;
  imageUrl?: string;
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
  content: string;
  description?: string;
  imageUrl?: string;
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
