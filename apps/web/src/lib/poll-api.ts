import {
  Poll,
  VoteApiResponse,
  LikeApiResponse,
  BookmarkApiResponse,
  PollResultOptionApiResponse,
  VoteRequest,
  VoteResponse,
  LikeResponse,
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
): Promise<PollResultOptionApiResponse> {
  try {
    const apiResponse = await httpClient.get<PollResultOptionApiResponse>(
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
  try {
    const requestBody: VoteRequest = {
      optionId,
    };

    await httpClient.post<VoteResponse>(`polls/${pollId}/vote`, requestBody);

    return {
      success: true,
      message: "투표가 완료되었습니다.",
    };
  } catch (error) {
    console.error("투표 처리 실패:", error);
    return {
      success: false,
      message: "투표 처리 중 오류가 발생했습니다.",
    };
  }
}

export async function unvoteOption(
  _pollId: string,
  _optionId: string
): Promise<VoteApiResponse> {
  // TODO: 투표 취소 API가 준비되면 실제 구현으로 교체
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    success: true,
    message: "투표가 취소되었습니다.",
  };
}

export async function likePoll(pollId: string): Promise<LikeApiResponse> {
  try {
    await httpClient.post<LikeResponse>(`polls/${pollId}/like`);

    return {
      success: true,
      message: "좋아요가 추가되었습니다.",
      likeCount: 0, // API에서 likeCount를 제공하지 않으므로 임시값
      isLiked: true,
    };
  } catch (error) {
    console.error("좋아요 처리 실패:", error);
    return {
      success: false,
      message: "좋아요 처리 중 오류가 발생했습니다.",
      likeCount: 0,
      isLiked: false,
    };
  }
}

export async function unlikePoll(_pollId: string): Promise<LikeApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    message: "좋아요가 취소되었습니다.",
    likeCount: 323,
    isLiked: false,
  };
}

export async function bookmarkPoll(
  _pollId: string
): Promise<BookmarkApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    message: "북마크가 추가되었습니다.",
    isBookmarked: true,
  };
}

export async function unbookmarkPoll(
  _pollId: string
): Promise<BookmarkApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    message: "북마크가 취소되었습니다.",
    isBookmarked: false,
  };
}
