import { PollType, PollCategory } from "@prisma/client";

export type BinaryPollType = "YES_NO" | "LIKE_DISLIKE";
export type MultiplePollType = "MULTIPLE_CHOICE";
export { PollType, PollCategory };

export type PollCandidate = {
  id: string;
  name: string;
  imageUrl?: string;
  link?: string;
};
