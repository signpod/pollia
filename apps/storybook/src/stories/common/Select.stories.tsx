import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

const meta: Meta<typeof Select> = {
  title: "Common/Select",
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# Select

웹 접근성을 완벽히 갖춘 Select 컴포넌트입니다.

## 접근성 기능
- **ARIA 속성**: aria-label, aria-expanded, aria-selected 자동 적용
- **키보드 네비게이션**:
  - Enter, Space: 선택/열기
  - ArrowUp, ArrowDown: 옵션 탐색
  - Escape: 닫기
  - Home, End: 첫/마지막 옵션으로 이동
- **포커스 관리**: Focus trap 및 자동 포커스 이동
- **스크린 리더 지원**: 완벽한 스크린 리더 호환

## 기술 스택
- Radix UI Select (WCAG 2.1 준수)
- Tailwind CSS
- Lucide React Icons

## 사용법
\`\`\`tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="선택하세요" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">옵션 1</SelectItem>
    <SelectItem value="option2">옵션 2</SelectItem>
  </SelectContent>
</Select>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: { type: "boolean" },
      description: "Select 비활성화 상태",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 Select
export const Default: Story = {
  render: () => (
    <div className="w-[200px]">
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue>과일을 선택하세요</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">사과</SelectItem>
          <SelectItem value="banana">바나나</SelectItem>
          <SelectItem value="orange">오렌지</SelectItem>
          <SelectItem value="grape">포도</SelectItem>
          <SelectItem value="strawberry">딸기</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "가장 기본적인 Select 컴포넌트입니다. 기본값이 설정되어 있습니다.",
      },
    },
  },
};

// 다양한 너비
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Small (120px)</h3>
        <Select defaultValue="option1">
          <SelectTrigger className="w-[120px]">
            <SelectValue>전체</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">전체</SelectItem>
            <SelectItem value="option2">사용</SelectItem>
            <SelectItem value="option3">미사용</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Medium (200px)</h3>
        <Select defaultValue="option1">
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">옵션 1</SelectItem>
            <SelectItem value="option2">옵션 2</SelectItem>
            <SelectItem value="option3">옵션 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Large (300px)</h3>
        <Select defaultValue="option1">
          <SelectTrigger className="w-[300px]">
            <SelectValue>매우 긴 옵션 텍스트 예시</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">매우 긴 옵션 텍스트 예시</SelectItem>
            <SelectItem value="option2">또 다른 긴 옵션 텍스트입니다</SelectItem>
            <SelectItem value="option3">세 번째 옵션</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Full Width</h3>
        <Select defaultValue="option1">
          <SelectTrigger className="w-full">
            <SelectValue>옵션 1</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">옵션 1</SelectItem>
            <SelectItem value="option2">옵션 2</SelectItem>
            <SelectItem value="option3">옵션 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "다양한 너비의 Select 컴포넌트입니다. className으로 너비를 조절할 수 있습니다.",
      },
    },
  },
};

// States (Disabled, Placeholder)
export const States: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Placeholder</h3>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="옵션을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">옵션 1</SelectItem>
            <SelectItem value="option2">옵션 2</SelectItem>
            <SelectItem value="option3">옵션 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Disabled</h3>
        <Select disabled defaultValue="option1">
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">비활성화됨</SelectItem>
            <SelectItem value="option2">옵션 2</SelectItem>
            <SelectItem value="option3">옵션 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Disabled Item</h3>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="옵션을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">선택 가능</SelectItem>
            <SelectItem value="option2" disabled>
              선택 불가능
            </SelectItem>
            <SelectItem value="option3">선택 가능</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Select의 다양한 상태를 보여줍니다. Placeholder, 전체 비활성화, 특정 아이템 비활성화를 확인할 수 있습니다.",
      },
    },
  },
};

// Interactive (실제 동작)
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>("");

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">
          선택한 값: <span className="text-violet-600">{value || "없음"}</span>
        </h3>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-[200px]" aria-label="과일 선택">
            <SelectValue placeholder="과일을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">🍎 사과</SelectItem>
            <SelectItem value="banana">🍌 바나나</SelectItem>
            <SelectItem value="orange">🍊 오렌지</SelectItem>
            <SelectItem value="grape">🍇 포도</SelectItem>
            <SelectItem value="strawberry">🍓 딸기</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "실제로 동작하는 Interactive Select입니다. 선택한 값이 실시간으로 업데이트됩니다.",
      },
    },
  },
};

// With Groups
export const WithGroups: Story = {
  render: () => (
    <div className="w-[250px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="음식을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>과일</SelectLabel>
            <SelectItem value="apple">사과</SelectItem>
            <SelectItem value="banana">바나나</SelectItem>
            <SelectItem value="orange">오렌지</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>채소</SelectLabel>
            <SelectItem value="carrot">당근</SelectItem>
            <SelectItem value="potato">감자</SelectItem>
            <SelectItem value="tomato">토마토</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>육류</SelectLabel>
            <SelectItem value="beef">소고기</SelectItem>
            <SelectItem value="pork">돼지고기</SelectItem>
            <SelectItem value="chicken">닭고기</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "SelectGroup과 SelectLabel을 사용하여 옵션을 그룹화할 수 있습니다. SelectSeparator로 구분선을 추가할 수 있습니다.",
      },
    },
  },
};

// Real World Examples
export const RealWorldExamples: Story = {
  render: () => {
    const [language, setLanguage] = React.useState("ko");
    const [theme, setTheme] = React.useState("light");
    const [draftFilter, setDraftFilter] = React.useState("all");

    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-medium">언어 선택</h3>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]" aria-label="언어 선택">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ko">🇰🇷 한국어</SelectItem>
              <SelectItem value="en">🇺🇸 English</SelectItem>
              <SelectItem value="ja">🇯🇵 日本語</SelectItem>
              <SelectItem value="zh">🇨🇳 中文</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">테마 선택</h3>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[180px]" aria-label="테마 선택">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">☀️ 라이트 모드</SelectItem>
              <SelectItem value="dark">🌙 다크 모드</SelectItem>
              <SelectItem value="system">💻 시스템 설정</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">사용 상태 필터</h3>
          <Select value={draftFilter} onValueChange={setDraftFilter}>
            <SelectTrigger className="w-[120px]" aria-label="사용 상태 필터">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="used">사용</SelectItem>
              <SelectItem value="unused">미사용</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "실제 프로젝트에서 사용되는 예시들입니다. 언어 선택, 테마 선택, 필터링 등의 사용 사례를 보여줍니다.",
      },
    },
  },
};

// Long List (Scrollable)
export const LongList: Story = {
  render: () => (
    <div className="w-[200px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="국가를 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="kr">대한민국</SelectItem>
          <SelectItem value="us">미국</SelectItem>
          <SelectItem value="jp">일본</SelectItem>
          <SelectItem value="cn">중국</SelectItem>
          <SelectItem value="uk">영국</SelectItem>
          <SelectItem value="fr">프랑스</SelectItem>
          <SelectItem value="de">독일</SelectItem>
          <SelectItem value="it">이탈리아</SelectItem>
          <SelectItem value="es">스페인</SelectItem>
          <SelectItem value="ca">캐나다</SelectItem>
          <SelectItem value="au">호주</SelectItem>
          <SelectItem value="br">브라질</SelectItem>
          <SelectItem value="mx">멕시코</SelectItem>
          <SelectItem value="in">인도</SelectItem>
          <SelectItem value="ru">러시아</SelectItem>
          <SelectItem value="sa">사우디아라비아</SelectItem>
          <SelectItem value="ae">아랍에미리트</SelectItem>
          <SelectItem value="sg">싱가포르</SelectItem>
          <SelectItem value="th">태국</SelectItem>
          <SelectItem value="vn">베트남</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "많은 옵션이 있을 때 스크롤이 가능합니다. max-h-96으로 최대 높이가 제한되어 있습니다.",
      },
    },
  },
};
