export interface GetCurrentUserResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
}

export interface GetUserStatsResponse {
  success: boolean;
  data?: {
    pollsCreated: number;
    votesCount: number;
    likesCount: number;
    bookmarksCount: number;
  };
  error?: string;
}
