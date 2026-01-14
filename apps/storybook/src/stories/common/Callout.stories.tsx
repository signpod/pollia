import { Callout, CalloutProvider, useCallout } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { AlertTriangle, Bell, Info } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Callout> = {
  title: "Common/Callout",
  component: Callout,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# Callout

X 버튼으로 닫을 수 있는 알림 컴포넌트입니다.
인라인 방식과 Toast 스타일(Provider) 방식 두 가지를 지원합니다.

## Variant (Tone)

| Variant | 설명 | 색상 | 기본 아이콘 |
|---------|------|------|------------|
| \`notice\` | 일반 안내 | 흰색 | NoticeIcon |
| \`early-urgency\` | 초기 주의 | 보라색 | AlertIcon |
| \`high-urgency\` | 높은 긴급도 | 빨간색 | AlertIcon |

> **참고:** icon prop을 전달하지 않으면 variant에 따라 기본 아이콘이 자동으로 표시됩니다.

## 사용법

### 1. 인라인 Callout (페이지 내 고정 위치)

\`\`\`tsx
import { Callout } from "@repo/ui/components";
import { Info } from "lucide-react";
import { useState } from "react";

function MyComponent() {
  const [open, setOpen] = useState(true);

  return (
    <Callout
      open={open}
      onOpenChange={setOpen}
      title="알림"
      description="이것은 닫을 수 있는 Callout입니다."
      variant="notice"
      icon={<Info className="h-5 w-5" />}
    />
  );
}
\`\`\`

### 2. Toast 스타일 Callout (Provider 사용)

\`\`\`tsx
// 앱 최상위에 Provider 추가
import { CalloutProvider } from "@repo/ui/components";

function App() {
  return (
    <CalloutProvider position="top-center">
      <MyApp />
    </CalloutProvider>
  );
}

// 컴포넌트에서 사용
import { useCallout } from "@repo/ui/components";
import { CheckCircle } from "lucide-react";

function MyComponent() {
  const callout = useCallout();

  const handleClick = () => {
    callout.show({
      title: "성공",
      description: "작업이 완료되었습니다.",
      variant: "notice",
      icon: <CheckCircle className="h-5 w-5" />,
      duration: 5000,
    });
  };

  return <button onClick={handleClick}>Show Callout</button>;
}
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["notice", "early-urgency", "high-urgency"],
      description: "Callout의 톤/긴급도",
    },
    title: {
      control: { type: "text" },
      description: "Callout 제목 (선택)",
    },
    description: {
      control: { type: "text" },
      description: "Callout 설명 (필수)",
    },
    open: {
      control: { type: "boolean" },
      description: "열림/닫힘 상태",
    },
    className: {
      control: { type: "text" },
      description: "추가 CSS 클래스",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "알림",
    description: "이것은 기본 Callout 컴포넌트입니다. icon을 전달하지 않으면 기본 아이콘이 표시됩니다.",
    variant: "notice",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">Notice (기본)</h3>
        <Callout
          title="일반 안내"
          description="사용자에게 전달할 일반적인 안내 메시지입니다."
          variant="notice"
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">Early Urgency</h3>
        <Callout
          title="초기 주의"
          description="조금 더 주의가 필요한 상황을 알립니다."
          variant="early-urgency"
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">High Urgency</h3>
        <Callout
          title="높은 긴급도"
          description="즉각적인 주의가 필요한 중요한 알림입니다."
          variant="high-urgency"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "3가지 톤(variant)의 Callout을 확인할 수 있습니다. icon prop을 전달하지 않으면 variant에 따라 기본 아이콘이 자동으로 표시됩니다.",
      },
    },
  },
};

export const WithCustomIcon: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">커스텀 아이콘 사용</h3>
        <Callout
          title="커스텀 아이콘"
          description="icon prop으로 원하는 아이콘을 전달할 수 있습니다."
          variant="notice"
          icon={<Bell className="h-5 w-5" />}
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">기본 아이콘 (icon 미전달)</h3>
        <Callout
          title="기본 아이콘"
          description="icon prop을 전달하지 않으면 variant에 맞는 기본 아이콘이 표시됩니다."
          variant="notice"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "icon prop을 전달하면 커스텀 아이콘을 사용할 수 있고, 전달하지 않으면 variant에 따라 기본 아이콘이 자동으로 표시됩니다.",
      },
    },
  },
};

export const WithoutTitle: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div className="space-y-4 w-[400px]">
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-500">아이콘 + 설명</h3>
          <Callout
            description="제목 없이 설명만 표시되는 Callout입니다."
            variant="notice"
            icon={<Info className="h-5 w-5" />}
          />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-500">설명만</h3>
          <Callout description="아이콘도 없는 간단한 Callout입니다." variant="early-urgency" />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-500">설명 + 닫기 버튼</h3>
          <Callout
            open={open}
            onOpenChange={setOpen}
            description="제목 없이 닫기 버튼만 있는 Callout입니다."
            variant="high-urgency"
          />
          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-2 px-3 py-1.5 text-sm font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              다시 열기
            </button>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "제목 없이 다양한 조합으로 사용할 수 있습니다: 아이콘+설명, 설명만, 설명+닫기 버튼.",
      },
    },
  },
};

export const Dismissible: Story = {
  render: () => {
    const [noticeOpen, setNoticeOpen] = useState(true);
    const [earlyUrgencyOpen, setEarlyUrgencyOpen] = useState(true);
    const [highUrgencyOpen, setHighUrgencyOpen] = useState(true);

    const allClosed = !noticeOpen && !earlyUrgencyOpen && !highUrgencyOpen;

    const resetAll = () => {
      setNoticeOpen(true);
      setEarlyUrgencyOpen(true);
      setHighUrgencyOpen(true);
    };

    return (
      <div className="w-[400px] space-y-4">
        <Callout
          open={noticeOpen}
          onOpenChange={setNoticeOpen}
          title="일반 안내"
          description="X 버튼을 클릭하면 닫힙니다."
          variant="notice"
          icon={<Info className="h-5 w-5" />}
        />
        <Callout
          open={earlyUrgencyOpen}
          onOpenChange={setEarlyUrgencyOpen}
          title="초기 주의"
          description="X 버튼을 클릭하면 닫힙니다."
          variant="early-urgency"
          icon={<Bell className="h-5 w-5" />}
        />
        <Callout
          open={highUrgencyOpen}
          onOpenChange={setHighUrgencyOpen}
          title="높은 긴급도"
          description="X 버튼을 클릭하면 닫힙니다."
          variant="high-urgency"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        {allClosed && (
          <button
            type="button"
            onClick={resetAll}
            className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            모두 다시 열기
          </button>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "onOpenChange prop을 전달하면 X 버튼이 표시되고, 클릭 시 닫을 수 있습니다. 모든 variant에서 동일하게 동작합니다.",
      },
    },
  },
};

function ToastStyleCalloutDemo() {
  const callout = useCallout();

  const showNotice = () => {
    callout.show({
      title: "일반 알림",
      description: "이것은 notice 스타일의 Callout입니다. (기본 아이콘)",
      variant: "notice",
    });
  };

  const showEarlyUrgency = () => {
    callout.show({
      title: "주의 필요",
      description: "조금 더 주의가 필요한 상황입니다. (기본 아이콘)",
      variant: "early-urgency",
    });
  };

  const showHighUrgency = () => {
    callout.show({
      title: "긴급 알림",
      description: "즉각적인 조치가 필요합니다! (기본 아이콘)",
      variant: "high-urgency",
    });
  };

  const showWithCustomIcon = () => {
    callout.show({
      title: "커스텀 아이콘",
      description: "icon prop으로 원하는 아이콘을 전달할 수 있습니다.",
      variant: "notice",
      icon: <Bell className="h-5 w-5" />,
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-lg font-bold">Toast 스타일 Callout</h2>
      <p className="text-sm text-gray-500 mb-2">
        버튼을 클릭하면 화면 상단에 Callout이 표시됩니다. icon을 전달하지 않으면 variant에 따라
        기본 아이콘이 표시됩니다.
      </p>
      <button
        type="button"
        onClick={showNotice}
        className="px-4 py-3 rounded-lg border border-gray-200 bg-white font-semibold hover:bg-gray-50 transition-colors"
      >
        Notice (기본 아이콘)
      </button>
      <button
        type="button"
        onClick={showEarlyUrgency}
        className="px-4 py-3 rounded-lg border border-gray-200 bg-white font-semibold hover:bg-gray-50 transition-colors"
      >
        Early Urgency (기본 아이콘)
      </button>
      <button
        type="button"
        onClick={showHighUrgency}
        className="px-4 py-3 rounded-lg border border-gray-200 bg-white font-semibold hover:bg-gray-50 transition-colors"
      >
        High Urgency (기본 아이콘)
      </button>
      <button
        type="button"
        onClick={showWithCustomIcon}
        className="px-4 py-3 rounded-lg border border-gray-200 bg-white font-semibold hover:bg-gray-50 transition-colors"
      >
        커스텀 아이콘
      </button>
    </div>
  );
}

export const ToastStyle: Story = {
  render: () => (
    <CalloutProvider position="top-center">
      <ToastStyleCalloutDemo />
    </CalloutProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "CalloutProvider와 useCallout 훅을 사용하여 Toast 스타일로 Callout을 표시할 수 있습니다. 자동으로 사라지며, 스와이프하거나 X 버튼으로 닫을 수 있습니다.",
      },
    },
  },
};

function MultipleCalloutDemo() {
  const callout = useCallout();

  const showMultiple = () => {
    callout.show({
      title: "첫 번째 알림",
      description: "첫 번째 Callout입니다.",
      variant: "notice",
      icon: <Info className="h-5 w-5" />,
    });

    setTimeout(() => {
      callout.show({
        title: "두 번째 알림",
        description: "두 번째 Callout입니다.",
        variant: "early-urgency",
        icon: <Bell className="h-5 w-5" />,
      });
    }, 300);

    setTimeout(() => {
      callout.show({
        title: "세 번째 알림",
        description: "세 번째 Callout입니다.",
        variant: "high-urgency",
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    }, 600);
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-lg font-bold">여러 개의 Callout</h2>
      <p className="text-sm text-gray-500 mb-2">여러 Callout이 순차적으로 쌓여서 표시됩니다.</p>
      <button
        type="button"
        onClick={showMultiple}
        className="px-4 py-3 rounded-lg border border-gray-200 bg-white font-semibold hover:bg-gray-50 transition-colors"
      >
        여러 개 띄우기
      </button>
      <button
        type="button"
        onClick={() => callout.dismissAll()}
        className="px-4 py-3 rounded-lg border border-gray-200 bg-white font-semibold hover:bg-gray-50 transition-colors"
      >
        모두 닫기
      </button>
    </div>
  );
}

export const MultipleCallouts: Story = {
  render: () => (
    <CalloutProvider position="top-center">
      <MultipleCalloutDemo />
    </CalloutProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: "여러 Callout을 순차적으로 표시할 수 있으며, dismissAll()로 모두 닫을 수 있습니다.",
      },
    },
  },
};

function PositionDemo() {
  const callout = useCallout();

  const showCallout = () => {
    callout.show({
      title: "위치 테스트",
      description: "이 Callout의 위치를 확인하세요.",
      variant: "notice",
      icon: <Info className="h-5 w-5" />,
    });
  };

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={showCallout}
        className="px-4 py-3 rounded-lg border border-gray-200 bg-white font-semibold hover:bg-gray-50 transition-colors"
      >
        Callout 표시
      </button>
    </div>
  );
}

export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">top-center</h3>
        <CalloutProvider position="top-center">
          <PositionDemo />
        </CalloutProvider>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">top-right</h3>
        <CalloutProvider position="top-right">
          <PositionDemo />
        </CalloutProvider>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">bottom-center</h3>
        <CalloutProvider position="bottom-center">
          <PositionDemo />
        </CalloutProvider>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">bottom-right</h3>
        <CalloutProvider position="bottom-right">
          <PositionDemo />
        </CalloutProvider>
      </div>
    </div>
  ),
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "CalloutProvider의 position prop으로 Callout이 표시되는 위치를 지정할 수 있습니다. (top-center, top-right, bottom-center, bottom-right)",
      },
    },
  },
};

export const CustomDuration: Story = {
  render: () => {
    const Demo = () => {
      const callout = useCallout();

      const show1Second = () => {
        callout.show({
          description: "1초 후 사라집니다.",
          variant: "notice",
          duration: 1000,
        });
      };

      const show10Seconds = () => {
        callout.show({
          description: "10초 후 사라집니다.",
          variant: "early-urgency",
          duration: 10000,
        });
      };

      return (
        <div className="flex flex-col gap-3 p-4">
          <h2 className="text-lg font-bold">Duration 커스터마이징</h2>
          <button
            type="button"
            onClick={show1Second}
            className="px-4 py-3 rounded-lg border border-gray-200 bg-white font-semibold hover:bg-gray-50 transition-colors"
          >
            1초 (짧음)
          </button>
          <button
            type="button"
            onClick={show10Seconds}
            className="px-4 py-3 rounded-lg border border-gray-200 bg-white font-semibold hover:bg-gray-50 transition-colors"
          >
            10초 (긴 메시지용)
          </button>
        </div>
      );
    };

    return (
      <CalloutProvider position="top-center">
        <Demo />
      </CalloutProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "duration 옵션으로 Callout이 자동으로 사라지는 시간을 조절할 수 있습니다. 기본값은 5초입니다.",
      },
    },
  },
};
