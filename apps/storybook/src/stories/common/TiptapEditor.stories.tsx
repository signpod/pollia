import { TiptapEditor } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

const SAMPLE_CONTENT = `
  <h2>콘텐츠 소개</h2>
  <p>이 콘텐츠는 <strong>사용자 의견 수집</strong>을 목적으로 합니다.</p>
  <ul>
    <li>응답 대상: 20~40대 직장인</li>
    <li>예상 소요 시간: 3분</li>
    <li>마감 일정: 2026년 3월 10일</li>
  </ul>
`;

const meta: Meta<typeof TiptapEditor> = {
  title: "Common/TiptapEditor",
  component: TiptapEditor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    content: {
      control: "text",
      description: "초기 HTML 콘텐츠",
    },
    placeholder: {
      control: "text",
      description: "콘텐츠가 비어있을 때 표시되는 안내 문구",
    },
    editable: {
      control: "boolean",
      description: "에디터 편집 가능 여부",
    },
    showToolbar: {
      control: "boolean",
      description: "툴바 노출 여부",
    },
    onFocus: {
      action: "onFocus",
      description: "에디터가 포커스될 때 호출되는 콜백",
    },
  },
  args: {
    content: SAMPLE_CONTENT,
    placeholder: "설명을 입력해주세요",
    editable: true,
    showToolbar: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledEditor({
  content,
  placeholder,
  editable,
  showToolbar,
  onFocus,
}: {
  content?: string;
  placeholder?: string;
  editable?: boolean;
  showToolbar?: boolean;
  onFocus?: () => void;
}) {
  return (
    <div className="w-[720px]">
      <TiptapEditor
        content={content}
        placeholder={placeholder}
        editable={editable}
        showToolbar={showToolbar}
        onFocus={onFocus}
        className="min-h-[220px] ring-1 ring-zinc-200"
      />
    </div>
  );
}

export const Default: Story = {
  render: args => <ControlledEditor {...args} />,
};

export const WithoutToolbar: Story = {
  args: {
    showToolbar: false,
  },
  render: args => <ControlledEditor {...args} />,
};

export const Readonly: Story = {
  args: {
    editable: false,
    showToolbar: true,
  },
  render: args => <ControlledEditor {...args} />,
};

export const EmptyWithPlaceholder: Story = {
  args: {
    content: "",
    placeholder: "콘텐츠 설명을 입력해 주세요.",
    editable: true,
    showToolbar: true,
  },
  render: args => <ControlledEditor {...args} />,
};

function FocusOnContainerClickExample() {
  const [focusCount, setFocusCount] = useState(0);

  return (
    <div className="w-[720px] space-y-2">
      <p className="text-sm text-zinc-500">포커스 횟수: {focusCount}</p>
      <TiptapEditor
        content=""
        editable
        showToolbar
        placeholder="빈 영역(패딩 포함)을 클릭해 포커스를 확인해보세요."
        onFocus={() => {
          setFocusCount(prev => prev + 1);
        }}
        className="min-h-[200px] ring-1 ring-zinc-200"
      />
    </div>
  );
}

export const FocusOnContainerClick: Story = {
  render: () => <FocusOnContainerClickExample />,
};

export const States: Story = {
  render: () => (
    <div className="w-[720px] space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium">Toolbar + Editable</h3>
        <TiptapEditor
          content={SAMPLE_CONTENT}
          editable
          showToolbar
          placeholder="설명을 입력해주세요"
          className="min-h-[200px] ring-1 ring-zinc-200"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">No Toolbar + Editable</h3>
        <TiptapEditor
          content="<p>툴바 없이 본문만 편집하는 상태입니다.</p>"
          editable
          showToolbar={false}
          placeholder="설명을 입력해주세요"
          className="min-h-[180px] ring-1 ring-zinc-200"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Readonly</h3>
        <TiptapEditor
          content="<h3>읽기 전용 상태</h3><p>편집은 불가하고 콘텐츠만 확인할 수 있습니다.</p>"
          editable={false}
          showToolbar
          className="min-h-[180px] ring-1 ring-zinc-200"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Placeholder</h3>
        <TiptapEditor
          content=""
          editable
          showToolbar
          placeholder="여기에 콘텐츠 설명을 작성하세요."
          className="min-h-[180px] ring-1 ring-zinc-200"
        />
      </div>
    </div>
  ),
};
