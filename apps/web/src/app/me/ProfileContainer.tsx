import { ErrorBoundary } from "react-error-boundary";

import {
  DraftFilterType,
  SortOrderType,
  meDraftFilterAtom,
  meSearchQueryAtom,
  surveySortOrderAtom,
} from "@/atoms/me/searchAtoms";
import { BaseSearchBar } from "@/components/common/BaseSearchBar";
import { useSearchQuery } from "@/hooks/common/useSearchQuery";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tab,
  Typo,
  useTab,
} from "@repo/ui/components";
import { useAtom } from "jotai";
import { UserInfo } from "./UserInfo";
import { ContentList } from "./ui";
import { UserSurveyDataContainer } from "./ui/UserSurveyDataContainer";
import { UserSurveyQuestionDataContainer } from "./ui/UserSurveyQuestionDataContainer";

export function ProfileContainer() {
  return (
    <>
      <ErrorBoundary FallbackComponent={UserInfoErrorFallback}>
        <UserInfoSection />
        <Tab.Root initialTab="userSurveys">
          <ProfileTabsContent />
        </Tab.Root>
      </ErrorBoundary>
    </>
  );
}

export type ProfileTab = "userSurveys" | "userQuestions";

const PROFILE_TABS: { value: ProfileTab; label: string }[] = [
  { value: "userSurveys", label: "내가 만든 설문" },
  { value: "userQuestions", label: "내가 만든 질문" },
] as const;

function ProfileTabs() {
  return (
    <Tab.List>
      {PROFILE_TABS.map(item => (
        <Tab.Item key={item.value} value={item.value}>
          <Typo.SubTitle size="large">{item.label}</Typo.SubTitle>
        </Tab.Item>
      ))}
    </Tab.List>
  );
}

function UserInfoSection() {
  const me = useCurrentUser();
  const { name } = me.data ?? { name: "" };

  return <UserInfo name={name} />;
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

const DRAFT_FILTER_OPTIONS: { value: DraftFilterType; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "used", label: "사용" },
  { value: "unused", label: "미사용" },
];

const SORT_ORDER_OPTIONS: { value: SortOrderType; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
];

function ProfileTabsContent() {
  const { activeTab } = useTab();
  const { searchQuery, handleChange } = useSearchQuery(meSearchQueryAtom);
  const [draftFilter, setDraftFilter] = useAtom(meDraftFilterAtom);
  const [sortOrder, setSortOrder] = useAtom(surveySortOrderAtom);

  const DataContainer =
    activeTab === "userSurveys" ? UserSurveyDataContainer : UserSurveyQuestionDataContainer;

  const baseHref = activeTab === "userSurveys" ? "/survey" : "/survey/question";
  const placeholder =
    activeTab === "userSurveys" ? "설문 제목을 검색해주세요" : "질문 제목을 검색해주세요";

  const showDraftFilter = activeTab === "userQuestions";

  return (
    <div className="w-full flex gap-4 flex-col">
      <ProfileTabs />
      <div className="flex gap-2 w-full px-5">
        <BaseSearchBar
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleChange}
          containerClassName="w-full flex-1"
        />
        <Select value={sortOrder} onValueChange={value => setSortOrder(value as SortOrderType)}>
          <SelectTrigger className="w-[120px]" aria-label="정렬 순서">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_ORDER_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showDraftFilter && (
          <Select
            value={draftFilter}
            onValueChange={value => setDraftFilter(value as DraftFilterType)}
          >
            <SelectTrigger className="w-[120px]" aria-label="사용 상태 필터">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DRAFT_FILTER_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="space-y-6">
        <ErrorBoundary FallbackComponent={PollListErrorFallback}>
          <DataContainer>
            {({ data, hasNextPage, fetchNextPage, isFetchingNextPage }) => (
              <ContentList
                items={data}
                baseHref={baseHref}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                searchQuery={searchQuery}
                draftFilter={draftFilter}
                sortOrder={sortOrder}
              />
            )}
          </DataContainer>
        </ErrorBoundary>
      </div>
    </div>
  );
}
