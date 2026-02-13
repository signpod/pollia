import { MissionIntroPage } from "@/components/common/pages/MissionIntroPage";
import { MissionType } from "@prisma/client";
import { ButtonV2, FixedBottomLayout, Typo } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof MissionIntroPage> = {
  title: "Pages/MissionIntroPage",
  component: MissionIntroPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# MissionIntroPage

미션 인트로 전체 화면을 구성하는 Page 컴포넌트입니다.

## 구성 요소

- MissionIntroTemplate (이미지, 로고, 제목, 위젯, 스크롤 유도)
- MissionContentTemplate (탭, 상세 안내, 참여 혜택, 공유)
- 하단 고정 버튼 (bottomButton으로 외부 주입)
- 스크롤 기반 하단 blur/show 전환

## Props

| Prop | Type | Description |
|------|------|-------------|
| imageUrl | string \\| null | 미션 이미지 URL |
| contextBrandLogoUrl | string | MissionContentTemplate 스티키 헤더용 로고 |
| contextTitle | string | MissionContentTemplate 스티키 헤더용 제목 |
| bottomButton | ReactNode | 하단 고정 버튼 (외부 주입) |
| reward | object \\| null | 리워드 정보 (탭 개수 결정) |
| description | string \\| null | 상세 안내 HTML |
| missionType | MissionType | 미션 타입 |
`,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <FixedBottomLayout>
        <Story />
      </FixedBottomLayout>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_IMAGE = "https://picsum.photos/800/600";
const SAMPLE_LOGO = "https://picsum.photos/64/64";
const SAMPLE_TITLE = "미션 제목입니다";
const SAMPLE_DEADLINE = "2025년 3월 31일";
const SAMPLE_REWARD_NAME = "참여 기념품";
const SAMPLE_DESCRIPTION = "<p>미션 상세 안내 내용입니다. <strong>포맷</strong>이 적용됩니다.</p>";
const SAMPLE_REWARD_IMAGE = "https://picsum.photos/200/200";

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);

const MOCK_BOTTOM_BUTTON = (
  <div className="relative py-3 px-4 w-full">
    <ButtonV2 variant="primary" size="large" className="w-full">
      <Typo.ButtonText size="large" className="flex w-full items-center justify-center">
        지금 바로 참여하기
      </Typo.ButtonText>
    </ButtonV2>
  </div>
);

export const Default: Story = {
  render: () => (
    <MissionIntroPage
      imageUrl={SAMPLE_IMAGE}
      brandLogoUrl={SAMPLE_LOGO}
      title={SAMPLE_TITLE}
      formattedDeadline={SAMPLE_DEADLINE}
      isRequirePassword={false}
      showRewardWidget
      rewardName={SAMPLE_REWARD_NAME}
      showDeadlineWidget
      deadlineDate={futureDate}
      contextBrandLogoUrl={SAMPLE_LOGO}
      contextTitle={SAMPLE_TITLE}
      missionId="sample-mission-id"
      missionType={MissionType.GENERAL}
      missionTitle={SAMPLE_TITLE}
      missionImageUrl={SAMPLE_IMAGE}
      description={SAMPLE_DESCRIPTION}
      reward={{
        imageUrl: SAMPLE_REWARD_IMAGE,
        name: SAMPLE_REWARD_NAME,
        scheduledDate: futureDate,
      }}
      bottomButton={MOCK_BOTTOM_BUTTON}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "풀 스펙. 이미지, 위젯, 리워드(탭 2개), 공유 섹션, 하단 버튼 모두 포함. 스크롤 시 하단 버튼이 나타남.",
      },
    },
  },
};

export const WithoutReward: Story = {
  render: () => (
    <MissionIntroPage
      imageUrl={SAMPLE_IMAGE}
      brandLogoUrl={SAMPLE_LOGO}
      title={SAMPLE_TITLE}
      formattedDeadline={SAMPLE_DEADLINE}
      isRequirePassword={false}
      contextBrandLogoUrl={SAMPLE_LOGO}
      contextTitle={SAMPLE_TITLE}
      missionId="sample-mission-id"
      missionType={MissionType.GENERAL}
      missionTitle={SAMPLE_TITLE}
      missionImageUrl={SAMPLE_IMAGE}
      description={SAMPLE_DESCRIPTION}
      reward={null}
      bottomButton={MOCK_BOTTOM_BUTTON}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "리워드 없음 경곗값. 탭 1개(상세 안내)만 표시되고, useStickyTabHeader의 hasReward가 false.",
      },
    },
  },
};

export const WithoutBottomButton: Story = {
  render: () => (
    <MissionIntroPage
      imageUrl={SAMPLE_IMAGE}
      brandLogoUrl={SAMPLE_LOGO}
      title={SAMPLE_TITLE}
      formattedDeadline={SAMPLE_DEADLINE}
      isRequirePassword={false}
      showRewardWidget
      rewardName={SAMPLE_REWARD_NAME}
      contextBrandLogoUrl={SAMPLE_LOGO}
      contextTitle={SAMPLE_TITLE}
      missionId="sample-mission-id"
      missionType={MissionType.GENERAL}
      missionTitle={SAMPLE_TITLE}
      missionImageUrl={SAMPLE_IMAGE}
      description={SAMPLE_DESCRIPTION}
      reward={{
        imageUrl: SAMPLE_REWARD_IMAGE,
        name: SAMPLE_REWARD_NAME,
        scheduledDate: futureDate,
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "bottomButton 미전달 경곗값. 하단 고정 영역의 blur/show 전환은 있지만 버튼 내용 없음.",
      },
    },
  },
};
