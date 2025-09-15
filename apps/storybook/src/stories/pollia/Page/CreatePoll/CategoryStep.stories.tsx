import { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import CategoryStep from "web/src/app/create/CategoryStep";
import { BottomCTALayout } from "@repo/ui/components";

const meta: Meta<typeof CategoryStep> = {
  title: "Pollia/Page/CreatePoll/CategoryStep",
  component: CategoryStep,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# CategoryStep

투표 생성 시 투표 유형을 선택하는 단계의 페이지 컴포넌트입니다.

## 특징

- PollTypeSelect 컴포넌트를 활용한 투표 유형 선택
- BottomCTALayout을 사용한 하단 플로팅 CTA
- 로직 주입 방식으로 View와 비즈니스 로직 분리
- 반응형 디자인 지원

## Props

| Prop | Type | Description |
|------|------|-------------|
| \`selectedType\` | \`PollType\` | 현재 선택된 투표 유형 |
| \`onTypeChange\` | \`(type: PollType) => void\` | 투표 유형 변경 콜백 |
| \`onNext\` | \`() => void\` | 다음 단계 진행 콜백 |
| \`onBack\` | \`() => void\` | 이전 단계로 이동 콜백 |
| \`isNextEnabled\` | \`boolean\` | 다음 버튼 활성화 여부 |
        `,
      },
    },
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
    onNext: {
      action: "nextClicked",
      description: "다음 버튼 클릭 시 호출되는 콜백",
    },
    onBack: {
      action: "backClicked",
      description: "뒤로가기 버튼 클릭 시 호출되는 콜백",
    },
    isNextEnabled: {
      control: { type: "boolean" },
      description: "다음 버튼 활성화 여부",
    },
  },
  decorators: [
    (Story) => (
      <BottomCTALayout>
        <div style={{ minHeight: "100vh" }}>
          <Story />
        </div>
      </BottomCTALayout>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 상태
export const Default: Story = {
  args: {
    selectedType: undefined,
    isNextEnabled: false,
  },
};

// O/X 선택된 상태
export const WithOxSelected: Story = {
  args: {
    selectedType: "ox",
    isNextEnabled: true,
  },
};

// 호불호 선택된 상태
export const WithHobullhoSelected: Story = {
  args: {
    selectedType: "hobullho",
    isNextEnabled: true,
  },
};

// 객관식 선택된 상태
export const WithMultipleSelected: Story = {
  args: {
    selectedType: "multiple",
    isNextEnabled: true,
  },
};

// 인터랙티브 예시
export const Interactive: Story = {
  render: () => {
    const [selectedType, setSelectedType] = useState<
      "ox" | "hobullho" | "multiple"
    >();

    const handleTypeChange = (type: "ox" | "hobullho" | "multiple") => {
      setSelectedType(type);
    };

    const handleNext = () => {
      alert(`다음 단계로 진행합니다. 선택된 유형: ${selectedType}`);
    };

    const handleBack = () => {
      alert("이전 단계로 돌아갑니다.");
    };

    return (
      <CategoryStep
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        onNext={handleNext}
        onBack={handleBack}
        isNextEnabled={!!selectedType}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "실제로 상호작용할 수 있는 CategoryStep 예시입니다. 투표 유형을 선택하면 다음 버튼이 활성화됩니다.",
      },
    },
  },
};

// 폼 유효성 검사 예시
export const WithValidation: Story = {
  render: () => {
    const [selectedType, setSelectedType] = useState<
      "ox" | "hobullho" | "multiple"
    >();
    const [showError, setShowError] = useState(false);

    const handleNext = () => {
      if (!selectedType) {
        setShowError(true);
        return;
      }
      setShowError(false);
      alert(`선택완료: ${selectedType}`);
    };

    const handleTypeChange = (type: "ox" | "hobullho" | "multiple") => {
      setSelectedType(type);
      setShowError(false);
    };

    return (
      <div className="relative">
        <CategoryStep
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          onNext={handleNext}
          onBack={() => alert("뒤로가기")}
          isNextEnabled={true} // 항상 클릭 가능하게 해서 유효성 검사 로직 테스트
        />

        {showError && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
            투표 유형을 선택해주세요!
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "유효성 검사 로직이 포함된 예시입니다. 투표 유형을 선택하지 않고 다음 버튼을 클릭하면 에러 메시지가 표시됩니다.",
      },
    },
  },
};
