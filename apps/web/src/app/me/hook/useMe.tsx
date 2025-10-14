import {
  useBookmarkedPolls,
  useLikedPolls,
  useUserPolls,
} from "@/hooks/poll/usePoll";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { GetUserPollsResponse } from "@/types/dto";

const PREVIEW_VIEW_COUNT = 5;

export function useMe() {
  const me = useCurrentUser();
  const userPolls = useUserPolls();
  const userBookmarks = useBookmarkedPolls();
  const userLikes = useLikedPolls();

  const polls = [
    {
      title: "내가 만든 투표",
      polls: getPreviewPolls(userPolls.data?.data),
      useActiveIcon: true,
    },
    {
      title: "북마크",
      polls: getPreviewPolls(userBookmarks.data?.data),
      useActiveIcon: false,
    },
    {
      title: "좋아요",
      polls: getPreviewPolls(userLikes.data?.data),
      useActiveIcon: false,
    },
  ];

  return {
    me: me.data,
    polls,
  };
}

function getPreviewPolls(polls: GetUserPollsResponse["data"]) {
  return polls?.slice(0, PREVIEW_VIEW_COUNT);
}
