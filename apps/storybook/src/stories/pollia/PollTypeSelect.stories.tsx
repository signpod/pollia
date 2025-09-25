import { Meta, StoryObj } from "@storybook/nextjs";
import PollTypeSelect from "@web/components/poll/PollTypeSelect";
import { useState } from "react";

const meta: Meta<typeof PollTypeSelect> = {
  title: "Pollia/PollTypeSelect",
  component: PollTypeSelect,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    selectedType: {
      control: { type: "select" },
      options: ["ox", "hobullho", "multiple", undefined],
      description: "현재 선택된 투표 유형",
    },
    onTypeChange: {
      action: "typeChanged",
      description: "투표 유형이 변경될 때 호출되는 콜백",
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

// 인터랙티브 선택 컴포넌트
export const Interactive: Story = {
  render: () => {
    const [selectedType, setSelectedType] = useState<
      "ox" | "hobullho" | "multiple"
    >();

    return (
      <div className="max-w-md space-y-4">
        <PollTypeSelect
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        {selectedType && (
          <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
            <p className="text-sm font-medium text-violet-900">
              선택된 투표 유형:{" "}
              <span className="font-bold">{selectedType}</span>
            </p>
            <p className="text-xs text-violet-600 mt-1">
              {selectedType === "ox" && "O/X (예/아니오) 투표"}
              {selectedType === "hobullho" && "호불호 (좋아요/싫어요) 투표"}
              {selectedType === "multiple" && "객관식 (여러 선택지) 투표"}
            </p>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "실제로 클릭해서 투표 유형을 선택할 수 있는 인터랙티브 예시입니다. 선택된 유형이 시각적으로 강조됩니다.",
      },
    },
  },
};

// O/X 선택된 상태
export const WithOxSelected: Story = {
  args: {
    selectedType: "ox",
  },
  parameters: {
    docs: {
      description: {
        story: "O/X 투표 유형이 선택된 상태입니다.",
      },
    },
  },
};

// 호불호 선택된 상태
export const WithHobullhoSelected: Story = {
  args: {
    selectedType: "hobullho",
  },
  parameters: {
    docs: {
      description: {
        story: "호불호 투표 유형이 선택된 상태입니다.",
      },
    },
  },
};

// 객관식 선택된 상태
export const WithMultipleSelected: Story = {
  args: {
    selectedType: "multiple",
  },
  parameters: {
    docs: {
      description: {
        story: "객관식 투표 유형이 선택된 상태입니다.",
      },
    },
  },
};

// 선택되지 않은 상태
export const NoSelection: Story = {
  args: {
    selectedType: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: "아무것도 선택되지 않은 초기 상태입니다.",
      },
    },
  },
};

// 커스텀 스타일링
export const CustomStyling: Story = {
  args: {
    selectedType: "ox",
    className: "bg-gray-50 p-4 rounded-lg",
  },
  parameters: {
    docs: {
      description: {
        story: "className prop을 사용하여 커스텀 스타일을 적용한 예시입니다.",
      },
    },
  },
};

// 폼에서 사용하는 예시
export const InForm: Story = {
  render: () => {
    const [selectedType, setSelectedType] = useState<
      "ox" | "hobullho" | "multiple"
    >();
    const [isValid, setIsValid] = useState(false);

    const handleTypeChange = (type: "ox" | "hobullho" | "multiple") => {
      setSelectedType(type);
      setIsValid(true);
    };

    return (
      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            투표 유형을 선택하세요 *
          </label>
          <PollTypeSelect
            selectedType={selectedType}
            onTypeChange={handleTypeChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            className="px-4 py-2 bg-violet-600 text-white rounded-lg disabled:bg-gray-300"
            disabled={!isValid}
          >
            다음 단계
          </button>
          <span className="text-xs text-zinc-500">
            {isValid ? "✓ 선택 완료" : "투표 유형을 선택해주세요"}
          </span>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "실제 폼에서 사용할 때의 예시입니다. 선택이 완료되면 다음 단계 버튼이 활성화됩니다.",
      },
    },
  },
};
