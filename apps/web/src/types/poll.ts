export interface Poll {
  id: string;
  title: string;
  description: string;
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

  userVote?: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface PollOption {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  voteCount: number;
}

export interface PollOwner {
  id: string;
  name: string;
  profileImageUrl?: string;
}

export interface PollResult {
  option: PollOption;
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
