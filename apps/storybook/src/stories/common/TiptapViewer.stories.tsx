import { TiptapViewer } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof TiptapViewer> = {
  title: "Common/TiptapViewer",
  component: TiptapViewer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    content: {
      control: "text",
      description: "표시할 HTML 콘텐츠",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: "<p>이것은 기본 텍스트입니다.</p>",
  },
};

export const RichContent: Story = {
  args: {
    content: `
      <h1>제목 1</h1>
      <h2>제목 2</h2>
      <h3>제목 3</h3>
      <p>이것은 <strong>굵은</strong> 텍스트와 <em>기울임</em> 텍스트가 있는 문단입니다.</p>
      <p><s>취소선</s>과 <code>코드</code>도 지원됩니다.</p>
      <blockquote>
        <p>인용구입니다. 중요한 내용을 강조할 때 사용합니다.</p>
      </blockquote>
      <ul>
        <li>순서 없는 항목 1</li>
        <li>순서 없는 항목 2</li>
        <li>순서 없는 항목 3</li>
      </ul>
      <ol>
        <li>순서 있는 항목 1</li>
        <li>순서 있는 항목 2</li>
        <li>순서 있는 항목 3</li>
      </ol>
      <pre><code>// 코드 블록
const greeting = "Hello, World!";
console.log(greeting);</code></pre>
      <hr>
      <p>수평선 위의 텍스트입니다.</p>
    `,
  },
};

export const LongContent: Story = {
  args: {
    content: `
      <h1>긴 콘텐츠 예시</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
        exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <p>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
        culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <h2>중간 제목</h2>
      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
        doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
        veritatis et quasi architecto beatae vitae dicta sunt explicabo.
      </p>
      <ul>
        <li>첫 번째 긴 항목입니다. 이 항목은 여러 줄에 걸쳐 있을 수 있습니다.</li>
        <li>두 번째 항목입니다.</li>
        <li>세 번째 항목입니다.</li>
      </ul>
      <p>
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed
        quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
      </p>
    `,
  },
};

export const EmptyContent: Story = {
  args: {
    content: "",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="w-[600px] space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">기본 스타일</h3>
        <TiptapViewer content="<p>기본 스타일의 뷰어입니다.</p>" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">커스텀 클래스</h3>
        <TiptapViewer
          content="<p>커스텀 배경과 패딩이 적용된 뷰어입니다.</p>"
          className="rounded-lg bg-zinc-50 p-4"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">풍부한 콘텐츠</h3>
        <TiptapViewer
          content={`
            <h2>제목</h2>
            <p><strong>굵은 텍스트</strong>와 <em>기울임 텍스트</em></p>
            <ul>
              <li>항목 1</li>
              <li>항목 2</li>
            </ul>
          `}
        />
      </div>
    </div>
  ),
};
