import type { Meta, StoryObj } from "@storybook/nextjs";
import { CenterOverlay } from "@repo/ui/components";

const meta: Meta<typeof CenterOverlay> = {
  title: "UI/CenterOverlay",
  component: CenterOverlay,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# CenterOverlay

target element의 정중앙에 children을 배치하는 컴포넌트입니다.

## 사용법

\`\`\`tsx
<CenterOverlay 
  targetElement={
    <div className="w-16 h-16 bg-blue-500 rounded-full"></div>
  }
>
  42
</CenterOverlay>
\`\`\`

## Props

| Prop | Type | Description |
|------|------|-------------|
| \`targetElement\` | \`ReactElement\` | 기준이 되는 React 요소 |
| \`children\` | \`ReactNode\` | 중앙에 배치할 내용 |`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CircleWithNumber: Story = {
  render: () => {
    return (
      <div style={{ padding: "100px" }}>
        <CenterOverlay
          targetElement={
            <div className="w-20 h-20 bg-blue-500 rounded-full"></div>
          }
        >
          <span className="text-white font-bold text-xl">42</span>
        </CenterOverlay>
      </div>
    );
  },
};

export const SquareWithText: Story = {
  render: () => {
    return (
      <div style={{ padding: "100px" }}>
        <CenterOverlay
          targetElement={
            <div className="w-24 h-24 bg-green-500 rounded-lg"></div>
          }
        >
          <span className="text-white font-bold text-lg">OK</span>
        </CenterOverlay>
      </div>
    );
  },
};

export const ColorfulShapes: Story = {
  render: () => {
    return (
      <div
        style={{
          padding: "100px",
          display: "flex",
          gap: "40px",
          alignItems: "center",
        }}
      >
        <CenterOverlay
          targetElement={
            <div className="w-16 h-16 bg-red-500 rounded-full"></div>
          }
        >
          <span className="text-white font-bold">1</span>
        </CenterOverlay>

        <CenterOverlay
          targetElement={
            <div className="w-16 h-16 bg-purple-500 rounded-lg"></div>
          }
        >
          <span className="text-white font-bold">A</span>
        </CenterOverlay>

        <CenterOverlay
          targetElement={
            <div className="w-20 h-12 bg-yellow-500 rounded-full"></div>
          }
        >
          <span className="text-black font-bold">99</span>
        </CenterOverlay>
      </div>
    );
  },
};

export const IconShapes: Story = {
  render: () => {
    return (
      <div
        style={{
          padding: "100px",
          display: "flex",
          gap: "50px",
          alignItems: "center",
        }}
      >
        <CenterOverlay
          targetElement={
            <div className="w-20 h-20 bg-pink-500 rounded-full"></div>
          }
        >
          <span className="text-white text-2xl">💝</span>
        </CenterOverlay>

        <CenterOverlay
          targetElement={
            <div className="w-16 h-16 bg-indigo-500 rounded-lg rotate-45"></div>
          }
        >
          <span className="text-white font-bold text-sm -rotate-45">NEW</span>
        </CenterOverlay>

        <CenterOverlay
          targetElement={
            <div className="w-14 h-14 bg-orange-500 rounded-full"></div>
          }
        >
          <span className="text-white text-lg">🔔</span>
        </CenterOverlay>
      </div>
    );
  },
};

export const GradientShapes: Story = {
  render: () => {
    return (
      <div
        style={{
          padding: "100px",
          display: "flex",
          gap: "60px",
          alignItems: "center",
        }}
      >
        <CenterOverlay
          targetElement={
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full"></div>
          }
        >
          <span className="text-white font-bold text-xl">★</span>
        </CenterOverlay>

        <CenterOverlay
          targetElement={
            <div className="w-24 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl"></div>
          }
        >
          <span className="text-white font-bold text-lg">LIVE</span>
        </CenterOverlay>

        <CenterOverlay
          targetElement={
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-lg"></div>
          }
        >
          <span className="text-white font-bold text-2xl">♥</span>
        </CenterOverlay>
      </div>
    );
  },
};
