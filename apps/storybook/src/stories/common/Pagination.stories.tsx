import { Pagination } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

const meta: Meta<typeof Pagination> = {
  title: "Common/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# Pagination

shadcn/ui 기반 페이지네이션 컴포넌트입니다. 페이지 수가 많을 경우 자동으로 ellipsis(...)를 표시합니다.

## 사용법
\`\`\`tsx
<Pagination
  currentPage={2}
  totalPages={10}
  onPageChange={(page) => setPage(page)}
/>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    currentPage: {
      control: { type: "number" },
      description: "현재 페이지 번호 (1부터 시작)",
    },
    totalPages: {
      control: { type: "number" },
      description: "전체 페이지 수",
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
    currentPage: 2,
    totalPages: 5,
    onPageChange: () => {},
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">3 페이지</h3>
        <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">5 페이지 (중간 선택)</h3>
        <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">10 페이지 (앞쪽)</h3>
        <Pagination currentPage={2} totalPages={10} onPageChange={() => {}} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">10 페이지 (중간)</h3>
        <Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">10 페이지 (뒤쪽)</h3>
        <Pagination currentPage={9} totalPages={10} onPageChange={() => {}} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">1 페이지 (숨김)</h3>
        <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "다양한 페이지 수와 현재 위치에 따른 렌더링을 보여줍니다. 1페이지일 때는 숨겨집니다.",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">첫 페이지 (이전 비활성)</h3>
        <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">마지막 페이지 (다음 비활성)</h3>
        <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "첫 페이지와 마지막 페이지에서의 이전/다음 버튼 비활성 상태를 보여줍니다.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    const totalPages = 10;

    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-violet-50 p-3">
          <p className="text-sm text-violet-700">
            현재 페이지: <span className="font-semibold">{page}</span> / {totalPages}
          </p>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Controlled mode로 동작하는 Pagination입니다. 페이지를 클릭하여 이동해보세요.",
      },
    },
  },
};
