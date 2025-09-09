import type { Meta, StoryObj } from "@storybook/nextjs";
import { Tooltip } from "@repo/ui";

const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# Tooltip

간단하고 직관적인 툴팁 컴포넌트입니다. \`data-tooltip-id\`로 연결하여 사용합니다.

## 사용법

trigger 요소에 \`data-tooltip-id\`를 설정하고, 같은 id로 \`Tooltip\` 컴포넌트를 렌더링하세요.

\`\`\`tsx
<button data-tooltip-id="my-tooltip">호버해보세요</button>
<Tooltip id="my-tooltip" placement="top">
  이것은 툴팁입니다
</Tooltip>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`children\` | \`ReactNode\` | - | 툴팁에 표시할 내용 |
| \`id\` | \`string\` | - | \`data-tooltip-id\`와 연결할 고유 ID |
| \`placement\` | \`"top" \\| "bottom"\` | \`"top"\` | 툴팁 위치 |
| \`className\` | \`string\` | - | 추가 스타일링 클래스 |

## 예시

\`\`\`tsx
// 기본 사용
<button data-tooltip-id="basic">기본 툴팁</button>
<Tooltip id="basic">안녕하세요!</Tooltip>

// 아래 위치  
<button data-tooltip-id="bottom">아래 툴팁</button>
<Tooltip id="bottom" placement="bottom">아래에서 나타납니다</Tooltip>

// 복잡한 내용
<span data-tooltip-id="rich">정보 보기</span>
<Tooltip id="rich" placement="top">
  <div>
    <strong>제목</strong>
    <p>상세한 설명이 들어갑니다.</p>
  </div>
</Tooltip>

// 커스텀 스타일
<button data-tooltip-id="custom">커스텀</button>
<Tooltip id="custom" className="bg-blue-500 text-white">
  파란색 툴팁
</Tooltip>
\`\`\``,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  render: () => (
    <div style={{ padding: "100px", minHeight: "300px" }}>
      <button
        data-tooltip-id="top-tooltip"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        위쪽 툴팁
      </button>
      <Tooltip id="top-tooltip" placement="top" className="text-black">
        위에서 나타나는 툴팁
      </Tooltip>
    </div>
  ),
};

export const Bottom: Story = {
  render: () => (
    <div style={{ padding: "100px", minHeight: "300px" }}>
      <button
        data-tooltip-id="bottom-tooltip"
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        아래 툴팁
      </button>
      <Tooltip id="bottom-tooltip" placement="bottom" className="text-black">
        아래에서 나타나는 툴팁
      </Tooltip>
    </div>
  ),
};
