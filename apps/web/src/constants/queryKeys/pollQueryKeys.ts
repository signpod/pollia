export const pollQueryKeys = {
  poll: (pollId: string) => ["poll", pollId] as const,
  pollResults: (pollId: string) => ["poll-results", pollId] as const,
  userVoteStatus: (pollId: string) => ["user-vote-status", pollId] as const,
  userPolls: (userId?: string) =>
    userId ? (["user-polls", userId] as const) : (["user-polls"] as const),
  userPollStatus: (pollId: string) => ["user-poll-status", pollId] as const,
  bookmarkedPolls: (userId?: string) =>
    userId ? (["bookmarked-polls", userId] as const) : (["bookmarked-polls"] as const),
  likedPolls: (userId?: string) =>
    userId ? (["liked-polls", userId] as const) : (["liked-polls"] as const),
  all: () => ["poll"] as const,
} as const;

export type PollQueryKeys = typeof pollQueryKeys;
