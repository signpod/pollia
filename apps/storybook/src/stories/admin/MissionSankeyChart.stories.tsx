import { MissionSankeyChart } from "@/app/admin/components/MissionSankeyChart";
import type { MissionFunnelData } from "@/types/dto";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Admin/MissionSankeyChart",
  component: MissionSankeyChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# MissionSankeyChart

미션 완주율을 시각화하는 Sankey 다이어그램 컴포넌트입니다.

## 주요 기능
- 각 단계별 진입자 수와 이탈자 수 시각화
- 노드 및 링크 호버 시 상세 정보 표시 (인원, 퍼센트)
- 빈 데이터 상태 처리
- HSL 색상 팔레트로 테마 대응

## 사용 시나리오
- 관리자 페이지의 "통계" 탭에서 사용
- 미션의 각 단계별 이탈률 분석
- 완주율 모니터링

## 데이터 구조
\`data\` prop은 다음을 포함합니다:
- \`nodes\`: 시작, 진입, 응답, 이탈 노드 배열
- \`links\`: 노드 간 연결 정보 (source, target, value)
- \`metadata\`: 전체 통계 정보 (totalSessions, completionRate 등)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      description: `미션 완주율 퍼널 데이터
      
**구조:**
- \`nodes\`: 노드 배열 (id, name, type, count)
  - type: "start" | "entry" | "response" | "drop"
- \`links\`: 링크 배열 (source, target, value)
- \`metadata\`: 통계 정보 (totalSessions, totalStarted, totalCompleted, completionRate, actions)
      `,
      control: { type: "object" },
      table: {
        type: {
          summary: "MissionFunnelData",
          detail: `{
  nodes: FunnelNode[];
  links: FunnelLink[];
  metadata: FunnelMetadata;
}`,
        },
      },
    },
  },
} satisfies Meta<typeof MissionSankeyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData: MissionFunnelData = {
  nodes: [
    { id: "시작", name: "시작", type: "start", count: 90 },
    { id: "1. 질문 1", name: "1. 질문 1", type: "entry", count: 90 },
    { id: "1. 질문 1 이탈", name: "이탈", type: "drop", count: 0 },
    { id: "2. 질문 2", name: "2. 질문 2", type: "entry", count: 80 },
    { id: "2. 질문 2 이탈", name: "이탈", type: "drop", count: 0 },
    { id: "2. 질문 2 완료", name: "2. 질문 2 완료", type: "response", count: 70 },
  ],
  links: [
    { source: "시작", target: "1. 질문 1", value: 90 },
    { source: "1. 질문 1", target: "1. 질문 1 이탈", value: 10 },
    { source: "1. 질문 1", target: "2. 질문 2", value: 80 },
    { source: "2. 질문 2", target: "2. 질문 2 이탈", value: 10 },
    { source: "2. 질문 2", target: "2. 질문 2 완료", value: 70 },
  ],
  metadata: {
    totalSessions: 100,
    totalStarted: 90,
    totalCompleted: 70,
    completionRate: 77.78,
    actions: [
      {
        id: "action1",
        title: "질문 1",
        order: 1,
        entryCount: 90,
        responseCount: 80,
        entryToResponseRate: 88.89,
      },
      {
        id: "action2",
        title: "질문 2",
        order: 2,
        entryCount: 80,
        responseCount: 70,
        entryToResponseRate: 87.5,
      },
    ],
  },
};

export const Default: Story = {
  args: {
    data: sampleData,
  },
  parameters: {
    docs: {
      description: {
        story: `**일반적인 완주율 시나리오**

90명이 시작하여 70명이 완료한 경우입니다.
- 1단계 이탈: 10명 (11%)
- 2단계 이탈: 10명 (12.5%)
- 최종 완주율: 77.78%

이 시나리오는 평균적인 이탈률을 보여줍니다.`,
      },
    },
  },
};

export const HighDropOff: Story = {
  args: {
    data: {
      nodes: [
        { id: "시작", name: "시작", type: "start", count: 800 },
        { id: "1. 질문 1", name: "1. 질문 1", type: "entry", count: 800 },
        { id: "1. 질문 1 이탈", name: "이탈", type: "drop", count: 0 },
        { id: "2. 질문 2", name: "2. 질문 2", type: "entry", count: 500 },
        { id: "2. 질문 2 이탈", name: "이탈", type: "drop", count: 0 },
        { id: "2. 질문 2 완료", name: "2. 질문 2 완료", type: "response", count: 200 },
      ],
      links: [
        { source: "시작", target: "1. 질문 1", value: 800 },
        { source: "1. 질문 1", target: "1. 질문 1 이탈", value: 300 },
        { source: "1. 질문 1", target: "2. 질문 2", value: 500 },
        { source: "2. 질문 2", target: "2. 질문 2 이탈", value: 300 },
        { source: "2. 질문 2", target: "2. 질문 2 완료", value: 200 },
      ],
      metadata: {
        totalSessions: 1000,
        totalStarted: 800,
        totalCompleted: 200,
        completionRate: 25,
        actions: [
          {
            id: "action1",
            title: "질문 1",
            order: 1,
            entryCount: 800,
            responseCount: 500,
            entryToResponseRate: 62.5,
          },
          {
            id: "action2",
            title: "질문 2",
            order: 2,
            entryCount: 500,
            responseCount: 200,
            entryToResponseRate: 40,
          },
        ],
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**높은 이탈률 시나리오**

800명이 시작했지만 200명만 완료한 경우입니다.
- 1단계 이탈: 300명 (37.5%)
- 2단계 이탈: 300명 (60%)
- 최종 완주율: 25%

이탈률이 높은 문제 상황을 시각적으로 확인할 수 있습니다.
개선이 필요한 단계를 쉽게 파악할 수 있습니다.`,
      },
    },
  },
};

export const PerfectFunnel: Story = {
  args: {
    data: {
      nodes: [
        { id: "시작", name: "시작", type: "start", count: 100 },
        { id: "1. 질문 1", name: "1. 질문 1", type: "entry", count: 100 },
        { id: "2. 질문 2", name: "2. 질문 2", type: "entry", count: 100 },
        { id: "2. 질문 2 완료", name: "2. 질문 2 완료", type: "response", count: 100 },
      ],
      links: [
        { source: "시작", target: "1. 질문 1", value: 100 },
        { source: "1. 질문 1", target: "2. 질문 2", value: 100 },
        { source: "2. 질문 2", target: "2. 질문 2 완료", value: 100 },
      ],
      metadata: {
        totalSessions: 100,
        totalStarted: 100,
        totalCompleted: 100,
        completionRate: 100,
        actions: [
          {
            id: "action1",
            title: "질문 1",
            order: 1,
            entryCount: 100,
            responseCount: 100,
            entryToResponseRate: 100,
          },
          {
            id: "action2",
            title: "질문 2",
            order: 2,
            entryCount: 100,
            responseCount: 100,
            entryToResponseRate: 100,
          },
        ],
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**완벽한 완주율 시나리오**

100명 전원이 모든 단계를 완료한 이상적인 경우입니다.
- 이탈자: 0명
- 최종 완주율: 100%

이탈 노드가 표시되지 않아 깔끔한 플로우를 보여줍니다.`,
      },
    },
  },
};
