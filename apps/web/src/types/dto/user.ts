export interface GetCurrentUserResponse {
  data: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface GetUserStatsResponse {
  data: {
    pollsCreated: number;
    votesCount: number;
    likesCount: number;
    bookmarksCount: number;
  };
}
