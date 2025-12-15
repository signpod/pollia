import { MissionReward } from "@/app/mission/[missionId]/components";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof MissionReward> = {
  title: "Mission/MissionReward",
  component: MissionReward,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# SurveyReward

설문조사 리워드 정보를 표시하는 아코디언 컴포넌트입니다.

## 특징

- 접기/펼치기 기능이 있는 아코디언 UI
- 접었을 때: 가로 레이아웃으로 요약 정보 표시 (텍스트 말줄임 처리)
- 펼쳤을 때: 세로 레이아웃으로 전체 정보 표시
- 리워드 이미지 지원 (원형 배경에 표시)

## 사용법

\`\`\`tsx
import { SurveyReward } from "./components/SurveyReward";

<SurveyReward
  rewardName="1등 : 신세계 상품권 5만원권, 1명"
  rewardImage="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop"
  rewardDescription="매월 추첨을 통해 경품을 지급하며, 당첨자 결과는 고객센터에 게시됩니다."
/>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    rewardName: {
      control: { type: "text" },
      description: "리워드 이름",
    },
    rewardImage: {
      control: { type: "text" },
      description: "리워드 이미지 URL (선택사항)",
    },
    rewardDescription: {
      control: { type: "text" },
      description: "리워드 설명 (선택사항)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본
export const Default: Story = {
  render: args => (
    <div className="w-full max-w-[390px]">
      <MissionReward {...args} />
    </div>
  ),
  args: {
    rewardName: "CU 바나나우유 기프티콘",
    rewardImage: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop",
    rewardDescription: "설문 완료 후 즉시 제공",
  },
};

// 옵셔널 값 조합 테스트
export const OptionalProps: Story = {
  render: () => (
    <div className="w-full max-w-[390px] space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">모든 값 있음 (이름 + 이미지 + 설명)</h3>
        <MissionReward
          rewardName="CU 바나나우유 기프티콘"
          rewardImage="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop"
          rewardDescription="설문 완료 후 즉시 제공"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">이름 + 설명 (이미지 없음)</h3>
        <MissionReward
          rewardName="CU 바나나우유 기프티콘"
          rewardDescription="설문 완료 후 즉시 제공"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">이름 + 이미지 (설명 없음)</h3>
        <MissionReward
          rewardName="CU 바나나우유 기프티콘"
          rewardImage="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">이름만 (이미지, 설명 없음)</h3>
        <MissionReward rewardName="참여 감사 포인트 100P" />
      </div>
    </div>
  ),
};

// 이미지 없는 케이스들
export const WithoutImage: Story = {
  render: () => (
    <div className="w-full max-w-[390px] space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">짧은 텍스트</h3>
        <MissionReward
          rewardName="스타벅스 아메리카노"
          rewardDescription="설문 완료 후 즉시 제공"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">긴 텍스트</h3>
        <MissionReward
          rewardName="1등 : 신세계 상품권 5만원권, 1명
2등 : 신세계 상품권 3만원권, 2명
3등 : 신세계 상품권 1만원권, 5명"
          rewardDescription="매월 추첨을 통해 경품을 지급하며, 당첨자 결과는 고객센터에 게시됩니다."
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">이름만 (설명도 없음)</h3>
        <MissionReward rewardName="참여 포인트 적립" />
      </div>
    </div>
  ),
};

// 설명 없는 케이스들
export const WithoutDescription: Story = {
  render: () => (
    <div className="w-full max-w-[390px] space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">이미지 + 짧은 이름</h3>
        <MissionReward
          rewardName="스타벅스 아메리카노"
          rewardImage="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">이미지 + 긴 이름</h3>
        <MissionReward
          rewardName="1등 : 신세계 상품권 5만원권, 1명
2등 : 신세계 상품권 3만원권, 2명"
          rewardImage="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">이름만 (이미지도 없음)</h3>
        <MissionReward rewardName="참여 포인트 적립" />
      </div>
    </div>
  ),
};

// 긴 텍스트 (여러 줄)
export const LongText: Story = {
  render: args => (
    <div className="w-full max-w-[390px]">
      <MissionReward {...args} />
    </div>
  ),
  args: {
    rewardName:
      "1등 : 신세계 상품권 5만원권, 1명\n2등 : 신세계 상품권 3만원권, 2명\n3등 : 신세계 상품권 1만원권, 5명\n4등 : 스타벅스 기프티콘, 10명",
    rewardImage: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop",
    rewardDescription:
      "매월 추첨을 통해 경품을 지급하며, 당첨자 결과는 고객센터에 게시됩니다.\n당첨자에게는 설문에 입력하신 휴대폰 번호로 기프티콘이 개별 발송될 예정입니다.",
  },
};

// 개행 테스트
export const LineBreakTest: Story = {
  render: () => (
    <div className="w-full max-w-[390px] space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">이름에만 개행</h3>
        <MissionReward
          rewardName={"1등 상품\n2등 상품\n3등 상품"}
          rewardImage="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop"
          rewardDescription="설문 완료 후 즉시 제공"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">설명에만 개행</h3>
        <MissionReward
          rewardName="CU 바나나우유 기프티콘"
          rewardImage="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop"
          rewardDescription={
            "설문 완료 후 즉시 제공됩니다.\n휴대폰 번호로 발송됩니다.\n유효기간은 30일입니다."
          }
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">이름과 설명 모두 개행</h3>
        <MissionReward
          rewardName={
            "1등 : 신세계 상품권 5만원권, 1명\n2등 : 신세계 상품권 3만원권, 2명\n3등 : 신세계 상품권 1만원권, 5명"
          }
          rewardImage="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop"
          rewardDescription={
            "매월 추첨을 통해 경품을 지급합니다.\n당첨자 결과는 고객센터에 게시됩니다.\n휴대폰 번호로 기프티콘이 발송됩니다."
          }
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">긴 텍스트 + 개행 (접었을 때 truncate 확인)</h3>
        <MissionReward
          rewardName={
            "1등 : 신세계 상품권 5만원권 (매우 귀한 상품입니다), 1명\n2등 : 신세계 상품권 3만원권 (좋은 상품입니다), 2명\n3등 : 신세계 상품권 1만원권 (감사 상품입니다), 5명"
          }
          rewardImage="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop"
          rewardDescription={
            "매월 마지막 주 금요일에 추첨을 진행합니다.\n당첨자 발표는 추첨 후 영업일 기준 3일 이내에 진행됩니다.\n당첨자에게는 설문 시 입력하신 휴대폰 번호로 개별 연락드립니다.\n경품 수령은 당첨 통보 후 30일 이내에 완료해주셔야 합니다."
          }
        />
      </div>
    </div>
  ),
};

// 다양한 이미지 형태
export const DifferentImages: Story = {
  render: () => (
    <div className="w-full max-w-[390px] space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">가로로 긴 이미지</h3>
        <MissionReward
          rewardName="스타벅스 아메리카노"
          rewardImage="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=100&fit=crop"
          rewardDescription="설문 완료 후 즉시 제공"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">세로로 긴 이미지</h3>
        <MissionReward
          rewardName="CU 바나나우유"
          rewardImage="https://images.unsplash.com/photo-1481391032119-d89fee407e44?w=100&h=200&fit=crop"
          rewardDescription="설문 완료 후 즉시 제공"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">정사각형 이미지</h3>
        <MissionReward
          rewardName="신세계 상품권"
          rewardImage="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop"
          rewardDescription="설문 완료 후 즉시 제공"
        />
      </div>
    </div>
  ),
};

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => (
    <div className="w-full max-w-[390px] space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">단일 리워드</h3>
        <MissionReward
          rewardName="CU 바나나우유 기프티콘"
          rewardImage="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop"
          rewardDescription="설문 완료 후 즉시 제공"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">추첨형 리워드</h3>
        <MissionReward
          rewardName="1등 : 신세계 상품권 5만원권, 1명 
2등 : 신세계 상품권 3만원권, 2명
3등 : 신세계 상품권 1만원권, 5명
4등 : 스타벅스 기프티콘, 10명"
          rewardImage="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop"
          rewardDescription="매월 추첨을 통해 경품을 지급하며, 당첨자 결과는 고객센터에 게시됩니다. 당첨자에게는 설문에 입력하신 휴대폰 번호로 기프티콘이 개별 발송될 예정입니다."
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">간단한 리워드</h3>
        <MissionReward rewardName="참여 감사 포인트 100P" />
      </div>
    </div>
  ),
};

// 아코디언 동작 테스트
export const AccordionBehavior: Story = {
  render: () => (
    <div className="w-full max-w-[390px] space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">여러 개의 아코디언 (독립적으로 동작)</h3>
        <div className="space-y-4">
          <MissionReward
            rewardName="1등 리워드"
            rewardImage="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop"
            rewardDescription="설문 완료 후 추첨을 통해 지급됩니다."
          />
          <MissionReward
            rewardName="2등 리워드"
            rewardImage="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop"
            rewardDescription="설문 완료 후 추첨을 통해 지급됩니다."
          />
          <MissionReward
            rewardName="3등 리워드"
            rewardImage="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop"
            rewardDescription="설문 완료 후 추첨을 통해 지급됩니다."
          />
        </div>
      </div>
    </div>
  ),
};

// 모바일 화면 시뮬레이션
export const MobileView: Story = {
  render: () => (
    <div className="w-full max-w-[390px] min-h-[600px] bg-white p-5 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">설문조사 제목입니다</h2>
        <div className="text-sm text-gray-600 mb-6">
          <p>소요시간: 5분</p>
          <p>마감일: 2025.12.25 23:59</p>
        </div>
      </div>

      <MissionReward
        rewardName="1등 : 신세계 상품권 5만원권, 1명 
2등 : 신세계 상품권 3만원권, 2명
3등 : 신세계 상품권 1만원권, 5명
4등 : 스타벅스 기프티콘, 10명"
        rewardImage="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop"
        rewardDescription="매월 추첨을 통해 경품을 지급하며, 당첨자 결과는 고객센터에 게시됩니다. 당첨자에게는 설문에 입력하신 휴대폰 번호로 기프티콘이 개별 발송될 예정입니다."
      />

      <button type="button" className="w-full py-3 bg-zinc-800 text-white rounded-lg font-semibold">
        참여하고 리워드 받기
      </button>
    </div>
  ),
};

export const TruncationBug: Story = {
  render: () => (
    <div className="w-full max-w-[390px] space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-red-600">
          버그: 짧은 텍스트 + 개행 = 불필요한 아코디언
        </h3>
        <p className="mb-3 text-xs text-gray-600">
          현재 버그: collapsed view의 truncate 클래스 때문에 개행이 있는 짧은 텍스트도 항상
          아코디언이 표시됩니다. 실제로는 expanded view에서 충분히 짧게 표시되는데도 말이죠.
        </p>
        <MissionReward
          rewardName={"CU 바나나우유\n기프티콘"}
          rewardImage="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop"
          rewardDescription={"설문 완료 후\n즉시 제공"}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-green-600">비교: 개행 없는 짧은 텍스트</h3>
        <p className="mb-3 text-xs text-gray-600">
          동일한 길이지만 개행이 없으면 아코디언이 표시되지 않습니다.
        </p>
        <MissionReward
          rewardName="CU 바나나우유 기프티콘"
          rewardImage="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop"
          rewardDescription="설문 완료 후 즉시 제공"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-red-600">버그: 매우 짧은 텍스트 + 개행</h3>
        <p className="mb-3 text-xs text-gray-600">
          한 줄에 5글자씩만 있는데도 아코디언이 나타납니다.
        </p>
        <MissionReward rewardName={"CU\n기프티콘"} rewardDescription={"즉시\n제공"} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-green-600">정상: 실제로 긴 텍스트</h3>
        <p className="mb-3 text-xs text-gray-600">이 경우는 아코디언이 정상적으로 필요합니다.</p>
        <MissionReward
          rewardName="1등 : 신세계 상품권 5만원권, 1명 2등 : 신세계 상품권 3만원권, 2명"
          rewardImage="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop"
          rewardDescription="매월 추첨을 통해 경품을 지급하며, 당첨자 결과는 고객센터에 게시됩니다."
        />
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="text-sm font-bold mb-2">예상 결과 vs 실제 결과</h4>
        <ul className="text-xs space-y-1">
          <li>
            ❌ <strong>버그 케이스 1-3</strong>: 아코디언이 표시됨 (불필요)
          </li>
          <li>
            ✅ <strong>정상 케이스</strong>: 아코디언이 표시됨 (필요)
          </li>
        </ul>
        <p className="mt-3 text-xs text-gray-700">
          <strong>원인:</strong> collapsed view (truncate 클래스)를 측정하기 때문에 개행 문자가
          있으면 항상 scrollWidth &gt; clientWidth가 됩니다.
          <br />
          <strong>해결:</strong> expanded view를 측정하거나, 초기에 expanded 상태로 렌더링 후
          측정해야 합니다.
        </p>
      </div>
    </div>
  ),
};
