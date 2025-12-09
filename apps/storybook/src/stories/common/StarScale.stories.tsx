import { Slider, StarScale } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

const meta: Meta<typeof StarScale> = {
  title: "Common/StarScale",
  component: StarScale,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# StarScale

별점 평가를 위한 슬라이더 컴포넌트입니다. 0.5 단위로 0.5부터 5까지 선택할 수 있으며, 드래그하여 값을 변경할 수 있습니다.

## 주요 기능

- 0.5 단위 선택 (0.5, 1.0, 1.5, ..., 5.0)
- 5개 별 표시
- 반쪽 별 표시 지원
- 최대값(5.0)일 때 웃는 얼굴 별 표시
- 터치/드래그 인터랙션 지원
- 내부 상태 관리 (외부 props 불필요)

## 사용법

\`\`\`tsx
import { StarScale } from "@repo/ui/components";

function Example() {
  return <StarScale />;
}
\`\`\`

## 동작 방식

- 슬라이더를 드래그하거나 클릭하여 별점을 선택합니다
- 0.5 단위로 값이 변경됩니다
- 선택된 값 이상의 별은 노란색으로 표시됩니다
- 선택된 값보다 0.5 작은 별은 반쪽 별로 표시됩니다
- 최대값(5.0)일 때는 웃는 얼굴 별이 표시됩니다
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex min-h-[200px] w-[600px] flex-col items-center justify-center gap-4 p-8">
      <StarScale />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "기본 별점 슬라이더입니다. 드래그하여 값을 변경할 수 있습니다.",
      },
    },
  },
};

export const States: Story = {
  render: () => {
    const values = [0.5, 1.0, 2.5, 3.5, 5.0];

    return (
      <div className="flex min-h-[400px] w-[600px] flex-col gap-8 p-8">
        <h3 className="text-base font-medium">다양한 별점 상태</h3>
        {values.map(value => (
          <div key={value} className="flex flex-col gap-2">
            <p className="text-sm text-zinc-600">별점: {value}</p>
            <ControlledStarScale value={value} />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "다양한 별점 값의 상태를 보여줍니다. 0.5 단위로 선택할 수 있으며, 반쪽 별과 전체 별이 자동으로 표시됩니다.",
      },
    },
  },
};

export const HalfStar: Story = {
  render: () => (
    <div className="flex min-h-[200px] w-[800px] flex-col items-center justify-center gap-4 p-8">
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm text-zinc-600">반쪽 별 예시 (2.5점)</p>
        <ControlledStarScale value={2.5} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "반쪽 별이 표시되는 예시입니다. 값이 정수가 아닌 경우 (예: 2.5) 마지막 별이 반쪽으로 표시됩니다.",
      },
    },
  },
};

export const MaxValue: Story = {
  render: () => (
    <div className="flex min-h-[200px] w-[800px] flex-col items-center justify-center gap-4 p-8">
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm text-zinc-600">최대값 예시 (5.0점 - 웃는 얼굴 별)</p>
        <ControlledStarScale value={5.0} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "최대값(5.0)일 때는 웃는 얼굴 별이 표시됩니다. 이는 최고 평가를 시각적으로 강조합니다.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(1.0);

    return (
      <div className="flex min-h-[300px] w-[800px] flex-col items-center justify-center gap-6 p-8">
        <div className="flex w-full flex-col gap-4">
          <h3 className="text-base font-medium">인터랙티브 예시</h3>
          <p className="text-sm text-zinc-600">현재 선택된 별점: {value}</p>
          <ControlledStarScale value={value} onChange={setValue} />
          <div className="mt-4 rounded-lg bg-zinc-100 p-4">
            <h4 className="mb-2 font-semibold">선택된 값:</h4>
            <pre className="text-sm">{JSON.stringify({ value }, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "인터랙티브한 별점 선택 예시입니다. 슬라이더를 드래그하여 값을 변경하고, 변경된 값을 확인할 수 있습니다.",
      },
    },
  },
};

function StarFilled({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_4819_6268)">
        <path
          d="M27.933 4.15817C28.7816 2.45064 31.2175 2.45064 32.0661 4.15818L38.2797 16.6607C39.1231 18.3579 40.7463 19.5325 42.6221 19.8032L56.4992 21.8056C58.397 22.0795 59.1524 24.4142 57.7747 25.7478L47.7681 35.434C46.3969 36.7612 45.7708 38.6806 46.0956 40.5611L48.4596 54.2483C48.7848 56.1313 46.8115 57.5711 45.1176 56.6868L32.6696 50.188C30.9967 49.3146 29.0024 49.3146 27.3295 50.188L14.8815 56.6868C13.1876 57.5711 11.2143 56.1313 11.5395 54.2483L13.9035 40.5611C14.2283 38.6806 13.6022 36.7612 12.231 35.434L2.22444 25.7478C0.846706 24.4142 1.60207 22.0795 3.49988 21.8056L17.377 19.8032C19.2528 19.5325 20.876 18.3579 21.7194 16.6607L27.933 4.15817Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_4819_6268">
          <rect width="60" height="60" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function StarHalf({ className }: { className?: string }) {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_4970_40282)">
        <path
          d="M27.933 4.15817C28.7816 2.45064 31.2175 2.45064 32.0661 4.15818L38.2797 16.6607C39.1231 18.3579 40.7463 19.5325 42.6221 19.8032L56.4992 21.8056C58.397 22.0795 59.1524 24.4142 57.7747 25.7478L47.7681 35.434C46.3969 36.7612 45.7708 38.6806 46.0956 40.5611L48.4596 54.2483C48.7848 56.1313 46.8115 57.5711 45.1176 56.6868L32.6696 50.188C30.9967 49.3146 29.0024 49.3146 27.3295 50.188L14.8815 56.6868C13.1876 57.5711 11.2143 56.1313 11.5395 54.2483L13.9035 40.5611C14.2283 38.6806 13.6022 36.7612 12.231 35.434L2.22444 25.7478C0.846706 24.4142 1.60207 22.0795 3.49988 21.8056L17.377 19.8032C19.2528 19.5325 20.876 18.3579 21.7194 16.6607L27.933 4.15817Z"
          fill="#F4F4F5"
        />
        <path
          d="M30 49.5332C29.0833 49.5332 28.1665 49.7509 27.3301 50.1875L14.8818 56.6865C13.1879 57.5709 11.2148 56.131 11.54 54.248L13.9033 40.5615C14.2281 38.681 13.6026 36.7609 12.2314 35.4336L2.22461 25.748C0.84688 24.4144 1.6022 22.0795 3.5 21.8057L17.377 19.8027C19.2526 19.5321 20.8762 18.3581 21.7197 16.6611L27.9336 4.1582C28.358 3.30443 29.1788 2.87782 30 2.87793V49.5332Z"
          fill="#FFE672"
        />
      </g>
      <defs>
        <clipPath id="clip0_4970_40282">
          <rect width="60" height="60" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function StarSmile({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_4819_6266)">
        <path
          d="M27.933 4.15817C28.7816 2.45064 31.2175 2.45064 32.0661 4.15818L38.2797 16.6607C39.1231 18.3579 40.7463 19.5325 42.6221 19.8032L56.4992 21.8056C58.397 22.0795 59.1524 24.4142 57.7747 25.7478L47.7681 35.434C46.3969 36.7612 45.7708 38.6806 46.0956 40.5611L48.4596 54.2483C48.7848 56.1313 46.8115 57.5711 45.1175 56.6868L32.6695 50.188C30.9967 49.3146 29.0024 49.3146 27.3295 50.188L14.8815 56.6868C13.1876 57.5711 11.2143 56.1313 11.5395 54.2483L13.9035 40.5611C14.2283 38.6806 13.6022 36.7612 12.231 35.434L2.22444 25.7478C0.846705 24.4142 1.60207 22.0795 3.49988 21.8056L17.377 19.8032C19.2528 19.5325 20.876 18.3579 21.7194 16.6607L27.933 4.15817Z"
          fill="#FFE672"
        />
        <path
          d="M35.7695 31.4482C36.4585 31.4482 37.0176 32.0064 37.0176 32.6953C37.0176 34.4966 36.2604 36.2096 34.9375 37.4609C33.6171 38.7099 31.84 39.4003 30.001 39.4004C28.162 39.4004 26.3849 38.7098 25.0645 37.4609C23.7416 36.2096 22.9844 34.4966 22.9844 32.6953C22.9844 32.0064 23.5425 31.4482 24.2314 31.4482C24.9204 31.4482 25.4785 32.0064 25.4785 32.6953C25.4785 33.7888 25.9373 34.8529 26.7783 35.6484C27.6217 36.4461 28.7801 36.9053 30.001 36.9053C31.2216 36.9052 32.3794 36.446 33.2227 35.6484C34.0637 34.8529 34.5225 33.7888 34.5225 32.6953C34.5225 32.0065 35.0808 31.4484 35.7695 31.4482Z"
          fill="#FFAA00"
        />
        <path
          d="M26.6855 26.5391C27.6543 26.5391 28.4403 27.3243 28.4404 28.293C28.4404 29.2618 27.6543 30.0469 26.6855 30.0469C25.7169 30.0467 24.9316 29.2617 24.9316 28.293C24.9317 27.3243 25.7169 26.5392 26.6855 26.5391Z"
          fill="#FFAA00"
        />
        <path
          d="M33.3066 26.5391C34.2754 26.5391 35.0614 27.3243 35.0615 28.293C35.0615 29.2618 34.2754 30.0469 33.3066 30.0469C32.338 30.0467 31.5527 29.2617 31.5527 28.293C31.5528 27.3243 32.338 26.5392 33.3066 26.5391Z"
          fill="#FFAA00"
        />
      </g>
      <defs>
        <clipPath id="clip0_4819_6266">
          <rect width="60" height="60" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function ControlledStarScale({
  value,
  onChange,
}: {
  value: number;
  onChange?: (value: number) => void;
}) {
  const maxStars = 5;

  return (
    <div className="relative w-full px-14">
      <Slider.Root
        value={[value]}
        onValueChange={values => {
          const newValue = values[0];
          if (newValue !== undefined) {
            onChange?.(newValue);
          }
        }}
        min={0.5}
        max={maxStars}
        step={0.5}
        className="relative flex h-18 w-full touch-none select-none items-center"
      >
        <Slider.Track>
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 flex w-full -translate-y-1/2 items-center justify-between px-0">
            {Array.from({ length: maxStars }).map((_, index) => {
              const starIndex = index + 1;
              const starValue = index + 1;
              const StarIcon = value === maxStars ? StarSmile : StarFilled;
              const isFilled = value >= starValue;
              const isHalf = value >= starValue - 0.5 && value < starValue;

              if (isHalf) {
                return <StarHalf key={starIndex} className="size-15 transition-colors" />;
              }

              return (
                <StarIcon
                  key={starIndex}
                  className={cn(
                    "size-15 transition-colors",
                    isFilled ? "text-yellow-500" : "text-zinc-100",
                  )}
                />
              );
            })}
          </div>
        </Slider.Track>
      </Slider.Root>
    </div>
  );
}
