import { Meta, StoryObj } from "@storybook/nextjs";
import PollCandidate from "web/src/components/poll/PollCandidate";
import { useState } from "react";

const meta: Meta<typeof PollCandidate> = {
  title: "Pollia/PollCandidate",
  component: PollCandidate,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    name: {
      control: { type: "text" },
      description: "후보자명",
    },
    link: {
      control: { type: "text" },
      description: "후보자 링크 (있으면 클릭 가능한 링크로 표시됨)",
    },
    imageUrl: {
      control: { type: "text" },
      description: "후보자 이미지 URL",
    },
    placeholder: {
      control: { type: "text" },
      description: "후보자명 입력 필드 플레이스홀더",
    },
    onNameChange: {
      action: "nameChanged",
      description: "후보자명이 변경될 때 호출되는 콜백",
    },
    onImageSelect: {
      action: "imageSelected",
      description: "이미지가 선택될 때 호출되는 콜백",
    },
    onImageDelete: {
      action: "imageDeleted",
      description: "이미지가 삭제될 때 호출되는 콜백",
    },
    onOptionsClick: {
      action: "optionsClicked",
      description: "옵션 버튼이 클릭될 때 호출되는 콜백",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 후보자 (링크 없음)
export const Default: Story = {
  args: {
    name: "",
  },
  parameters: {
    docs: {
      description: {
        story:
          "기본 후보자 컴포넌트입니다. 이미지와 후보자명만 입력할 수 있습니다.",
      },
    },
  },
};

// 링크가 있는 후보자
export const WithLink: Story = {
  args: {
    name: "",
    link: "",
  },
  parameters: {
    docs: {
      description: {
        story:
          "링크가 있는 후보자 컴포넌트입니다. link prop이 정의되면 자동으로 클릭 가능한 링크가 표시됩니다.",
      },
    },
  },
};

// 데이터가 입력된 상태
export const WithData: Story = {
  args: {
    name: "아이폰 15 Pro",
    imageUrl: "https://via.placeholder.com/48",
  },
  parameters: {
    docs: {
      description: {
        story: "후보자명과 이미지가 입력된 상태입니다.",
      },
    },
  },
};

// 링크와 데이터가 모두 있는 상태
export const WithLinkAndData: Story = {
  args: {
    name: "갤럭시 S24",
    link: "https://www.samsung.com/galaxy-s24",
    imageUrl: "https://via.placeholder.com/48",
  },
  parameters: {
    docs: {
      description: {
        story: "후보자명, 링크, 이미지가 모두 입력된 상태입니다.",
      },
    },
  },
};

// 인터랙티브 후보자 (링크 없음)
export const InteractiveBasic: Story = {
  render: () => {
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState<string>();

    const handleImageSelect = (file: File) => {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    };

    const handleImageDelete = () => {
      setImageUrl(undefined);
    };

    return (
      <div className="max-w-md space-y-4">
        <PollCandidate
          name={name}
          imageUrl={imageUrl}
          onNameChange={setName}
          onImageSelect={handleImageSelect}
          onImageDelete={handleImageDelete}
          onOptionsClick={() => alert("옵션 메뉴 클릭!")}
        />
        {name && (
          <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
            <p className="text-sm font-medium text-violet-900">
              후보자명: <span className="font-bold">{name}</span>
            </p>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "실제로 상호작용할 수 있는 기본 후보자 컴포넌트입니다. 이미지 업로드와 후보자명 입력이 가능합니다.",
      },
    },
  },
};

// 링크가 표시된 후보자
export const WithLinkDisplay: Story = {
  render: () => {
    const [name, setName] = useState("갤럭시 S24");
    const [imageUrl, setImageUrl] = useState<string | undefined>(
      "https://via.placeholder.com/48"
    );

    const handleImageSelect = (file: File) => {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    };

    const handleImageDelete = () => {
      setImageUrl(undefined);
    };

    return (
      <div className="max-w-md space-y-4">
        <PollCandidate
          name={name}
          link="https://www.samsung.com/galaxy-s24"
          imageUrl={imageUrl}
          onNameChange={setName}
          onImageSelect={handleImageSelect}
          onImageDelete={handleImageDelete}
          onOptionsClick={() => alert("옵션 메뉴 클릭!")}
        />
        <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm font-medium text-violet-900">
              후보자명: <span className="font-bold">{name}</span>
            </p>
            <p className="text-sm font-medium text-violet-900">
              링크가 클릭 가능한 형태로 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "링크가 표시된 후보자 컴포넌트입니다. 링크는 입력할 수 없고 클릭 가능한 형태로 렌더링됩니다.",
      },
    },
  },
};

// 여러 후보자 목록 예시
export const MultipleCandidate: Story = {
  render: () => {
    const [candidates, setCandidates] = useState([
      {
        name: "아이폰 15 Pro",
        link: "https://apple.com",
        imageUrl: "https://via.placeholder.com/48",
      },
      {
        name: "갤럭시 S24",
        link: "https://samsung.com",
        imageUrl: "https://via.placeholder.com/48",
      },
      { name: "픽셀 8", link: "", imageUrl: undefined },
    ]);

    const updateCandidate = (index: number, field: string, value: string) => {
      setCandidates((prev) =>
        prev.map((candidate, i) =>
          i === index ? { ...candidate, [field]: value } : candidate
        )
      );
    };

    return (
      <div className="max-w-md space-y-3">
        <h3 className="text-sm font-medium text-zinc-700 mb-4">
          스마트폰 후보 목록
        </h3>
        {candidates.map((candidate, index) => (
          <PollCandidate
            key={index}
            name={candidate.name}
            link={candidate.link}
            imageUrl={candidate.imageUrl}
            onNameChange={(name) => updateCandidate(index, "name", name)}
            onOptionsClick={() => alert(`${candidate.name} 옵션 메뉴`)}
          />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "여러 후보자를 관리하는 예시입니다. 각 후보자는 독립적으로 상태를 관리하며, 링크가 있는 후보자는 클릭 가능한 링크로 표시됩니다.",
      },
    },
  },
};

// 커스텀 플레이스홀더
export const CustomPlaceholder: Story = {
  args: {
    name: "",
    placeholder: "제품명을 입력하세요",
  },
  parameters: {
    docs: {
      description: {
        story: "커스텀 플레이스홀더를 사용한 예시입니다.",
      },
    },
  },
};
