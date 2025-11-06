import { Toaster, toast } from "@repo/ui/components";
import { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta = {
  title: "Common/Toast",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# Toast

4가지 타입(success, error, warning, info)의 토스트 알림을 제공하는 컴포넌트입니다.

## 특징

- **Queue 관리**: 여러 토스트가 순차적으로 표시됩니다.
- **자동 사라짐**: 기본 3초 후 자동으로 사라집니다.
- **우아한 애니메이션**: 부드러운 등장/퇴장 애니메이션
- **닫기 버튼**: 각 토스트에 닫기 버튼이 제공됩니다.

## 사용법

### 1. Toaster 컴포넌트 추가 (앱 최상위)

\`\`\`tsx
import { Toaster } from "@repo/ui/components";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
\`\`\`

### 2. toast 함수 사용

\`\`\`tsx
import { toast } from "@repo/ui/components";

function handleSubmit() {
  toast.success("저장되었습니다!");
  toast.error("오류가 발생했습니다.");
  toast.warning("주의가 필요합니다.");
  toast.info("참고하세요.");
}
\`\`\`

### 3. duration 옵션

\`\`\`tsx
toast.success("5초 동안 표시됩니다", { duration: 5000 });
\`\`\``,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 예시 - 모든 타입
export const AllTypes: Story = {
  render: () => {
    return (
      <>
        <Toaster />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "2rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Toast 타입별 예시</h2>
          <button
            onClick={() => toast.default("디폴트 메세지입니다.")}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            Default Toast
          </button>
          <button
            onClick={() => toast.success("투표가 생성되었습니다!")}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            Success Toast
          </button>
          <button
            onClick={() => toast.warning("이미지 크기가 너무 큽니다.")}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            Warning Toast
          </button>
        </div>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "4가지 타입의 토스트를 확인할 수 있습니다. 각 버튼을 클릭하여 다양한 토스트를 띄워보세요.",
      },
    },
  },
};

// 직접 toast 함수 사용
export const DirectUsage: Story = {
  render: () => {
    return (
      <>
        <Toaster />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "2rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>toast 함수 직접 사용</h2>
          <button
            onClick={() => toast.success("좋아요를 눌렀습니다!")}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            Success
          </button>
        </div>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "toast 함수를 직접 import하여 간편하게 사용할 수 있습니다.",
      },
    },
  },
};

// Queue 관리
export const QueueManagement: Story = {
  render: () => {
    const showMultipleToasts = () => {
      toast.default("첫 번째 토스트");
      setTimeout(() => toast.success("두 번째 토스트"), 500);
      setTimeout(() => toast.warning("세 번째 토스트"), 1000);
    };

    return (
      <>
        <Toaster />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Queue 관리</h2>
          <button
            onClick={showMultipleToasts}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            여러 개 토스트 띄우기
          </button>
          <p style={{ fontSize: "0.875rem", color: "#71717a" }}>
            여러 토스트가 순차적으로 쌓이고 자동으로 사라집니다.
          </p>
        </div>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "여러 토스트를 연속으로 호출하면 Queue에 쌓여 순차적으로 표시됩니다.",
      },
    },
  },
};

// Duration 커스터마이징
export const CustomDuration: Story = {
  render: () => {
    return (
      <>
        <Toaster />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "2rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Duration 커스터마이징</h2>
          <button
            type="button"
            onClick={() => toast.success("1초 후 사라집니다", { duration: 1000 })}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            1초 (짧음)
          </button>
          <button
            onClick={() =>
              toast.default("3초 후 사라집니다 (기본값)", {
                duration: 3000,
              })
            }
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            3초 (기본값)
          </button>
          <button
            onClick={() => toast.warning("7초 후 사라집니다", { duration: 7000 })}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            7초 (긴 메시지용)
          </button>
        </div>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "duration 옵션을 통해 토스트가 화면에 표시되는 시간을 조절할 수 있습니다.",
      },
    },
  },
};

// 실제 사용 시나리오
export const RealWorldScenarios: Story = {
  render: () => {
    const handleVoteSubmit = () => {
      // 투표 제출 시뮬레이션
      setTimeout(() => {
        toast.success("투표가 제출되었습니다!");
      }, 500);
    };

    const handleImageUpload = () => {
      // 이미지 업로드 실패 시뮬레이션
      setTimeout(() => {
        toast.warning("이미지 업로드에 실패했습니다.");
      }, 500);
    };

    const handleBookmark = () => {
      toast.success("북마크에 추가되었습니다.");
    };

    const handleMaxVotes = () => {
      toast.warning("최대 5개까지 선택할 수 있습니다.");
    };

    const handleLongMessage = () => {
      toast.success(
        "줄이 넘어가는 긴 메세지 예시입니다. 줄이 넘어가는 긴 메세지 예시입니다. 줄이 넘어가는 긴 메세지 예시입니다.",
      );
    };

    return (
      <>
        <Toaster />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "2rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>실제 사용 시나리오</h2>
          <button
            onClick={handleVoteSubmit}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            투표 제출
          </button>
          <button
            onClick={handleImageUpload}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            이미지 업로드 (실패)
          </button>
          <button
            onClick={handleBookmark}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            북마크 추가
          </button>
          <button
            onClick={handleMaxVotes}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            최대 개수 초과
          </button>
          <button
            onClick={handleLongMessage}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            type="button"
          >
            긴 메세지
          </button>
        </div>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "실제 앱에서 사용될 수 있는 다양한 시나리오를 시뮬레이션한 예시입니다.",
      },
    },
  },
};
