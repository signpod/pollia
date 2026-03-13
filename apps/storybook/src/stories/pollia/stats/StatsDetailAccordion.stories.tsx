import { StatsDetailAccordion } from "@/app/(site)/(main)/editor/missions/[missionId]/components/stats/StatsDetailAccordion";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { MOCK_MISSION_ID, StatsMockProvider } from "./StatsMockProvider";

const meta: Meta<typeof StatsDetailAccordion> = {
  title: "Pollia/Stats/StatsDetailAccordion",
  component: StatsDetailAccordion,
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
