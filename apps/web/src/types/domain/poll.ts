import { PollType, PollCategory } from "@prisma/client";

export type BinaryPollType = "YES_NO" | "LIKE_DISLIKE";
export type MultiplePollType = "MULTIPLE_CHOICE";
export { PollType, PollCategory };

export type PollOption = {
  id: string;
  description: string;
  imageUrl?: string;
  link?: string;
  order: number;
  fileUploadId?: string;
};
