export interface Poll {
  id: string;
  title: string;
  description: string;
  categories: string; // API 응답에 맞게 문자열로 변경
  startAt: string;
  endAt: string;
  type: string;
  allowMultipleVote: boolean;
  imageUrl?: string;
  isSponsored: boolean;
  isHidden: boolean;
  participantsCount: number;
  commentCount: number;
  likeCount: number;
  options: PollOption[];
  owner: PollOwner;
  createdAt: string;

  hasLiked: boolean;
  hasBookmarked: boolean;
  userVotedOptionIds: string[];
}

export interface PollOption {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  externalLinkTitle?: string;
  externalLinkUrl?: string;
}

export interface PollOwner {
  id: string;
  name: string;
  profileImageUrl?: string;
}

export interface PollResult {
  option: PollOption & { voteCount: number }; // voteCount 포함된 옵션
  percentage: number;
  rank: number;
  isUserVote?: boolean;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export interface VoteAction {
  type: "VOTE" | "UNVOTE";
  optionId: string;
  pollId: string;
}

export interface LikeAction {
  type: "LIKE" | "UNLIKE";
  pollId: string;
}

export interface BookmarkAction {
  type: "BOOKMARK" | "UNBOOKMARK";
  pollId: string;
}
export interface PollApiResponse {
  data: Poll;
  success: boolean;
  message?: string;
}

export interface VoteApiRequest {
  pollId: string;
  optionId: string;
}

export interface VoteApiResponse {
  success: boolean;
  message?: string;
  updatedPoll?: Poll;
}

export interface LikeApiRequest {
  pollId: string;
}

export interface LikeApiResponse {
  success: boolean;
  message?: string;
  likeCount: number;
  isLiked: boolean;
}

export interface BookmarkApiRequest {
  pollId: string;
}

export interface BookmarkApiResponse {
  success: boolean;
  message?: string;
  isBookmarked: boolean;
}

export interface Category {
  id: string;
  name: string;
}

interface PollResultOption {
  id: string;
  pollId: string;
  title: string;
  description: string;
  imageUrl: string;
  externalLinkTitle: string | null;
  externalLinkUrl: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    votes: number;
  };
  voteCount: number;
}

export type PollResultOptionApiResponse = PollResultOption[];
