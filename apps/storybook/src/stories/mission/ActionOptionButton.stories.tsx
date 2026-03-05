import { ActionOptionButton } from "@/app/(site)/mission/[missionId]/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

const meta: Meta<typeof ActionOptionButton> = {
  title: "Mission/ActionOptionButton",
  component: ActionOptionButton,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# SurveyQuestionOptionButton

설문 질문에 대한 선택지 버튼 컴포넌트입니다.

## 특징

- 클릭하여 선택/선택 해제 가능
- 선택 시 보라색 배경과 체크 아이콘으로 시각적 피드백 제공
- 이미지, 제목, 설명을 유연하게 조합 가능
- 호버 및 활성화 상태의 인터랙션 스타일 지원
- 단일 선택(radio)과 복수 선택(checkbox) 타입 지원

## 사용법

\`\`\`tsx
import { SurveyQuestionOptionButton } from "./components/SurveyQuestionOptionButton";

// 단일 선택 (radio - 원형 체크)
<SurveyQuestionOptionButton
  selectType="radio"
  title="선택지 제목"
  description="선택지 설명 (선택사항)"
  imageUrl="https://example.com/image.jpg"
/>

// 복수 선택 (checkbox - 사각형 체크)
<SurveyQuestionOptionButton
  selectType="checkbox"
  title="선택지 제목"
  description="선택지 설명 (선택사항)"
  imageUrl="https://example.com/image.jpg"
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
      description: "선택지의 제목 (필수)",
    },
    description: {
      control: { type: "text" },
      description: "선택지의 부가 설명 (선택사항)",
    },
    imageUrl: {
      control: { type: "text" },
      description: "선택지 이미지 URL (선택사항)",
    },
    selectType: {
      control: { type: "radio" },
      options: ["radio", "checkbox"],
      description: "선택 타입 (단일 선택: radio, 복수 선택: checkbox)",
    },
    onClick: {
      description: "클릭 이벤트 핸들러",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
    isOther: {
      control: { type: "boolean" },
      description: "기타 옵션 여부 (선택 시 텍스트 입력 필드 표시)",
    },
    textAnswer: {
      control: { type: "text" },
      description: "기타 옵션의 텍스트 입력 값",
    },
    showOtherError: {
      control: { type: "boolean" },
      description: "기타 옵션 에러 표시 여부",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본
export const Default: Story = {
  render: args => {
    const [isSelected, setIsSelected] = useState(false);
    return (
      <div className="w-full max-w-[390px]">
        <ActionOptionButton
          {...args}
          isSelected={isSelected}
          onClick={() => setIsSelected(!isSelected)}
        />
      </div>
    );
  },
  args: {
    title: "선택지 제목",
    description: "선택지에 대한 부가 설명입니다.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  },
};

// 요청된 4가지 케이스
export const PropsCombinations: Story = {
  render: () => {
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
    const toggle = (key: string) => {
      setSelectedSet(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    return (
      <div className="w-full max-w-[390px] space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">1. title만 있는 경우</h3>
          <ActionOptionButton
            title="카페에서 커피 마시기"
            isSelected={selectedSet.has("1")}
            onClick={() => toggle("1")}
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">2. title + description</h3>
          <ActionOptionButton
            title="집에서 커피 내려 마시기"
            description="직접 원두를 갈아서 드립하거나 에스프레소 머신을 사용합니다"
            isSelected={selectedSet.has("2")}
            onClick={() => toggle("2")}
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">3. imageUrl + title</h3>
          <ActionOptionButton
            imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop"
            title="테이크아웃 커피"
            isSelected={selectedSet.has("3")}
            onClick={() => toggle("3")}
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">4. imageUrl + title + description</h3>
          <ActionOptionButton
            imageUrl="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150&h=150&fit=crop"
            title="편의점 커피"
            description="저렴한 가격으로 간편하게 즐기는 커피입니다"
            isSelected={selectedSet.has("4")}
            onClick={() => toggle("4")}
          />
        </div>
      </div>
    );
  },
};

// 다양한 컨텐츠 길이
export const ContentVariations: Story = {
  render: () => {
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
    const toggle = (key: string) => {
      setSelectedSet(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    return (
      <div className="w-full max-w-[390px] space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">짧은 텍스트</h3>
          <ActionOptionButton
            imageUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
            title="A"
            description="선택지 A"
            isSelected={selectedSet.has("short")}
            onClick={() => toggle("short")}
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">중간 길이 텍스트</h3>
          <ActionOptionButton
            imageUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
            title="주 5회 이상 운동하는 편입니다"
            description="헬스장, 요가, 필라테스 등 다양한 방법으로 운동을 즐깁니다"
            isSelected={selectedSet.has("medium")}
            onClick={() => toggle("medium")}
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">긴 텍스트</h3>
          <ActionOptionButton
            imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
            title="거의 운동을 하지 않거나, 한 달에 1-2회 정도만 가끔 운동하는 편입니다"
            description="업무나 일상생활이 바빠서 규칙적으로 운동할 시간을 내기 어렵거나, 운동에 대한 동기부여가 부족한 상태입니다"
            isSelected={selectedSet.has("long")}
            onClick={() => toggle("long")}
          />
        </div>
      </div>
    );
  },
};

// 이미지 없는 케이스들
export const WithoutImage: Story = {
  render: () => {
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
    const toggle = (key: string) => {
      setSelectedSet(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    return (
      <div className="w-full max-w-[390px] space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">제목만</h3>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              title="네"
              isSelected={selectedSet.has("yes")}
              onClick={() => toggle("yes")}
            />
            <ActionOptionButton
              title="아니오"
              isSelected={selectedSet.has("no")}
              onClick={() => toggle("no")}
            />
            <ActionOptionButton
              title="잘 모르겠습니다"
              isSelected={selectedSet.has("unknown")}
              onClick={() => toggle("unknown")}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">제목 + 설명</h3>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              title="매우 만족"
              description="기대 이상의 서비스를 받았습니다"
              isSelected={selectedSet.has("very-satisfied")}
              onClick={() => toggle("very-satisfied")}
            />
            <ActionOptionButton
              title="만족"
              description="전반적으로 만족스러운 서비스였습니다"
              isSelected={selectedSet.has("satisfied")}
              onClick={() => toggle("satisfied")}
            />
            <ActionOptionButton
              title="보통"
              description="특별히 좋지도 나쁘지도 않았습니다"
              isSelected={selectedSet.has("normal")}
              onClick={() => toggle("normal")}
            />
          </div>
        </div>
      </div>
    );
  },
};

// 이미지 있는 케이스들
export const WithImage: Story = {
  render: () => {
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
    const toggle = (key: string) => {
      setSelectedSet(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    return (
      <div className="w-full max-w-[390px] space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">이미지 + 제목</h3>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              imageUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
              title="20대"
              isSelected={selectedSet.has("20s")}
              onClick={() => toggle("20s")}
            />
            <ActionOptionButton
              imageUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
              title="30대"
              isSelected={selectedSet.has("30s")}
              onClick={() => toggle("30s")}
            />
            <ActionOptionButton
              imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
              title="40대"
              isSelected={selectedSet.has("40s")}
              onClick={() => toggle("40s")}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">이미지 + 제목 + 설명</h3>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop"
              title="아메리카노"
              description="진한 에스프레소에 물을 추가한 커피"
              isSelected={selectedSet.has("americano")}
              onClick={() => toggle("americano")}
            />
            <ActionOptionButton
              imageUrl="https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=150&h=150&fit=crop"
              title="카페라떼"
              description="에스프레소에 스팀 밀크를 넣은 부드러운 커피"
              isSelected={selectedSet.has("latte")}
              onClick={() => toggle("latte")}
            />
            <ActionOptionButton
              imageUrl="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&h=150&fit=crop"
              title="카푸치노"
              description="에스프레소, 스팀 밀크, 우유 거품이 조화를 이루는 커피"
              isSelected={selectedSet.has("cappuccino")}
              onClick={() => toggle("cappuccino")}
            />
          </div>
        </div>
      </div>
    );
  },
};

// SelectType 비교
export const SelectTypes: Story = {
  render: () => {
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
    const toggle = (key: string) => {
      setSelectedSet(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    return (
      <div className="w-full max-w-[390px] space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-medium">Radio (단일 선택) - 원형 체크</h3>
          <p className="mb-4 text-xs text-gray-600">
            단일 선택 질문에 사용됩니다. 원형 체크 아이콘이 표시됩니다.
          </p>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              selectType="radio"
              imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop"
              title="아메리카노"
              description="깔끔하고 진한 맛"
              isSelected={selectedSet.has("radio-americano")}
              onClick={() => toggle("radio-americano")}
            />
            <ActionOptionButton
              selectType="radio"
              imageUrl="https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=150&h=150&fit=crop"
              title="카페라떼"
              description="부드럽고 고소한 맛"
              isSelected={selectedSet.has("radio-latte")}
              onClick={() => toggle("radio-latte")}
            />
            <ActionOptionButton
              selectType="radio"
              imageUrl="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&h=150&fit=crop"
              title="카푸치노"
              description="거품이 풍부한 커피"
              isSelected={selectedSet.has("radio-cappuccino")}
              onClick={() => toggle("radio-cappuccino")}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Checkbox (복수 선택) - 사각형 체크</h3>
          <p className="mb-4 text-xs text-gray-600">
            복수 선택 질문에 사용됩니다. 사각형 체크 아이콘이 표시됩니다.
          </p>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              selectType="checkbox"
              imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop"
              title="아메리카노"
              description="깔끔하고 진한 맛"
              isSelected={selectedSet.has("checkbox-americano")}
              onClick={() => toggle("checkbox-americano")}
            />
            <ActionOptionButton
              selectType="checkbox"
              imageUrl="https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=150&h=150&fit=crop"
              title="카페라떼"
              description="부드럽고 고소한 맛"
              isSelected={selectedSet.has("checkbox-latte")}
              onClick={() => toggle("checkbox-latte")}
            />
            <ActionOptionButton
              selectType="checkbox"
              imageUrl="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&h=150&fit=crop"
              title="카푸치노"
              description="거품이 풍부한 커피"
              isSelected={selectedSet.has("checkbox-cappuccino")}
              onClick={() => toggle("checkbox-cappuccino")}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">이미지 없는 경우 비교</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs text-gray-600">Radio</p>
              <div className="flex flex-col gap-2">
                <ActionOptionButton
                  selectType="radio"
                  title="옵션 1"
                  isSelected={selectedSet.has("radio-noimg-1")}
                  onClick={() => toggle("radio-noimg-1")}
                />
                <ActionOptionButton
                  selectType="radio"
                  title="옵션 2"
                  isSelected={selectedSet.has("radio-noimg-2")}
                  onClick={() => toggle("radio-noimg-2")}
                />
                <ActionOptionButton
                  selectType="radio"
                  title="옵션 3"
                  isSelected={selectedSet.has("radio-noimg-3")}
                  onClick={() => toggle("radio-noimg-3")}
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-600">Checkbox</p>
              <div className="flex flex-col gap-2">
                <ActionOptionButton
                  selectType="checkbox"
                  title="옵션 1"
                  isSelected={selectedSet.has("checkbox-noimg-1")}
                  onClick={() => toggle("checkbox-noimg-1")}
                />
                <ActionOptionButton
                  selectType="checkbox"
                  title="옵션 2"
                  isSelected={selectedSet.has("checkbox-noimg-2")}
                  onClick={() => toggle("checkbox-noimg-2")}
                />
                <ActionOptionButton
                  selectType="checkbox"
                  title="옵션 3"
                  isSelected={selectedSet.has("checkbox-noimg-3")}
                  onClick={() => toggle("checkbox-noimg-3")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// 인터랙티브 상태 (선택/선택 해제)
export const Interactive: Story = {
  render: () => {
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
    const toggle = (key: string) => {
      setSelectedSet(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    return (
      <div className="w-full max-w-[390px] space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">클릭하여 선택/선택 해제 동작 확인</h3>
          <p className="mb-4 text-xs text-gray-600">
            버튼을 클릭하면 선택 상태가 토글되며, 선택 시 보라색 배경과 체크 아이콘이 표시됩니다.
          </p>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop"
              title="옵션 1"
              description="첫 번째 선택지입니다"
              isSelected={selectedSet.has("option-1")}
              onClick={() => toggle("option-1")}
            />
            <ActionOptionButton
              imageUrl="https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=150&h=150&fit=crop"
              title="옵션 2"
              description="두 번째 선택지입니다"
              isSelected={selectedSet.has("option-2")}
              onClick={() => toggle("option-2")}
            />
            <ActionOptionButton
              imageUrl="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&h=150&fit=crop"
              title="옵션 3"
              description="세 번째 선택지입니다"
              isSelected={selectedSet.has("option-3")}
              onClick={() => toggle("option-3")}
            />
          </div>
        </div>
      </div>
    );
  },
};

// 비활성화 상태
export const Disabled: Story = {
  render: () => (
    <div className="w-full max-w-[390px] space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">비활성화된 버튼 (Radio)</h3>
        <div className="flex flex-col gap-3">
          <ActionOptionButton selectType="radio" title="비활성화된 옵션" disabled />
          <ActionOptionButton
            selectType="radio"
            title="비활성화된 옵션"
            description="이 옵션은 선택할 수 없습니다"
            disabled
          />
          <ActionOptionButton
            selectType="radio"
            imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop"
            title="비활성화된 옵션"
            description="이미지가 있어도 선택할 수 없습니다"
            disabled
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">비활성화된 버튼 (Checkbox)</h3>
        <div className="flex flex-col gap-3">
          <ActionOptionButton selectType="checkbox" title="비활성화된 옵션" disabled />
          <ActionOptionButton
            selectType="checkbox"
            title="비활성화된 옵션"
            description="이 옵션은 선택할 수 없습니다"
            disabled
          />
          <ActionOptionButton
            selectType="checkbox"
            imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop"
            title="비활성화된 옵션"
            description="이미지가 있어도 선택할 수 없습니다"
            disabled
          />
        </div>
      </div>
    </div>
  ),
};

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => {
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
    const toggle = (key: string) => {
      setSelectedSet(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    return (
      <div className="w-full max-w-[390px] space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-medium">단일 선택: 선호하는 커피는 무엇인가요?</h3>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              selectType="radio"
              imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop"
              title="아메리카노"
              description="깔끔하고 진한 맛"
              isSelected={selectedSet.has("coffee-americano")}
              onClick={() => toggle("coffee-americano")}
            />
            <ActionOptionButton
              selectType="radio"
              imageUrl="https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=150&h=150&fit=crop"
              title="카페라떼"
              description="부드럽고 고소한 맛"
              isSelected={selectedSet.has("coffee-latte")}
              onClick={() => toggle("coffee-latte")}
            />
            <ActionOptionButton
              selectType="radio"
              imageUrl="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&h=150&fit=crop"
              title="카푸치노"
              description="거품이 풍부한 커피"
              isSelected={selectedSet.has("coffee-cappuccino")}
              onClick={() => toggle("coffee-cappuccino")}
            />
            <ActionOptionButton
              selectType="radio"
              imageUrl="https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=150&h=150&fit=crop"
              title="기타"
              description="다른 종류의 커피를 선호합니다"
              isSelected={selectedSet.has("coffee-other")}
              onClick={() => toggle("coffee-other")}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">복수 선택: 관심 있는 주제를 모두 선택하세요</h3>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              selectType="checkbox"
              title="건강 및 운동"
              description="웰니스, 피트니스, 요가 등"
              isSelected={selectedSet.has("topic-health")}
              onClick={() => toggle("topic-health")}
            />
            <ActionOptionButton
              selectType="checkbox"
              title="맛집 및 카페"
              description="음식, 레스토랑, 카페 탐방"
              isSelected={selectedSet.has("topic-food")}
              onClick={() => toggle("topic-food")}
            />
            <ActionOptionButton
              selectType="checkbox"
              title="여행 및 관광"
              description="국내외 여행지 추천"
              isSelected={selectedSet.has("topic-travel")}
              onClick={() => toggle("topic-travel")}
            />
            <ActionOptionButton
              selectType="checkbox"
              title="취미 및 문화"
              description="공연, 전시, 취미 활동"
              isSelected={selectedSet.has("topic-hobby")}
              onClick={() => toggle("topic-hobby")}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">단일 선택: 이 서비스에 만족하시나요?</h3>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              selectType="radio"
              title="매우 만족"
              description="기대 이상입니다"
              isSelected={selectedSet.has("satisfaction-very")}
              onClick={() => toggle("satisfaction-very")}
            />
            <ActionOptionButton
              selectType="radio"
              title="만족"
              description="만족스럽습니다"
              isSelected={selectedSet.has("satisfaction-good")}
              onClick={() => toggle("satisfaction-good")}
            />
            <ActionOptionButton
              selectType="radio"
              title="보통"
              description="그저 그렇습니다"
              isSelected={selectedSet.has("satisfaction-normal")}
              onClick={() => toggle("satisfaction-normal")}
            />
            <ActionOptionButton
              selectType="radio"
              title="불만족"
              description="개선이 필요합니다"
              isSelected={selectedSet.has("satisfaction-bad")}
              onClick={() => toggle("satisfaction-bad")}
            />
            <ActionOptionButton
              selectType="radio"
              title="매우 불만족"
              description="기대에 미치지 못합니다"
              isSelected={selectedSet.has("satisfaction-very-bad")}
              onClick={() => toggle("satisfaction-very-bad")}
            />
          </div>
        </div>
      </div>
    );
  },
};

// 기타 옵션 상태
export const OtherOptionStates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "isOther prop을 사용하여 '기타' 옵션을 구현합니다. 선택 시 텍스트 입력 필드가 표시됩니다.",
      },
    },
  },
  render: () => (
    <div className="w-full max-w-[390px] space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">미선택 상태</h3>
        <ActionOptionButton selectType="radio" title="기타" isOther isSelected={false} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">선택 상태 (입력 전)</h3>
        <ActionOptionButton
          selectType="radio"
          title="기타"
          isOther
          isSelected={true}
          textAnswer=""
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">선택 상태 (입력 완료)</h3>
        <ActionOptionButton
          selectType="radio"
          title="기타"
          isOther
          isSelected={true}
          textAnswer="직접 입력한 의견입니다"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">에러 상태</h3>
        <ActionOptionButton
          selectType="radio"
          title="기타"
          isOther
          isSelected={true}
          textAnswer=""
          showOtherError={true}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Checkbox 타입</h3>
        <ActionOptionButton
          selectType="checkbox"
          title="기타"
          isOther
          isSelected={true}
          textAnswer="체크박스 타입의 기타 옵션"
        />
      </div>
    </div>
  ),
};

// 기타 옵션 인터랙티브
export const OtherOptionInteractive: Story = {
  parameters: {
    docs: {
      description: {
        story: "기타 옵션의 인터랙션을 테스트합니다. 클릭하여 선택하고 텍스트를 입력해보세요.",
      },
    },
  },
  render: () => {
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
    const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState<Record<string, boolean>>({});

    const toggle = (key: string) => {
      setSelectedSet(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    const handleTextChange = (key: string, value: string) => {
      setTextAnswers(prev => ({ ...prev, [key]: value }));
      if (value.trim()) {
        setShowErrors(prev => ({ ...prev, [key]: false }));
      }
    };

    const handleBlur = (key: string) => {
      if (!textAnswers[key]?.trim()) {
        setShowErrors(prev => ({ ...prev, [key]: true }));
      }
    };

    return (
      <div className="w-full max-w-[390px] space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-medium">Radio 타입</h3>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              selectType="radio"
              title="옵션 1"
              isSelected={selectedSet.has("radio-opt1")}
              onClick={() => toggle("radio-opt1")}
            />
            <ActionOptionButton
              selectType="radio"
              title="옵션 2"
              isSelected={selectedSet.has("radio-opt2")}
              onClick={() => toggle("radio-opt2")}
            />
            <ActionOptionButton
              selectType="radio"
              title="기타"
              isOther
              isSelected={selectedSet.has("radio-other")}
              onClick={() => toggle("radio-other")}
              textAnswer={textAnswers["radio-other"] || ""}
              onTextAnswerChange={e => handleTextChange("radio-other", e.target.value)}
              onTextAnswerBlur={() => handleBlur("radio-other")}
              showOtherError={showErrors["radio-other"]}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Checkbox 타입</h3>
          <div className="flex flex-col gap-3">
            <ActionOptionButton
              selectType="checkbox"
              title="옵션 A"
              isSelected={selectedSet.has("checkbox-optA")}
              onClick={() => toggle("checkbox-optA")}
            />
            <ActionOptionButton
              selectType="checkbox"
              title="옵션 B"
              isSelected={selectedSet.has("checkbox-optB")}
              onClick={() => toggle("checkbox-optB")}
            />
            <ActionOptionButton
              selectType="checkbox"
              title="기타"
              isOther
              isSelected={selectedSet.has("checkbox-other")}
              onClick={() => toggle("checkbox-other")}
              textAnswer={textAnswers["checkbox-other"] || ""}
              onTextAnswerChange={e => handleTextChange("checkbox-other", e.target.value)}
              onTextAnswerBlur={() => handleBlur("checkbox-other")}
              showOtherError={showErrors["checkbox-other"]}
            />
          </div>
        </div>
      </div>
    );
  },
};

// 모바일 화면 시뮬레이션
export const MobileView: Story = {
  render: () => {
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
    const toggle = (key: string) => {
      setSelectedSet(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    return (
      <div className="w-full max-w-[390px] min-h-[600px] bg-white p-5 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-2">운동 습관에 대해 알려주세요</h2>
          <p className="text-sm text-gray-600">하나를 선택해주세요</p>
        </div>

        <div className="flex flex-col gap-3">
          <ActionOptionButton
            selectType="radio"
            imageUrl="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop"
            title="거의 매일 운동합니다"
            description="주 5회 이상 규칙적으로 운동하는 편입니다"
            isSelected={selectedSet.has("exercise-daily")}
            onClick={() => toggle("exercise-daily")}
          />
          <ActionOptionButton
            selectType="radio"
            imageUrl="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop"
            title="주 3-4회 운동합니다"
            description="일주일에 서너 번 정도 운동 시간을 갖습니다"
            isSelected={selectedSet.has("exercise-3-4")}
            onClick={() => toggle("exercise-3-4")}
          />
          <ActionOptionButton
            selectType="radio"
            imageUrl="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=150&fit=crop"
            title="주 1-2회 운동합니다"
            description="가끔씩 시간이 날 때 운동합니다"
            isSelected={selectedSet.has("exercise-1-2")}
            onClick={() => toggle("exercise-1-2")}
          />
          <ActionOptionButton
            selectType="radio"
            imageUrl="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&h=150&fit=crop"
            title="거의 운동하지 않습니다"
            description="한 달에 한두 번 정도만 운동합니다"
            isSelected={selectedSet.has("exercise-rarely")}
            onClick={() => toggle("exercise-rarely")}
          />
        </div>

        <button
          type="button"
          className="w-full py-3 bg-zinc-800 text-white rounded-lg font-semibold"
        >
          다음
        </button>
      </div>
    );
  },
};
