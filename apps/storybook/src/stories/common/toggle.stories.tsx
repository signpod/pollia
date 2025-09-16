import type { Meta, StoryObj } from "@storybook/nextjs";
import { Toggle } from "@repo/ui/components";
import { useState } from "react";

const meta: Meta<typeof Toggle> = {
  title: "Common/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# Toggle

상태를 토글할 수 있는 스위치 컴포넌트입니다. 외부에서 상태를 제어하는 controlled component로 구현되었습니다.

## 사용법

\`\`\`tsx
const [isEnabled, setIsEnabled] = useState(false);

<Toggle
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
  aria-label="알림 설정"
/>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`checked\` | \`boolean\` | - | 토글의 현재 상태 |
| \`onCheckedChange\` | \`(checked: boolean) => void\` | - | 상태 변경 시 호출되는 콜백 |
| \`disabled\` | \`boolean\` | \`false\` | 비활성화 여부 |
| \`className\` | \`string\` | - | 추가 CSS 클래스 |
| \`aria-label\` | \`string\` | - | 접근성을 위한 라벨 |

모든 HTML button 속성을 지원합니다.

## 특징

- ✅ 외부 상태 제어 (Controlled Component)
- ✅ 접근성 지원 (ARIA attributes)
- ✅ 키보드 포커스 지원
- ✅ 부드러운 애니메이션
- ✅ 비활성화 상태 지원
- ✅ TypeScript 타입 안전성

## 예시

\`\`\`tsx
// 기본 사용
const [enabled, setEnabled] = useState(false);
<Toggle checked={enabled} onCheckedChange={setEnabled} />

// 라벨과 함께
<div className="flex items-center gap-2">
  <Toggle checked={notifications} onCheckedChange={setNotifications} />
  <label>알림 받기</label>
</div>

// 비활성화 상태
<Toggle checked={false} onCheckedChange={() => {}} disabled />

// 커스텀 스타일
<Toggle 
  checked={theme === 'dark'} 
  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
  className="ring-2 ring-blue-500"
  aria-label="다크 모드 토글"
/>
\`\`\``,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div style={{ padding: "40px" }}>
        <Toggle
          checked={checked}
          onCheckedChange={setChecked}
          aria-label="기본 토글"
        />
      </div>
    );
  },
};

export const WithLabel: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [autoSave, setAutoSave] = useState(true);

    return (
      <div
        style={{
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div className="flex items-center gap-3">
          <Toggle
            checked={notifications}
            onCheckedChange={setNotifications}
            aria-label="알림 설정"
          />
          <label className="text-sm font-medium">알림 받기</label>
        </div>

        <div className="flex items-center gap-3">
          <Toggle
            checked={darkMode}
            onCheckedChange={setDarkMode}
            aria-label="다크 모드"
          />
          <label className="text-sm font-medium">다크 모드</label>
        </div>

        <div className="flex items-center gap-3">
          <Toggle
            checked={autoSave}
            onCheckedChange={setAutoSave}
            aria-label="자동 저장"
          />
          <label className="text-sm font-medium">자동 저장</label>
        </div>
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    return (
      <div
        style={{
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "30px",
        }}
      >
        <div>
          <h3 className="text-sm font-semibold mb-3">활성 상태</h3>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <Toggle checked={false} onCheckedChange={() => {}} />
              <span className="text-xs text-gray-600">Off</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Toggle checked={true} onCheckedChange={() => {}} />
              <span className="text-xs text-gray-600">On</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">비활성 상태</h3>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <Toggle checked={false} onCheckedChange={() => {}} disabled />
              <span className="text-xs text-gray-600">Disabled Off</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Toggle checked={true} onCheckedChange={() => {}} disabled />
              <span className="text-xs text-gray-600">Disabled On</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      notifications: true,
      emailUpdates: false,
      smsAlerts: false,
      pushNotifications: true,
      weeklyDigest: false,
    });

    const updateSetting =
      (key: keyof typeof settings) => (checked: boolean) => {
        setSettings((prev) => ({ ...prev, [key]: checked }));
      };

    return (
      <div style={{ padding: "40px", maxWidth: "400px" }}>
        <h3 className="text-lg font-semibold mb-6">알림 설정</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">푸시 알림</p>
              <p className="text-sm text-gray-600">앱 알림을 받습니다</p>
            </div>
            <Toggle
              checked={settings.notifications}
              onCheckedChange={updateSetting("notifications")}
              aria-label="푸시 알림"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">이메일 업데이트</p>
              <p className="text-sm text-gray-600">
                중요한 업데이트를 이메일로 받습니다
              </p>
            </div>
            <Toggle
              checked={settings.emailUpdates}
              onCheckedChange={updateSetting("emailUpdates")}
              aria-label="이메일 업데이트"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS 알림</p>
              <p className="text-sm text-gray-600">
                긴급 알림을 SMS로 받습니다
              </p>
            </div>
            <Toggle
              checked={settings.smsAlerts}
              onCheckedChange={updateSetting("smsAlerts")}
              aria-label="SMS 알림"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">주간 요약</p>
              <p className="text-sm text-gray-600">매주 활동 요약을 받습니다</p>
            </div>
            <Toggle
              checked={settings.weeklyDigest}
              onCheckedChange={updateSetting("weeklyDigest")}
              aria-label="주간 요약"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">현재 설정:</h4>
          <pre className="text-xs text-gray-700">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};

export const CustomStyling: Story = {
  render: () => {
    const [toggle1, setToggle1] = useState(false);
    const [toggle2, setToggle2] = useState(true);
    const [toggle3, setToggle3] = useState(false);

    return (
      <div
        style={{
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div className="flex items-center gap-3">
          <Toggle
            checked={toggle1}
            onCheckedChange={setToggle1}
            className="ring-2 ring-blue-300 ring-offset-2"
            aria-label="파란색 링 토글"
          />
          <span className="text-sm">파란색 포커스 링</span>
        </div>

        <div className="flex items-center gap-3">
          <Toggle
            checked={toggle2}
            onCheckedChange={setToggle2}
            className="scale-125"
            aria-label="큰 토글"
          />
          <span className="text-sm">1.25배 크기</span>
        </div>

        <div className="flex items-center gap-3">
          <Toggle
            checked={toggle3}
            onCheckedChange={setToggle3}
            className="opacity-75"
            aria-label="투명한 토글"
          />
          <span className="text-sm">75% 투명도</span>
        </div>
      </div>
    );
  },
};
