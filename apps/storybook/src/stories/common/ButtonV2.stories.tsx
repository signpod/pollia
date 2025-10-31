import { ButtonV2 } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ChevronRight, Heart, Plus, Settings } from "lucide-react";

const meta: Meta<typeof ButtonV2> = {
  title: "Common/ButtonV2",
  component: ButtonV2,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# ButtonV2

개선된 버튼 컴포넌트입니다. ButtonText를 활용하여 아이콘과 텍스트를 효율적으로 관리합니다.

## 사용법

\`\`\`tsx
import { ButtonV2 } from "@repo/ui/components";
import { Plus } from "lucide-react";

<ButtonV2 variant="primary" leftIcon={Plus}>
  추가하기
</ButtonV2>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary"],
      description: "버튼의 시각적 스타일",
    },
    size: {
      control: { type: "select" },
      options: ["medium", "large"],
      description: "버튼 크기",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
    required: {
      control: { type: "boolean" },
      description: "필수 표시 여부 (*)",
    },
    asChild: {
      control: { type: "boolean" },
      description: "자식 컴포넌트로 렌더링",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 버튼
export const Default: Story = {
  args: {
    children: "Button",
  },
};

// 모든 variant 스토리
export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Button Variants</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="primary">Primary</ButtonV2>
          <ButtonV2 variant="secondary">Secondary</ButtonV2>
          <ButtonV2 variant="tertiary">Tertiary</ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">With Left Icon</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="primary" leftIcon={Plus}>
            Primary
          </ButtonV2>
          <ButtonV2 variant="secondary" leftIcon={Plus}>
            Secondary
          </ButtonV2>
          <ButtonV2 variant="tertiary" leftIcon={Plus}>
            Tertiary
          </ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">With Right Icon</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="primary" rightIcon={ChevronRight}>
            Primary
          </ButtonV2>
          <ButtonV2 variant="secondary" rightIcon={ChevronRight}>
            Secondary
          </ButtonV2>
          <ButtonV2 variant="tertiary" rightIcon={ChevronRight}>
            Tertiary
          </ButtonV2>
        </div>
      </div>
    </div>
  ),
};

// 크기별
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Large (Default)</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 size="large" variant="primary">
            Large Button
          </ButtonV2>
          <ButtonV2 size="large" variant="secondary" leftIcon={Plus}>
            With Icon
          </ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Medium</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 size="medium" variant="primary">
            Medium Button
          </ButtonV2>
          <ButtonV2 size="medium" variant="secondary" leftIcon={Plus}>
            With Icon
          </ButtonV2>
        </div>
      </div>
    </div>
  ),
};

// 비활성화 상태
export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Disabled States</h3>
      <div className="flex flex-wrap gap-4">
        <ButtonV2 variant="primary" disabled>
          Primary
        </ButtonV2>
        <ButtonV2 variant="secondary" disabled>
          Secondary
        </ButtonV2>
        <ButtonV2 variant="tertiary" disabled>
          Tertiary
        </ButtonV2>
      </div>
    </div>
  ),
};

// 필수 표시
export const Required: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Required Indicator (*)</h3>
      <div className="flex flex-wrap gap-4">
        <ButtonV2 variant="primary" required>
          필수 입력
        </ButtonV2>
        <ButtonV2 variant="secondary" required leftIcon={Plus}>
          항목 추가
        </ButtonV2>
        <ButtonV2 variant="tertiary" required>
          선택 필수
        </ButtonV2>
      </div>
    </div>
  ),
};

// 아이콘 조합
export const IconCombinations: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Left Icon Only</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="primary" leftIcon={Plus}>
            추가하기
          </ButtonV2>
          <ButtonV2 variant="secondary" leftIcon={Heart}>
            좋아요
          </ButtonV2>
          <ButtonV2 variant="tertiary" leftIcon={Settings}>
            설정
          </ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Right Icon Only</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="primary" rightIcon={ChevronRight}>
            다음
          </ButtonV2>
          <ButtonV2 variant="secondary" rightIcon={ChevronRight}>
            계속하기
          </ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Both Icons</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="primary" leftIcon={Plus} rightIcon={ChevronRight}>
            추가 후 이동
          </ButtonV2>
          <ButtonV2 variant="secondary" leftIcon={Heart} rightIcon={ChevronRight}>
            좋아요 및 공유
          </ButtonV2>
        </div>
      </div>
    </div>
  ),
};

// 상호작용 상태
export const InteractionStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Primary States</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="primary">Default</ButtonV2>
          <ButtonV2 variant="primary" className="hover:bg-zinc-600">
            Hover
          </ButtonV2>
          <ButtonV2 variant="primary" className="bg-zinc-950">
            Active
          </ButtonV2>
          <ButtonV2 variant="primary" disabled>
            Disabled
          </ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Secondary States</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="secondary">Default</ButtonV2>
          <ButtonV2 variant="secondary" className="ring-violet-500">
            Hover
          </ButtonV2>
          <ButtonV2 variant="secondary" className="bg-violet-50 text-violet-500 ring-violet-500">
            Active
          </ButtonV2>
          <ButtonV2 variant="secondary" disabled>
            Disabled
          </ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Tertiary States</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="tertiary">Default</ButtonV2>
          <ButtonV2 variant="tertiary" className="bg-zinc-50">
            Hover
          </ButtonV2>
          <ButtonV2 variant="tertiary" className="bg-violet-50 text-violet-500">
            Active
          </ButtonV2>
          <ButtonV2 variant="tertiary" disabled>
            Disabled
          </ButtonV2>
        </div>
      </div>
    </div>
  ),
};

// 실제 사용 사례
export const RealWorldUseCases: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Form Actions</h3>
        <div className="flex gap-3">
          <ButtonV2 variant="tertiary">취소</ButtonV2>
          <ButtonV2 variant="primary">저장하기</ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Create Actions</h3>
        <div className="flex w-80 flex-col gap-3">
          <ButtonV2 variant="primary" leftIcon={Plus}>
            새 투표 만들기
          </ButtonV2>
          <ButtonV2 variant="secondary" leftIcon={Plus}>
            템플릿에서 시작
          </ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Navigation</h3>
        <div className="flex w-80 flex-col gap-3">
          <ButtonV2 variant="primary" rightIcon={ChevronRight}>
            다음 단계로
          </ButtonV2>
          <ButtonV2 variant="secondary" rightIcon={ChevronRight}>
            자세히 보기
          </ButtonV2>
        </div>
      </div>
    </div>
  ),
};
