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
  data: {
    id: string;
    title: string;
    type: PollType;
    category: PollCategory;
    createdAt: Date;
  };
}

export interface GetUserPollsResponse {
  data: Array<{
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
}

export interface GetBookmarkedPollsResponse {
  data: Array<{
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
}

export interface GetLikedPollsResponse {
  data: Array<{
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
}

export interface SubmitVoteRequest {
  pollId: string;
  optionId: string;
}

export interface SubmitVoteResponse {
  data: {
    id: string;
    pollId: string;
    optionId: string;
  };
}

export interface RemoveVoteRequest {
  pollId: string;
  optionId?: string; // 특정 옵션 투표 취소 시
}

export interface RemoveVoteResponse {
  data: {
    removed: boolean;
  };
}

// Multiple Choice Poll 전용 투표 타입들
export interface SubmitMultipleVoteRequest {
  pollId: string;
  optionId: string;
}

export interface SubmitMultipleVoteResponse {
  data: {
    id: string;
    pollId: string;
    optionId: string;
  };
}

export interface RemoveMultipleVoteRequest {
  pollId: string;
  optionId: string;
}

export interface RemoveMultipleVoteResponse {
  data: {
    pollId: string;
    optionId: string;
  };
}

export interface GetUserVoteStatusResponse {
  hasVoted: boolean;
  votes: Array<{
    id: string;
    option: {
      id: string;
      description: string;
      order: number;
    };
  }>;
}

export interface GetPollResultsResponse {
  id: string;
  title: string;
  description?: string | null;
  type: PollType;
  startDate?: Date;
  endDate?: Date | null;
  isIndefinite: boolean;
  maxSelections?: number | null;
  options: Array<{
    id: string;
    description: string;
    imageUrl?: string | null;
    order: number;
    _count: {
      votes: number;
    };
  }>;
  _count: {
    votes: number;
    participants: number;
  };
}

export interface GetPollResponse {
  data: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    type: PollType;
    category: PollCategory;
    startDate: Date;
    endDate?: Date | null;
    isIndefinite: boolean;
    maxSelections?: number | null;
    showResultsMode: ResultMode;
    isPublic: boolean;
    creator: {
      id: string;
      name: string;
    };
    options: Array<{
      id: string;
      description: string;
      imageUrl?: string | null;
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
