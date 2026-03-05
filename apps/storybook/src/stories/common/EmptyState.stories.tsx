import { EmptyState } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Inbox, Search } from "lucide-react";
import Link from "next/link";

const meta: Meta<typeof EmptyState> = {
  title: "Common/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# EmptyState

콘텐츠가 없을 때 보여주는 빈 상태 컴포넌트입니다.

## Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| \`title\` | string | O | 메인 메시지 (20px bold) |
| \`icon\` | ReactNode | X | 상단 아이콘 (직접 렌더링) |
| \`description\` | ReactNode | X | 보조 설명 (16px medium, 멀티라인 지원) |
| \`action\` | ReactNode | X | CTA 버튼 등 액션 영역 (full-width) |
| \`className\` | string | X | 추가 CSS 클래스 |

## 사용법

\`\`\`tsx
import { EmptyState } from "@repo/ui/components";

<EmptyState
  icon={<PollPollE className="size-30 text-zinc-200" />}
  title="참여중인 콘텐츠가 없어요"
  description={
    <>
      <p>아래 버튼을 눌러</p>
      <p>새로운 콘텐츠를 구경해보세요</p>
    </>
  }
  action={<Button>구경하러 가기</Button>}
/>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: { type: "text" },
      description: "메인 메시지",
    },
    className: {
      control: { type: "text" },
      description: "추가 CSS 클래스",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <Inbox className="size-30 text-zinc-300" />,
    title: "참여중인 콘텐츠가 없어요",
    description: (
      <>
        <p>아래 버튼을 눌러</p>
        <p>새로운 콘텐츠를 구경해보세요 🥳</p>
      </>
    ),
    action: (
      <Link
        href="/"
        className="flex h-12 w-full items-center justify-center rounded-lg bg-zinc-800 text-base font-bold text-white"
      >
        구경하러 가기
      </Link>
    ),
  },
};

export const Variants: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">
          아이콘 + 타이틀 + 설명 + 액션 (마이페이지)
        </h3>
        <EmptyState
          icon={<Inbox className="size-30 text-zinc-300" />}
          title="참여중인 콘텐츠가 없어요"
          description={
            <>
              <p>아래 버튼을 눌러</p>
              <p>새로운 콘텐츠를 구경해보세요 🥳</p>
            </>
          }
          action={
            <Link
              href="/"
              className="flex h-12 w-full items-center justify-center rounded-lg bg-zinc-800 text-base font-bold text-white"
            >
              구경하러 가기
            </Link>
          }
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">
          아이콘 + 타이틀 + 설명 (메인페이지)
        </h3>
        <EmptyState
          icon={<Search className="size-30 text-zinc-300" />}
          title="진행 중인 컨텐츠가 없어요"
          description={
            <>
              <p>아래 버튼을 눌러</p>
              <p>새로운 콘텐츠를 구경해보세요 🥳</p>
            </>
          }
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">아이콘 + 타이틀</h3>
        <EmptyState icon={<Inbox className="size-30 text-zinc-300" />} title="검색 결과가 없어요" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">타이틀만</h3>
        <EmptyState title="데이터가 없습니다" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "아이콘, 설명, 액션 버튼의 조합으로 다양한 빈 상태를 표현할 수 있습니다.",
      },
    },
  },
};
