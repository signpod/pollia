import {
  Poll,
  PollResult,
  VoteApiResponse,
  LikeApiResponse,
  BookmarkApiResponse,
} from "@/types/poll";
export const mockPollData: Poll = {
  id: "poll-001",
  title: "가장 좋아하는 프로그래밍 언어는?",
  description:
    "2024년 개발자들이 가장 선호하는 프로그래밍 언어를 투표해주세요.",
  category: {
    id: "category-001",
    name: "프로그래밍 언어",
  },
  startAt: "2024-01-01T00:00:00.000Z",
  endAt: "2024-12-31T23:59:59.000Z",
  type: "single",
  allowMultipleVote: false,
  imageUrl:
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
  isSponsored: false,
  isHidden: false,
  participantsCount: 1500,
  commentCount: 25,
  likeCount: 324,
  options: [
    {
      id: "option-1",
      title: "TypeScript",
      description: "타입 안정성과 개발자 경험이 뛰어난 JavaScript의 상위집합",
      imageUrl:
        "https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?w=200&h=150&fit=crop",
      voteCount: 650,
    },
    {
      id: "option-2",
      title: "Python",
      description: "간결하고 읽기 쉬운 문법으로 인기 있는 다목적 언어",
      imageUrl:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=200&h=150&fit=crop",
      voteCount: 420,
    },
    {
      id: "option-3",
      title: "JavaScript",
      description: "웹 개발의 핵심 언어로 프론트엔드와 백엔드 모두 활용",
      imageUrl:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=200&h=150&fit=crop",
      voteCount: 330,
    },
    {
      id: "option-4",
      title: "Go",
      description: "Google에서 개발한 빠르고 효율적인 시스템 프로그래밍 언어",
      imageUrl:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=200&h=150&fit=crop",
      voteCount: 100,
    },
  ],
  owner: {
    id: "user-123",
    name: "개발자박씨",
    profileImageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  createdAt: "2024-01-01T00:00:00.000Z",

  userVote: ["option-1"],
  isLiked: true,
  isBookmarked: false,
};
export const mockMultiplePollData: Poll = {
  ...mockPollData,
  id: "poll-002",
  title: "좋아하는 프론트엔드 프레임워크는? (복수 선택 가능)",
  description:
    "사용해본 경험이 있고 좋아하는 프론트엔드 프레임워크를 모두 선택해주세요.",
  category: {
    id: "category-002",
    name: "프론트엔드 프레임워크",
  },
  type: "multiple",
  allowMultipleVote: true,
  userVote: ["option-1", "option-3"],
  participantsCount: 850,
  likeCount: 180,
  options: [
    {
      id: "option-1",
      title: "React",
      description: "Facebook에서 개발한 컴포넌트 기반 라이브러리",
      imageUrl:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=150&fit=crop",
      voteCount: 480,
    },
    {
      id: "option-2",
      title: "Vue.js",
      description: "점진적으로 도입 가능한 프로그레시브 프레임워크",
      imageUrl:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=150&fit=crop",
      voteCount: 320,
    },
    {
      id: "option-3",
      title: "Next.js",
      description: "React 기반 풀스택 프레임워크",
      imageUrl:
        "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=200&h=150&fit=crop",
      voteCount: 380,
    },
    {
      id: "option-4",
      title: "Svelte",
      description: "컴파일 타임에 최적화되는 경량 프레임워크",
      imageUrl:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=150&fit=crop",
      voteCount: 150,
    },
  ],
};

export function calculatePollResults(poll: Poll): PollResult[] {
  return poll.options
    .map((option) => ({
      option,
      percentage:
        poll.participantsCount > 0
          ? Math.round((option.voteCount / poll.participantsCount) * 100 * 10) /
            10
          : 0,
      rank: 1,
      isUserVote: poll.userVote?.includes(option.id) || false,
    }))
    .sort((a, b) => b.option.voteCount - a.option.voteCount)
    .map((result, index) => ({ ...result, rank: index + 1 }));
}

export async function fetchPoll(pollId: string): Promise<Poll> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (pollId === "poll-002") {
    return mockMultiplePollData;
  }
  return mockPollData;
}

export async function voteOption(
  pollId: string,
  optionId: string
): Promise<VoteApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    success: true,
    message: "투표가 완료되었습니다.",
    updatedPoll: mockPollData,
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
    updatedPoll: mockPollData,
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
