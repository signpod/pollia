import { ResultDistributionAccordion } from "@/app/(site)/(main)/editor/missions/[missionId]/components/stats/ResultDistributionAccordion";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { EmptyStatsMockProvider, MOCK_MISSION_ID, StatsMockProvider } from "./StatsMockProvider";

const meta: Meta<typeof ResultDistributionAccordion> = {
  title: "Pollia/Stats/ResultDistributionAccordion",
  component: ResultDistributionAccordion,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <StatsMockProvider>
        <Story />
      </StatsMockProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    missionId: MOCK_MISSION_ID,
  },
};

export const Empty: Story = {
  args: {
    missionId: MOCK_MISSION_ID,
  },
  decorators: [
    Story => (
      <EmptyStatsMockProvider>
        <Story />
      </EmptyStatsMockProvider>
    ),
  ],
};
