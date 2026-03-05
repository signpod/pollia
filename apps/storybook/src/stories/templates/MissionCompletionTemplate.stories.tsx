import { ProfileHeaderView } from "@/components/common/ProfileHeaderView";
import { MissionCompletionTemplate } from "@/components/common/templates/MissionCompletionTemplate";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof MissionCompletionTemplate> = {
  title: "Templates/MissionCompletionTemplate",
  component: MissionCompletionTemplate,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# MissionCompletionTemplate

미션 완료 화면의 mainContent 영역을 담당하는 Template 컴포넌트입니다.

## 구성 요소

- 헤더 (ProfileHeaderView, 외부에서 주입)
- 완료 이미지 (선택)
- 미션 제목
- 완료 메시지 (제목 + 설명)
- 리워드 영역 (선택)
- 미션 공유 버튼 (선택)
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_IMAGE = "https://picsum.photos/800/600";
const SAMPLE_IMAGE_PORTRAIT = "https://picsum.photos/600/900";
const SAMPLE_TITLE = "미션을 완료했어요!";
const SAMPLE_MISSION_TITLE = "내가 웹소설 남주로 빙의한다면?";
const SAMPLE_DESCRIPTION = "<p>축하합니다! 미션을 성공적으로 완료했습니다.</p>";

const MOCK_USER = { name: "테스터" };
const MOCK_PROFILE_IMAGE = null;

function MockHeader() {
  return <ProfileHeaderView user={MOCK_USER} profileImageUrl={MOCK_PROFILE_IMAGE} />;
}

export const Default: Story = {
  render: () => (
    <MissionCompletionTemplate
      header={<MockHeader />}
      imageUrl={SAMPLE_IMAGE}
      missionTitle={SAMPLE_MISSION_TITLE}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
    />
  ),
};

export const WithPortraitImage: Story = {
  render: () => (
    <MissionCompletionTemplate
      header={<MockHeader />}
      imageUrl={SAMPLE_IMAGE_PORTRAIT}
      missionTitle={SAMPLE_MISSION_TITLE}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "세로 이미지가 있는 Template입니다.",
      },
    },
  },
};

export const WithoutImage: Story = {
  render: () => (
    <MissionCompletionTemplate
      header={<MockHeader />}
      missionTitle={SAMPLE_MISSION_TITLE}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "이미지가 없는 Template입니다.",
      },
    },
  },
};

export const LongDescription: Story = {
  render: () => (
    <MissionCompletionTemplate
      header={<MockHeader />}
      imageUrl={SAMPLE_IMAGE}
      missionTitle={SAMPLE_MISSION_TITLE}
      title="축하합니다!"
      description={`
        <p>미션을 성공적으로 완료하셨습니다.</p>
        <p>이번 미션을 통해 새로운 경험을 하셨기를 바랍니다.</p>
        <p>앞으로도 다양한 미션에 참여해 주세요!</p>
        <p><strong>감사합니다.</strong></p>
      `}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "긴 설명 텍스트가 있는 Template입니다.",
      },
    },
  },
};

export const TitleOnly: Story = {
  render: () => (
    <MissionCompletionTemplate
      header={<MockHeader />}
      imageUrl={SAMPLE_IMAGE}
      missionTitle={SAMPLE_MISSION_TITLE}
      title={SAMPLE_TITLE}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "제목만 있고 설명이 없는 Template입니다.",
      },
    },
  },
};

export const WithoutHeader: Story = {
  render: () => (
    <MissionCompletionTemplate
      imageUrl={SAMPLE_IMAGE}
      missionTitle={SAMPLE_MISSION_TITLE}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "헤더가 없는 Template입니다.",
      },
    },
  },
};
