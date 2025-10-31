import { PollType } from "@prisma/client";
import { Meta, StoryObj } from "@storybook/nextjs";
import PollTypeCard from "@web/components/poll/PollTypeCard";

const meta: Meta<typeof PollTypeCard> = {
  title: "Pollia/PollTypeCard",
  component: PollTypeCard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: [PollType.YES_NO, PollType.LIKE_DISLIKE, PollType.MULTIPLE_CHOICE],
      description: "투표 유형을 선택하세요",
    },
    className: {
      control: { type: "text" },
      description: "추가 CSS 클래스",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// O/X 투표 유형
export const Ox: Story = {
  args: {
    type: PollType.YES_NO,
  },
  parameters: {
    docs: {
      description: {
        story: "O/X (예/아니오) 투표 유형을 표시합니다. 원형 아이콘과 X 아이콘으로 구성됩니다.",
      },
    },
  },
};

// 호불호 투표 유형
export const Hobullho: Story = {
  args: {
    type: PollType.LIKE_DISLIKE,
  },
  parameters: {
    docs: {
      description: {
        story: "호불호 (좋아요/싫어요) 투표 유형을 표시합니다. 엄지척 아이콘으로 구성됩니다.",
      },
    },
  },
};

// 객관식 투표 유형
export const Multiple: Story = {
  args: {
    type: PollType.MULTIPLE_CHOICE,
  },
  parameters: {
    docs: {
      description: {
        story: "객관식 (여러 선택지) 투표 유형을 표시합니다. A, B, C 선택지로 구성됩니다.",
      },
    },
  },
};

// 모든 유형을 한 번에 보기
export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-600">O/X</h3>
        <PollTypeCard type={PollType.YES_NO} selected={false} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-600">호불호</h3>
        <PollTypeCard type={PollType.LIKE_DISLIKE} selected={false} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-600">객관식</h3>
        <PollTypeCard type={PollType.MULTIPLE_CHOICE} selected={false} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "세 가지 투표 유형을 모두 한 번에 확인할 수 있습니다.",
      },
    },
  },
};

// 커스텀 스타일링
export const CustomStyling: Story = {
  args: {
    type: PollType.YES_NO,
    className: "bg-blue-50 ring-blue-200",
  },
  parameters: {
    docs: {
      description: {
        story: "className prop을 사용하여 커스텀 스타일을 적용할 수 있습니다.",
      },
    },
  },
};
