import { ErrorBoundary } from "react-error-boundary";
import {
  useBookmarkedPolls,
  useLikedPolls,
  useUserPolls,
} from "@/hooks/poll/usePoll";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { PollList } from "./ui";
import { UserInfo } from "./UserInfo";
import { Button, Typo } from "@repo/ui/components";

const PREVIEW_VIEW_COUNT = 5;

export function ProfileContainer() {
  return (
    <>
      <ErrorBoundary FallbackComponent={UserInfoErrorFallback}>
        <UserInfoSection />
      </ErrorBoundary>
      <div className="space-y-6">
        <ErrorBoundary FallbackComponent={PollListErrorFallback}>
          <UserPollsSection />
        </ErrorBoundary>
        <ErrorBoundary FallbackComponent={PollListErrorFallback}>
          <BookmarkedPollsSection />
        </ErrorBoundary>
        <ErrorBoundary FallbackComponent={PollListErrorFallback}>
          <LikedPollsSection />
        </ErrorBoundary>
      </div>
    </>
  );
}

function UserInfoSection() {
  const me = useCurrentUser();
  return <UserInfo user={me.data!} />;
}

function UserPollsSection() {
  const userPolls = useUserPolls();
  const polls = userPolls.data?.data?.slice(0, PREVIEW_VIEW_COUNT);

  return <PollList title="내가 만든 투표" polls={polls} useActiveIcon/>;
}

function BookmarkedPollsSection() {
  const userBookmarks = useBookmarkedPolls();
  const polls = userBookmarks.data?.data?.slice(0, PREVIEW_VIEW_COUNT);

  return <PollList title="북마크" polls={polls}/>;
}

function LikedPollsSection() {
  const userLikes = useLikedPolls();
  const polls = userLikes.data?.data?.slice(0, PREVIEW_VIEW_COUNT);

  return <PollList title="좋아요" polls={polls} />;
}

//TODO: 에러 핸들링 구현
function ErrorFallback({
  title,
  error,
  resetErrorBoundary,
}: {
  title: string;
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="bg-white rounded-lg p-6 mx-5">
      <div className="text-center space-y-4">
        <Typo.Body size="large" className="text-red-600">
          {title}
        </Typo.Body>
        <Typo.Body size="medium" className="text-gray-600">
          {error.message || "잠시 후 다시 시도해주세요."}
        </Typo.Body>
        <Button onClick={resetErrorBoundary} variant="primary">
          다시 시도
        </Button>
      </div>
    </div>
  );
}

function UserInfoErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <ErrorFallback
      title="사용자 정보를 불러오는 중 오류가 발생했습니다."
      error={error}
      resetErrorBoundary={resetErrorBoundary}
    />
  );
}

function PollListErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <ErrorFallback
      title="투표 목록 데이터를 불러오는 중 오류가 발생했습니다."
      error={error}
      resetErrorBoundary={resetErrorBoundary}
    />
  );
}
