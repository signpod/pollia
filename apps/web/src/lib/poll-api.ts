import {
  Poll,
  VoteApiResponse,
  LikeApiResponse,
  BookmarkApiResponse,
  PollResultOptionApiResponse,
} from "@/types/poll";
import { createHttpClient } from "@/lib/http/client";

const httpClient = createHttpClient();

export async function fetchPoll(pollId: string): Promise<Poll> {
  try {
    const apiResponse = await httpClient.get<Poll>(`polls/${pollId}`);
    return apiResponse;
  } catch (error) {
    console.error("Poll 조회 실패:", error);
    throw new Error("Poll을 불러올 수 없습니다.");
  }
}

export async function fetchPollResults(
  pollId: string
): Promise<PollResultOptionApiResponse[]> {
  try {
    const apiResponse = await httpClient.get<PollResultOptionApiResponse[]>(
      `polls/${pollId}/results`
    );
    return apiResponse;
  } catch (error) {
    console.error("투표 결과 조회 실패:", error);
    throw new Error("투표 결과를 불러올 수 없습니다.");
  }
}

export async function voteOption(
  pollId: string,
  optionId: string
): Promise<VoteApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    success: true,
    message: "투표가 완료되었습니다.",
    // TODO: 실제 API 호출로 업데이트된 Poll 데이터 반환 필요
  };
}

export async function unvoteOption(
  pollId: string,
  optionId: string
): Promise<VoteApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    success: true,
    message: "투표가 취소되었습니다.",
    // TODO: 실제 API 호출로 업데이트된 Poll 데이터 반환 필요
  };
}

export async function likePoll(pollId: string): Promise<LikeApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    message: "좋아요가 추가되었습니다.",
    likeCount: 325,
    isLiked: true,
  };
}

export async function unlikePoll(pollId: string): Promise<LikeApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    message: "좋아요가 취소되었습니다.",
    likeCount: 323,
    isLiked: false,
  };
}

export async function bookmarkPoll(
  pollId: string
): Promise<BookmarkApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    message: "북마크가 추가되었습니다.",
    isBookmarked: true,
  };
}

export async function unbookmarkPoll(
  pollId: string
): Promise<BookmarkApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    message: "북마크가 취소되었습니다.",
    isBookmarked: false,
  };
}
