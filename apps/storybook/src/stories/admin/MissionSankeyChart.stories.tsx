import { MissionSankeyChart } from "@/app/admin/components/MissionSankeyChart";
import type { MissionFunnelData } from "@/types/dto";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Admin/MissionSankeyChart",
  component: MissionSankeyChart,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
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
};
