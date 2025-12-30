import { ProgressBarV2 } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import * as React from "react";

const meta: Meta<typeof ProgressBarV2> = {
  title: "Common/ProgressBarV2",
  component: ProgressBarV2,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# ProgressBarV2

진행률을 시각적으로 표시하는 개선된 프로그레스 바 컴포넌트입니다. 배지와 다양한 variant를 지원하며, \`badgeVariant\`에 따라 프로그레스 바의 색상이 자동으로 결정됩니다.

## 사용법

\`\`\`tsx
import { ProgressBarV2 } from "@repo/ui/components";

<ProgressBarV2 value={50} />
<ProgressBarV2 value={75} variant="loading" badgeVariant="loading" />
<ProgressBarV2 
  value={80} 
  variant="error"
  badgeVariant="error"
  containerClassName="w-80"
/>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`number\` | - | 진행률 (0-100) |
| \`variant\` | \`"default" \| "error" \| "loading"\` | \`"default"\` | 프로그레스 바의 시각적 스타일 (badgeVariant가 설정되면 무시됨) |
| \`badgeVariant\` | \`"success" \| "error" \| "loading" \| undefined\` | \`undefined\` | 배지의 상태. 이 값에 따라 프로그레스 바 색상이 자동 결정됨 (success→default, error→error, loading→loading). \`undefined\`일 경우 Badge가 표시되지 않음 |
| \`isBadgeVisible\` | \`boolean\` | \`false\` | 배지 표시 여부 |
| \`currentOrder\` | \`number\` | - | 현재 순서 (variant가 없을 때 "currentOrder / totalOrder" 형식으로 표시) |
| \`totalOrder\` | \`number\` | - | 전체 순서 (variant가 없을 때 "currentOrder / totalOrder" 형식으로 표시) |
| \`containerClassName\` | \`string\` | - | 배경 컨테이너의 CSS 클래스 |
| \`indicatorClassName\` | \`string\` | - | 진행 표시 인디케이터의 CSS 클래스 |

## 특징

- ✅ 0-100 범위의 진행률 표시
- ✅ 상태별 variant 지원 (default, error, loading)
- ✅ 배지로 상태 표시 (success, error, loading) - 아이콘 포함
- ✅ 순서 표시 (currentOrder / totalOrder) - variant가 없을 때
- ✅ badgeVariant에 따라 프로그레스 바 색상 자동 결정
- ✅ 부드러운 애니메이션 전환 (배지 및 로딩 아이콘)
- ✅ 배경과 인디케이터 개별 스타일 커스터마이징
- ✅ Radix UI 기반의 접근성
- ✅ TypeScript 타입 안전성

## 예시

\`\`\`tsx
// 기본 사용
<ProgressBarV2 value={50} />

// 로딩 상태 (badgeVariant에 따라 프로그레스 바가 자동으로 loading 색상)
<ProgressBarV2 value={60} badgeVariant="loading" isBadgeVisible={true} />

// 에러 상태 (badgeVariant에 따라 프로그레스 바가 자동으로 error 색상)
<ProgressBarV2 value={30} badgeVariant="error" isBadgeVisible={true} />

// 성공 상태 (badgeVariant에 따라 프로그레스 바가 자동으로 default 색상)
<ProgressBarV2 value={100} badgeVariant="success" isBadgeVisible={true} />

// 순서 표시 (variant가 없을 때 currentOrder / totalOrder 형식)
<ProgressBarV2 value={60} currentOrder={3} totalOrder={5} isBadgeVisible={true} />
\`\`\``,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "진행률 (0-100)",
    },
    variant: {
      control: { type: "select" },
      options: ["default", "error", "loading"],
      description: "프로그레스 바의 시각적 스타일",
    },
    badgeVariant: {
      control: { type: "select" },
      options: [undefined, "success", "error", "loading"],
      description: "배지의 상태. undefined일 경우 Badge가 표시되지 않음",
    },
    isBadgeVisible: {
      control: { type: "boolean" },
      description: "배지 표시 여부",
    },
    containerClassName: {
      control: { type: "text" },
      description: "배경 컨테이너의 CSS 클래스",
    },
    indicatorClassName: {
      control: { type: "text" },
      description: "진행 표시 인디케이터의 CSS 클래스",
    },
    currentOrder: {
      control: { type: "number", min: 0 },
      description: "현재 순서 (variant가 없을 때 표시)",
    },
    totalOrder: {
      control: { type: "number", min: 0 },
      description: "전체 순서 (variant가 없을 때 표시)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
    variant: "default",
    isBadgeVisible: false,
  },
  render: args => (
    <div className="w-80">
      <ProgressBarV2 {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Badge Variant에 따른 자동 색상 결정</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-gray-600">badgeVariant: success → default 색상</p>
            <div className="w-80">
              <ProgressBarV2 value={80} badgeVariant="success" isBadgeVisible={true} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">badgeVariant: error → error 색상</p>
            <div className="w-80">
              <ProgressBarV2 value={50} badgeVariant="error" isBadgeVisible={true} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">badgeVariant: loading → loading 색상</p>
            <div className="w-80">
              <ProgressBarV2 value={65} badgeVariant="loading" isBadgeVisible={true} />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">
          Variant 직접 지정 (badgeVariant가 undefined일 때만 적용)
        </h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-gray-600">variant: default</p>
            <div className="w-80">
              <ProgressBarV2 value={60} variant="default" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">variant: error</p>
            <div className="w-80">
              <ProgressBarV2 value={40} variant="error" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">variant: loading</p>
            <div className="w-80">
              <ProgressBarV2 value={75} variant="loading" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Badge Variants (아이콘 포함)</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-gray-600">badgeVariant: undefined (배지 없음)</p>
            <div className="w-80">
              <ProgressBarV2 value={50} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">
              순서 표시 (variant 없음, currentOrder / totalOrder)
            </p>
            <div className="w-80">
              <ProgressBarV2 value={60} currentOrder={3} totalOrder={5} isBadgeVisible={true} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">success (Check 아이콘 + default 색상)</p>
            <div className="w-80">
              <ProgressBarV2 value={100} badgeVariant="success" isBadgeVisible={true} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">error (AlertCircle 아이콘 + error 색상)</p>
            <div className="w-80">
              <ProgressBarV2 value={30} badgeVariant="error" isBadgeVisible={true} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">
              loading (Loader2Icon 아이콘 + loading 색상, 회전 애니메이션)
            </p>
            <div className="w-80">
              <ProgressBarV2 value={65} badgeVariant="loading" isBadgeVisible={true} />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">Badge Visibility</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-gray-600">isBadgeVisible: false (기본값)</p>
            <div className="w-80">
              <ProgressBarV2 value={60} badgeVariant="loading" isBadgeVisible={false} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">isBadgeVisible: true</p>
            <div className="w-80">
              <ProgressBarV2 value={60} badgeVariant="loading" isBadgeVisible={true} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">success + visible</p>
            <div className="w-80">
              <ProgressBarV2 value={100} badgeVariant="success" isBadgeVisible={true} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">error + visible</p>
            <div className="w-80">
              <ProgressBarV2 value={30} badgeVariant="error" isBadgeVisible={true} />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">Progress Values</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-gray-600">0% - 시작</p>
            <div className="w-80">
              <ProgressBarV2 value={0} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">25% - 1/4 진행</p>
            <div className="w-80">
              <ProgressBarV2 value={25} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">50% - 절반 진행</p>
            <div className="w-80">
              <ProgressBarV2 value={50} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">75% - 3/4 진행</p>
            <div className="w-80">
              <ProgressBarV2 value={75} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">100% - 완료</p>
            <div className="w-80">
              <ProgressBarV2 value={100} />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">Badge Variant 우선순위</h3>
        <p className="mb-3 text-xs text-gray-500">
          badgeVariant가 설정되면 variant는 무시되고, badgeVariant에 따라 프로그레스 바 색상이 자동
          결정됩니다.
        </p>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-gray-600">
              badgeVariant: loading (variant 무시, loading 색상 적용)
            </p>
            <div className="w-80">
              <ProgressBarV2
                value={60}
                variant="default"
                badgeVariant="loading"
                isBadgeVisible={true}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">
              badgeVariant: error (variant 무시, error 색상 적용)
            </p>
            <div className="w-80">
              <ProgressBarV2
                value={40}
                variant="default"
                badgeVariant="error"
                isBadgeVisible={true}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">
              badgeVariant: success (variant 무시, default 색상 적용)
            </p>
            <div className="w-80">
              <ProgressBarV2
                value={100}
                variant="error"
                badgeVariant="success"
                isBadgeVisible={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);
    const [variant, setVariant] = React.useState<"default" | "error" | "loading">("default");
    const [badgeVariant, setBadgeVariant] = React.useState<
      "success" | "error" | "loading" | undefined
    >(undefined);
    const [isBadgeVisible, setIsBadgeVisible] = React.useState(false);
    const [currentOrder, setCurrentOrder] = React.useState<number | undefined>(3);
    const [totalOrder, setTotalOrder] = React.useState<number | undefined>(5);

    const increase = () => {
      setProgress(prev => Math.min(prev + 10, 100));
    };

    const decrease = () => {
      setProgress(prev => Math.max(prev - 10, 0));
    };

    const reset = () => {
      setProgress(0);
      setVariant("default");
      setBadgeVariant(undefined);
      setIsBadgeVisible(false);
      setCurrentOrder(3);
      setTotalOrder(5);
    };

    const effectiveVariant = badgeVariant
      ? badgeVariant === "success"
        ? "default"
        : badgeVariant
      : variant;

    return (
      <div style={{ padding: "40px" }}>
        <div className="mb-4 w-80">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <ProgressBarV2
            value={progress}
            variant={variant}
            badgeVariant={badgeVariant}
            isBadgeVisible={isBadgeVisible}
            currentOrder={currentOrder}
            totalOrder={totalOrder}
          />
          <p className="mt-1 text-xs text-gray-500">현재 프로그레스 바 색상: {effectiveVariant}</p>
        </div>

        <div className="mb-4 space-y-3">
          <div>
            <div className="mb-1 block text-xs font-medium">
              Badge Variant (이 값에 따라 프로그레스 바 색상이 자동 결정됨)
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBadgeVariant(undefined)}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  badgeVariant === undefined
                    ? "bg-violet-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                undefined
              </button>
              {(["success", "error", "loading"] as const).map(bv => (
                <button
                  key={bv}
                  type="button"
                  onClick={() => setBadgeVariant(bv)}
                  className={`rounded px-3 py-1 text-xs font-medium ${
                    badgeVariant === bv
                      ? "bg-violet-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {bv}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {badgeVariant === undefined
                ? "variant prop이 적용됩니다"
                : `프로그레스 바 색상: ${badgeVariant === "success" ? "default" : badgeVariant}`}
            </p>
          </div>
          <div>
            <div className="mb-1 block text-xs font-medium">
              Variant (badgeVariant가 undefined일 때만 적용)
            </div>
            <div className="flex gap-2">
              {(["default", "error", "loading"] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setVariant(v);
                    setBadgeVariant(undefined);
                  }}
                  disabled={badgeVariant !== undefined}
                  className={`rounded px-3 py-1 text-xs font-medium ${
                    variant === v && badgeVariant === undefined
                      ? "bg-violet-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 block text-xs font-medium">Badge Visibility</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsBadgeVisible(false)}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  !isBadgeVisible ? "bg-violet-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                숨김
              </button>
              <button
                type="button"
                onClick={() => setIsBadgeVisible(true)}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  isBadgeVisible ? "bg-violet-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                표시
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="current-order" className="mb-1 block text-xs font-medium">
              Current Order
            </label>
            <input
              id="current-order"
              type="number"
              min="0"
              value={currentOrder ?? ""}
              onChange={e =>
                setCurrentOrder(e.target.value === "" ? undefined : Number(e.target.value))
              }
              className="w-full rounded border border-gray-300 px-3 py-1 text-xs"
              placeholder="현재 순서"
            />
          </div>
          <div>
            <label htmlFor="total-order" className="mb-1 block text-xs font-medium">
              Total Order
            </label>
            <input
              id="total-order"
              type="number"
              min="0"
              value={totalOrder ?? ""}
              onChange={e =>
                setTotalOrder(e.target.value === "" ? undefined : Number(e.target.value))
              }
              className="w-full rounded border border-gray-300 px-3 py-1 text-xs"
              placeholder="전체 순서"
            />
            <p className="mt-1 text-xs text-gray-500">
              {badgeVariant === undefined && currentOrder !== undefined && totalOrder !== undefined
                ? `표시: ${currentOrder} / ${totalOrder}`
                : "variant가 없을 때만 표시됩니다"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={decrease}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
          >
            -10%
          </button>
          <button
            type="button"
            onClick={increase}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
          >
            +10%
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
          >
            초기화
          </button>
        </div>
      </div>
    );
  },
};
