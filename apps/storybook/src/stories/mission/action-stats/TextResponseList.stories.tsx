import { TextResponseList } from "@/app/(site)/(main)/editor/missions/[missionId]/components/action-stats/TextResponseList";
import type { TextActionStats } from "@/types/dto/action-stats";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof TextResponseList> = {
  title: "Mission/ActionStats/TextResponseList",
  component: TextResponseList,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# TextResponseList

주관식(SUBJECTIVE), 단답형(SHORT_TEXT) 액션의 텍스트 응답을 리스트로 표시합니다.

## 특징
- 5개씩 페이지네이션 (더보기 버튼)
- 서버에서 최대 50개 샘플 전달
- 50개 초과 시 hasMore 표시
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockData = (overrides: Partial<TextActionStats> = {}): TextActionStats => ({
  actionId: "action-1",
  title: "개선 사항을 자유롭게 적어주세요",
  actionType: "SUBJECTIVE",
  totalResponses: 8,
  type: "text",
  samples: [
    "UI가 깔끔하고 사용하기 편리합니다.",
    "로딩 속도가 좀 더 빨라졌으면 좋겠습니다.",
    "다크 모드 지원이 있으면 좋겠어요.",
    "모바일에서도 잘 작동합니다. 다만 글자 크기가 조금 작아요.",
    "전체적으로 만족합니다. 알림 기능이 추가되면 더 좋을 것 같아요.",
    "검색 기능이 더 정교해졌으면 합니다.",
    "가격 대비 훌륭한 서비스입니다.",
    "고객 지원이 빠르고 친절했습니다.",
  ],
  hasMore: false,
  ...overrides,
});

export const Default: Story = {
  args: {
    data: createMockData(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "8개 응답이 있는 기본 주관식 통계입니다. 초기에 5개가 표시되고 더보기로 나머지를 볼 수 있습니다.",
      },
    },
  },
};

export const FewResponses: Story = {
  args: {
    data: createMockData({
      totalResponses: 3,
      samples: ["좋은 서비스입니다.", "사용 방법이 직관적이에요.", "계속 이용할 예정입니다."],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "5개 미만의 응답이 있어 더보기 버튼이 표시되지 않는 경우입니다.",
      },
    },
  },
};

export const ManyResponses: Story = {
  args: {
    data: createMockData({
      title: "한 줄 소감",
      actionType: "SHORT_TEXT",
      totalResponses: 25,
      samples: Array.from({ length: 25 }, (_, i) => {
        const responses = [
          "매우 유용한 서비스입니다.",
          "UI 개선이 필요합니다.",
          "다음에도 참여하고 싶어요.",
          "친구에게 추천하고 싶습니다.",
          "조금 더 다양한 기능이 있으면 좋겠어요.",
          "처음 써봤는데 괜찮습니다.",
          "직관적인 사용성이 좋았어요.",
          "결제 과정이 조금 복잡합니다.",
          "빠른 응답 감사합니다.",
          "전반적으로 만족합니다.",
        ];
        return responses[i % responses.length]!;
      }),
      hasMore: false,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "25개 응답으로 여러 번 더보기를 눌러야 하는 경우입니다.",
      },
    },
  },
};

export const LongText: Story = {
  args: {
    data: createMockData({
      totalResponses: 3,
      samples: [
        "이 서비스를 사용하면서 가장 인상 깊었던 점은 사용자 경험이 매우 잘 설계되어 있다는 것입니다. 처음 접하는 사용자도 쉽게 이해할 수 있는 인터페이스와, 단계별로 안내해주는 흐름이 특히 좋았습니다. 다만 모바일 환경에서 일부 버튼이 너무 작게 표시되는 점은 개선이 필요해 보입니다.",
        "짧은 피드백입니다.",
        "전반적으로 우수하지만, 보고서 내보내기 기능에서 PDF 포맷이 깨지는 현상이 가끔 발생합니다. Chrome과 Safari에서 테스트해봤는데 Safari에서 더 자주 발생하는 것 같습니다. 참고 부탁드립니다.",
      ],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "긴 텍스트 응답이 포함된 경우입니다.",
      },
    },
  },
};

export const HasMoreFromServer: Story = {
  args: {
    data: createMockData({
      totalResponses: 120,
      samples: Array.from({ length: 50 }, (_, i) => `응답 ${i + 1}: 서비스에 대한 피드백입니다.`),
      hasMore: true,
    }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "서버에서 50개 샘플만 전달되고 실제로는 120개 응답이 있는 경우입니다. hasMore가 true입니다.",
      },
    },
  },
};

export const ZeroResponses: Story = {
  args: {
    data: createMockData({
      totalResponses: 0,
      samples: [],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "응답이 없는 경우 빈 상태를 표시합니다.",
      },
    },
  },
};
