import { Meta, StoryObj } from "@storybook/nextjs";
import { PointIcon } from "@web/components/common/PointIcon";

const meta: Meta<typeof PointIcon> = {
  title: "Pollia/Common/PointIcon",
  component: PointIcon,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# PointIcon

Pollia 아이콘을 배경으로 사용하고 중앙에 콘텐츠를 오버레이하는 컴포넌트입니다.

## 사용법

\`\`\`tsx
<PointIcon>
  <span>1</span>
</PointIcon>
\`\`\`

## Props

| Prop | Type | Description |
|------|------|-------------|
| \`children\` | \`ReactNode\` | 아이콘 중앙에 표시할 콘텐츠 |

## 특징

- Pollia 로고를 배경으로 사용
- CenterOverlay를 활용하여 중앙 정렬
- 투표 선택지, 순번 표시 등에 활용`,
      },
    },
  },
  argTypes: {
    children: {
      control: { type: "text" },
      description: "중앙에 표시할 콘텐츠",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 숫자 표시
export const WithNumber: Story = {
  args: {
    children: <span className="text-sm font-bold text-white">1</span>,
  },
  parameters: {
    docs: {
      description: {
        story: "숫자를 중앙에 표시합니다. 투표 순번이나 선택지 번호로 활용할 수 있습니다.",
      },
    },
  },
};

// 텍스트 표시
export const WithText: Story = {
  args: {
    children: <span className="text-xs font-bold text-white">A</span>,
  },
  parameters: {
    docs: {
      description: {
        story: "텍스트를 중앙에 표시합니다. 객관식 선택지 라벨로 활용할 수 있습니다.",
      },
    },
  },
};

// 아이콘 표시
export const WithIcon: Story = {
  render: () => (
    <PointIcon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="size-4 text-white"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </PointIcon>
  ),
  parameters: {
    docs: {
      description: {
        story: "아이콘을 중앙에 표시합니다. 다양한 액션 버튼으로 활용할 수 있습니다.",
      },
    },
  },
};

// 다양한 숫자 예시
export const NumberSequence: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <PointIcon>
        <span className="text-sm font-bold text-white">1</span>
      </PointIcon>
      <PointIcon>
        <span className="text-sm font-bold text-white">2</span>
      </PointIcon>
      <PointIcon>
        <span className="text-sm font-bold text-white">3</span>
      </PointIcon>
      <PointIcon>
        <span className="text-sm font-bold text-white">4</span>
      </PointIcon>
      <PointIcon>
        <span className="text-sm font-bold text-white">5</span>
      </PointIcon>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "연속된 숫자를 표시하는 예시입니다. 투표 선택지 순번 표시에 활용할 수 있습니다.",
      },
    },
  },
};

// 다양한 알파벳 예시
export const AlphabetSequence: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <PointIcon>
        <span className="text-xs font-bold text-white">A</span>
      </PointIcon>
      <PointIcon>
        <span className="text-xs font-bold text-white">B</span>
      </PointIcon>
      <PointIcon>
        <span className="text-xs font-bold text-white">C</span>
      </PointIcon>
      <PointIcon>
        <span className="text-xs font-bold text-white">D</span>
      </PointIcon>
      <PointIcon>
        <span className="text-xs font-bold text-white">E</span>
      </PointIcon>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "알파벳 순서를 표시하는 예시입니다. 객관식 투표의 선택지 라벨로 활용할 수 있습니다.",
      },
    },
  },
};

// 다양한 아이콘 예시
export const VariousIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <PointIcon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="size-4 text-white"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </PointIcon>
      <PointIcon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="size-4 text-white"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </PointIcon>
      <PointIcon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="size-4 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      </PointIcon>
      <PointIcon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="size-4 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </PointIcon>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "다양한 아이콘을 표시하는 예시입니다. 투표 타입이나 상태에 따라 다른 아이콘을 사용할 수 있습니다.",
      },
    },
  },
};

// 크기 비교
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ transform: "scale(0.75)" }}>
          <PointIcon>
            <span className="text-sm font-bold text-white">1</span>
          </PointIcon>
        </div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.5rem" }}>작게</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <PointIcon>
          <span className="text-sm font-bold text-white">2</span>
        </PointIcon>
        <p style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.5rem" }}>기본</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ transform: "scale(1.5)" }}>
          <PointIcon>
            <span className="text-sm font-bold text-white">3</span>
          </PointIcon>
        </div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.5rem" }}>크게</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "CSS transform을 사용하여 크기를 조절할 수 있습니다.",
      },
    },
  },
};
