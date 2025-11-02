import { CenterOverlay } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof CenterOverlay> = {
  title: "Common/CenterOverlay",
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
        <CenterOverlay targetElement={<div className="h-20 w-20 rounded-full bg-blue-500" />}>
          <span className="text-xl font-bold text-white">42</span>
        </CenterOverlay>
      </div>
    );
  },
};

export const SquareWithText: Story = {
  render: () => {
    return (
      <div style={{ padding: "100px" }}>
        <CenterOverlay targetElement={<div className="h-24 w-24 rounded-lg bg-green-500" />}>
          <span className="text-lg font-bold text-white">OK</span>
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
        <CenterOverlay targetElement={<div className="h-16 w-16 rounded-full bg-red-500" />}>
          <span className="font-bold text-white">1</span>
        </CenterOverlay>

        <CenterOverlay targetElement={<div className="h-16 w-16 rounded-lg bg-purple-500" />}>
          <span className="font-bold text-white">A</span>
        </CenterOverlay>

        <CenterOverlay targetElement={<div className="h-12 w-20 rounded-full bg-yellow-500" />}>
          <span className="font-bold text-black">99</span>
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
        <CenterOverlay targetElement={<div className="h-20 w-20 rounded-full bg-pink-500" />}>
          <span className="text-2xl text-white">💝</span>
        </CenterOverlay>

        <CenterOverlay
          targetElement={<div className="h-16 w-16 rotate-45 rounded-lg bg-indigo-500" />}
        >
          <span className="-rotate-45 text-sm font-bold text-white">NEW</span>
        </CenterOverlay>

        <CenterOverlay targetElement={<div className="h-14 w-14 rounded-full bg-orange-500" />}>
          <span className="text-lg text-white">🔔</span>
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
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600" />
          }
        >
          <span className="text-xl font-bold text-white">★</span>
        </CenterOverlay>

        <CenterOverlay
          targetElement={
            <div className="h-16 w-24 rounded-2xl bg-gradient-to-r from-green-400 to-blue-500" />
          }
        >
          <span className="text-lg font-bold text-white">LIVE</span>
        </CenterOverlay>

        <CenterOverlay
          targetElement={
            <div className="h-16 w-16 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-500" />
          }
        >
          <span className="text-2xl font-bold text-white">♥</span>
        </CenterOverlay>
      </div>
    );
  },
};
