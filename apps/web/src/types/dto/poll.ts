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
    startDate: Date;
    endDate: Date | null;
    isIndefinite: boolean;
    createdAt: Date;
    _count: {
      votes: number;
      likes: number;
    };
  }>;
  error?: string;
}

export interface SubmitVoteRequest {
  pollId: string;
  optionId: string;
}

export interface SubmitVoteResponse {
  success: boolean;
  data?: {
    id: string;
    pollId: string;
    optionId: string;
  };
  error?: string;
}

export interface RemoveVoteRequest {
  pollId: string;
  optionId?: string; // 특정 옵션 투표 취소 시
}

export interface RemoveVoteResponse {
  success: boolean;
  data?: {
    removed: boolean;
  };
  error?: string;
}

// Multiple Choice Poll 전용 투표 타입들
export interface SubmitMultipleVoteRequest {
  pollId: string;
  optionId: string;
}

export interface SubmitMultipleVoteResponse {
  success: boolean;
  data?: {
    id: string;
    pollId: string;
    optionId: string;
  };
  error?: string;
}

export interface RemoveMultipleVoteRequest {
  pollId: string;
  optionId: string;
}

export interface RemoveMultipleVoteResponse {
  success: boolean;
  data?: {
    pollId: string;
    optionId: string;
  };
  error?: string;
}

export interface GetUserVoteStatusResponse {
  success: boolean;
  data?: {
    hasVoted: boolean;
    votes: Array<{
      id: string;
      option: {
        id: string;
        description: string;
        order: number;
      };
    }>;
  };
  error?: string;
}

export interface GetPollResultsResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    description?: string;
    type: PollType;
    startDate?: Date;
    endDate?: Date;
    isIndefinite: boolean;
    maxSelections?: number;
    options: Array<{
      id: string;
      description: string;
      imageUrl?: string;
      order: number;
      _count: {
        votes: number;
      };
    }>;
    _count: {
      votes: number;
      participants: number;
    };
  };
  error?: string;
}

export interface GetPollResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    type: PollType;
    category: PollCategory;
    startDate: Date;
    endDate?: Date;
    isIndefinite: boolean;
    maxSelections?: number;
    showResultsMode: ResultMode;
    isPublic: boolean;
    creator: {
      id: string;
      name: string;
    };
    options: Array<{
      id: string;
      description: string;
      imageUrl?: string;
      _count: {
        votes: number;
      };
    }>;
    _count: {
      votes: number;
      likes: number;
      bookmarks: number;
    };
    userBookmarkStatus?: {
      isBookmarked: boolean;
    };
    userLikeStatus?: {
      isLiked: boolean;
    };
  };
  error?: string;
}

export interface GetPollUserStatusResponse {
  userId: string;
  pollId: string;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface GetBulkPollUserStatusResponse {
  userId: string;
  statusMap: Record<
    string,
    {
      isLiked: boolean;
      isBookmarked: boolean;
    }
  >;
}

export interface ToggleBookmarkPollResponse {
  isBookmarked: boolean;
  message: string;
}

export interface ToggleLikePollResponse {
  isLiked: boolean;
  message: string;
}
