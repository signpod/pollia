import { MissionFunnelChart } from "@/app/admin/components/MissionFunnelChart";
import type { MissionFunnelData } from "@/types/dto";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Admin/MissionFunnelChart",
  component: MissionFunnelChart,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MissionFunnelChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData: MissionFunnelData = {
  nodes: [
    { id: "start", name: "시작", type: "start", count: 100 },
    { id: "action1_entry", name: "질문 1 (진입)", type: "entry", count: 90 },
    { id: "drop_action1_entry", name: "이탈", type: "drop", count: 0 },
    { id: "action1_response", name: "질문 1 (응답)", type: "response", count: 80 },
    { id: "drop_action1_response", name: "이탈", type: "drop", count: 0 },
    { id: "action2_entry", name: "질문 2 (진입)", type: "entry", count: 80 },
    { id: "drop_action2_entry", name: "이탈", type: "drop", count: 0 },
    { id: "action2_response", name: "질문 2 (응답)", type: "response", count: 70 },
    { id: "drop_action2_response", name: "이탈", type: "drop", count: 0 },
  ],
  links: [
    { source: "start", target: "action1_entry", value: 90 },
    { source: "start", target: "drop_action1_entry", value: 10 },
    { source: "action1_entry", target: "action1_response", value: 80 },
    { source: "action1_entry", target: "drop_action1_response", value: 10 },
    { source: "action1_response", target: "action2_entry", value: 80 },
    { source: "action2_entry", target: "action2_response", value: 70 },
    { source: "action2_entry", target: "drop_action2_response", value: 10 },
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
        { id: "start", name: "시작", type: "start", count: 1000 },
        { id: "action1_entry", name: "질문 1 (진입)", type: "entry", count: 800 },
        { id: "drop_action1_entry", name: "이탈", type: "drop", count: 0 },
        { id: "action1_response", name: "질문 1 (응답)", type: "response", count: 500 },
        { id: "drop_action1_response", name: "이탈", type: "drop", count: 0 },
        { id: "action2_entry", name: "질문 2 (진입)", type: "entry", count: 500 },
        { id: "drop_action2_entry", name: "이탈", type: "drop", count: 0 },
        { id: "action2_response", name: "질문 2 (응답)", type: "response", count: 200 },
        { id: "drop_action2_response", name: "이탈", type: "drop", count: 0 },
      ],
      links: [
        { source: "start", target: "action1_entry", value: 800 },
        { source: "start", target: "drop_action1_entry", value: 200 },
        { source: "action1_entry", target: "action1_response", value: 500 },
        { source: "action1_entry", target: "drop_action1_response", value: 300 },
        { source: "action1_response", target: "action2_entry", value: 500 },
        { source: "action2_entry", target: "action2_response", value: 200 },
        { source: "action2_entry", target: "drop_action2_response", value: 300 },
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
        { id: "start", name: "시작", type: "start", count: 100 },
        { id: "action1_entry", name: "질문 1 (진입)", type: "entry", count: 100 },
        { id: "drop_action1_entry", name: "이탈", type: "drop", count: 0 },
        { id: "action1_response", name: "질문 1 (응답)", type: "response", count: 100 },
        { id: "drop_action1_response", name: "이탈", type: "drop", count: 0 },
        { id: "action2_entry", name: "질문 2 (진입)", type: "entry", count: 100 },
        { id: "drop_action2_entry", name: "이탈", type: "drop", count: 0 },
        { id: "action2_response", name: "질문 2 (응답)", type: "response", count: 100 },
        { id: "drop_action2_response", name: "이탈", type: "drop", count: 0 },
      ],
      links: [
        { source: "start", target: "action1_entry", value: 100 },
        { source: "action1_entry", target: "action1_response", value: 100 },
        { source: "action1_response", target: "action2_entry", value: 100 },
        { source: "action2_entry", target: "action2_response", value: 100 },
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
