import { TiptapEditor } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

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
      description: "HTML 콘텐츠",
    },
    placeholder: {
      control: "text",
      description: "플레이스홀더 텍스트",
    },
    editable: {
      control: "boolean",
      description: "편집 가능 여부",
    },
    showToolbar: {
      control: "boolean",
      description: "툴바 표시 여부",
    },
    onUpdate: {
      action: "updated",
      description: "콘텐츠 업데이트 콜백",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: "<p>여기에 텍스트를 입력하세요...</p>",
    placeholder: "내용을 입력하세요",
    editable: true,
  },
};

export const WithInitialContent: Story = {
  args: {
    content: `
      <h1>제목입니다</h1>
      <p>이것은 <strong>굵은</strong> 텍스트와 <em>기울임</em> 텍스트가 있는 문단입니다.</p>
      <ul>
        <li>항목 1</li>
        <li>항목 2</li>
        <li>항목 3</li>
      </ul>
      <p>코드 블록:</p>
      <pre><code>const hello = "world";</code></pre>
    `,
    editable: true,
  },
};

export const ReadOnly: Story = {
  args: {
    content: `
      <p>이 에디터는 읽기 전용입니다.</p>
      <p><strong>수정할 수 없습니다.</strong></p>
    `,
    editable: false,
  },
};

export const Interactive: Story = {
  render: () => {
    const [content, setContent] = React.useState("<p>내용을 수정해보세요...</p>");
    const [savedContent, setSavedContent] = React.useState(content);

    return (
      <div className="w-[600px] space-y-4">
        <TiptapEditor content={content} onUpdate={setContent} placeholder="내용을 입력하세요" />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSavedContent(content)}
            className="rounded-md bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => {
              setContent("<p></p>");
              setSavedContent("<p></p>");
            }}
            className="rounded-md bg-zinc-200 px-4 py-2 hover:bg-zinc-300"
          >
            초기화
          </button>
        </div>

        <div className="rounded-md border border-zinc-200 p-4">
          <h3 className="mb-2 text-sm font-medium">저장된 HTML:</h3>
          <pre className="overflow-auto text-xs text-zinc-600">{savedContent}</pre>
        </div>
      </div>
    );
  },
};

export const WithToolbar: Story = {
  args: {
    content: "<p>툴바를 사용해서 텍스트를 꾸며보세요!</p>",
    placeholder: "내용을 입력하세요",
    editable: true,
    showToolbar: true,
  },
};

export const ToolbarWithContent: Story = {
  args: {
    content: `
      <h1>제목 1</h1>
      <h2>제목 2</h2>
      <h3>제목 3</h3>
      <p>이것은 <strong>굵은</strong> 텍스트와 <em>기울임</em> 텍스트입니다.</p>
      <ul>
        <li>목록 항목 1</li>
        <li>목록 항목 2</li>
      </ul>
      <ol>
        <li>번호 항목 1</li>
        <li>번호 항목 2</li>
      </ol>
      <blockquote>인용문입니다</blockquote>
      <pre><code>const code = "코드 블록";</code></pre>
    `,
    showToolbar: true,
    editable: true,
  },
};

export const States: Story = {
  render: () => (
    <div className="w-[600px] space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Empty (with placeholder)</h3>
        <TiptapEditor content="" placeholder="내용을 입력하세요" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">With Content</h3>
        <TiptapEditor content="<p>내용이 있는 에디터입니다.</p>" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">With Toolbar</h3>
        <TiptapEditor content="<p>툴바가 있는 에디터입니다.</p>" showToolbar={true} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Read Only</h3>
        <TiptapEditor content="<p>읽기 전용 에디터입니다.</p>" editable={false} />
      </div>
    </div>
  ),
};
