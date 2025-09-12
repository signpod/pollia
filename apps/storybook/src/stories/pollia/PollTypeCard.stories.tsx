import { Meta, StoryObj } from "@storybook/nextjs";
import PollTypeCard from "web/src/components/poll/PollTypeCard";

const meta: Meta<typeof PollTypeCard> = {
  title: "Pollia/PollTypeCard",
  component: PollTypeCard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["ox", "hobullho", "multiple"],
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
    type: "ox",
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
    type: "hobullho",
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
    type: "multiple",
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
        <h3 className="text-sm font-medium text-zinc-600 mb-2">O/X</h3>
        <PollTypeCard type="ox" selected={false} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-zinc-600 mb-2">호불호</h3>
        <PollTypeCard type="hobullho" selected={false} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-zinc-600 mb-2">객관식</h3>
        <PollTypeCard type="multiple" selected={false} />
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
    type: "ox",
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
