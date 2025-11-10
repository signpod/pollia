import { SurveyLikertScale } from "@/app/survey/[id]/components/SurveyLikertScale";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

const meta: Meta<typeof SurveyLikertScale> = {
  title: "Survey/SurveyLikertScale",
  component: SurveyLikertScale,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# SurveyLikertScale

A Likert scale component for survey questions with customizable face emoji thumbs.

## Features

- Interactive slider with touch/drag support
- Customizable min/max/step values
- Face emoji thumbs that reflect rating (1-5 scale)
- Optional scale guide with labels
- Disabled state support
- Responsive and mobile-friendly

## Composite Structure

This component uses a composite pattern:

- \`SurveyLikertScale\`: Main wrapper component
- \`SurveyLikertScale.ScaleGuide\`: Optional label display (optional)
- \`SurveyLikertScale.Thumb\`: Face emoji thumb (optional, auto-selects icon by value)

**Note:** If \`SurveyLikertScale.Thumb\` is not provided, a default circular thumb will be displayed.

## Usage

\`\`\`tsx
import { SurveyLikertScale } from "./components/SurveyLikertScale";

// With face emoji thumb
function Example() {
  const [value, setValue] = useState(3);
  
  return (
    <SurveyLikertScale value={value} onChange={setValue}>
      <SurveyLikertScale.ScaleGuide 
        labels={["Very Bad", "Bad", "Neutral", "Good", "Very Good"]} 
      />
      <SurveyLikertScale.Thumb value={value} />
    </SurveyLikertScale>
  );
}

// With default circular thumb (without face emoji)
function SimpleExample() {
  const [value, setValue] = useState(3);
  
  return (
    <SurveyLikertScale value={value} onChange={setValue}>
      <SurveyLikertScale.ScaleGuide labels={["1", "2", "3", "4", "5"]} />
    </SurveyLikertScale>
  );
}
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 1, max: 5, step: 1 },
      description: "Current selected value",
      table: {
        type: { summary: "number" },
      },
    },
    onChange: {
      description: "Callback fired when value changes",
      table: {
        type: { summary: "(value: number) => void" },
      },
    },
    min: {
      control: "number",
      description: "Minimum value",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    max: {
      control: "number",
      description: "Maximum value",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "5" },
      },
    },
    step: {
      control: "number",
      description: "Step increment value",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the component is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] items-center justify-center p-8">
        <SurveyLikertScale {...args} value={value} onChange={setValue}>
          <SurveyLikertScale.Thumb value={value} />
        </SurveyLikertScale>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
  },
};

export const WithoutCustomThumb: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <SurveyLikertScale {...args} value={value} onChange={setValue} />
        <p className="text-sm text-zinc-600">Selected: {value}</p>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default circular thumb without face emoji. When `SurveyLikertScale.Thumb` is not provided as a child, it displays a simple circular thumb.",
      },
    },
  },
};

export const WithNumberLabels: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 1);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <SurveyLikertScale value={value} onChange={setValue} min={1} max={5} step={1}>
          <SurveyLikertScale.ScaleGuide labels={["1", "2", "3", "4", "5"]} />
        </SurveyLikertScale>
        <p className="text-sm text-zinc-600">Selected: {value}</p>
      </div>
    );
  },
  args: {
    value: 1,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "With number labels and default circular thumb. Shows numeric scale without face emoji.",
      },
    },
  },
};

export const WithTextLabels: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <SurveyLikertScale value={value} onChange={setValue} min={1} max={5} step={1}>
          <SurveyLikertScale.ScaleGuide
            labels={["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]}
          />
          <SurveyLikertScale.Thumb value={value} />
        </SurveyLikertScale>
        <p className="text-sm text-zinc-600">Selected: {value}</p>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "With text labels and face emoji thumb. The thumb automatically displays the appropriate face emoji based on the selected value (1=very bad, 5=very good).",
      },
    },
  },
};

export const WithCustomColors: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <SurveyLikertScale value={value} onChange={setValue} min={1} max={5} step={1}>
          <SurveyLikertScale.ScaleGuide
            labels={["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]}
          />
          <SurveyLikertScale.Thumb value={value} className="text-sky-600" />
        </SurveyLikertScale>
        <p className="text-sm text-zinc-600">Selected: {value} (Custom color)</p>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Customizing face emoji thumb color using Tailwind color classes. The SVG icons use `currentColor` so you can style them with text-* classes.",
      },
    },
  },
};

export const SevenPointScale: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 4);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <SurveyLikertScale value={value} onChange={setValue} min={1} max={7} step={1}>
          <SurveyLikertScale.ScaleGuide labels={["1", "2", "3", "4", "5", "6", "7"]} />
          <SurveyLikertScale.Thumb value={value} />
        </SurveyLikertScale>
        <p className="text-sm text-zinc-600">Selected: {value} / 7</p>
      </div>
    );
  },
  args: {
    value: 4,
    onChange: () => {},
    min: 1,
    max: 7,
    step: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "7-point scale example. Note: Face emoji thumbs are designed for 5-point scales, so values outside 1-5 will default to the neutral face.",
      },
    },
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] items-center justify-center p-8">
        <SurveyLikertScale value={value} onChange={setValue} min={1} max={5} step={1} disabled>
          <SurveyLikertScale.ScaleGuide labels={["1", "2", "3", "4", "5"]} />
          <SurveyLikertScale.Thumb value={value} />
        </SurveyLikertScale>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Disabled state prevents user interaction with the slider.",
      },
    },
  },
};

export const RealWorldExample: Story = {
  render: () => {
    const [answers, setAnswers] = useState<Record<string, number>>({
      satisfaction: 3,
      recommendation: 3,
      usability: 3,
    });

    const questions = [
      {
        id: "satisfaction",
        question: "How satisfied are you with the service?",
        labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      },
      {
        id: "recommendation",
        question: "Would you recommend this to others?",
        labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      },
      {
        id: "usability",
        question: "Is it easy to use?",
        labels: ["Very Difficult", "Difficult", "Neutral", "Easy", "Very Easy"],
      },
    ];

    return (
      <div className="flex min-h-[600px] w-[500px] flex-col gap-8 p-8">
        <h2 className="text-xl font-bold">Survey</h2>
        {questions.map(q => (
          <div key={q.id} className="flex flex-col gap-4">
            <h3 className="text-base font-medium">{q.question}</h3>
            <SurveyLikertScale
              value={answers[q.id] ?? 3}
              onChange={value => setAnswers(prev => ({ ...prev, [q.id]: value }))}
              min={1}
              max={5}
              step={1}
            >
              <SurveyLikertScale.ScaleGuide labels={q.labels} />
              <SurveyLikertScale.Thumb value={answers[q.id] ?? 3} />
            </SurveyLikertScale>
          </div>
        ))}
        <div className="mt-4 rounded-lg bg-zinc-100 p-4">
          <h4 className="mb-2 font-semibold">Response:</h4>
          <pre className="text-sm">{JSON.stringify(answers, null, 2)}</pre>
        </div>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "Complete survey form example with multiple Likert scale questions. Shows how to manage multiple responses in a form context.",
      },
    },
  },
};

export const MobileTouch: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <div className="flex min-h-[400px] w-full max-w-[400px] flex-col items-center justify-center gap-6 p-4">
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm font-medium text-blue-900">Test on Mobile!</p>
          <p className="mt-1 text-xs text-blue-700">Touch and drag the thumb or tap the track</p>
        </div>
        <SurveyLikertScale value={value} onChange={setValue} min={1} max={5} step={1}>
          <SurveyLikertScale.ScaleGuide
            labels={["Very Bad", "Bad", "Neutral", "Good", "Very Good"]}
          />
          <SurveyLikertScale.Thumb value={value} />
        </SurveyLikertScale>
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl font-bold text-violet-600">{value}</p>
          <p className="text-sm text-zinc-500">Selected Value</p>
        </div>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Mobile-optimized view for testing touch interactions. The slider works seamlessly with both mouse and touch inputs.",
      },
    },
  },
};

export const ThumbGallery: Story = {
  render: () => {
    return (
      <div className="flex min-h-[400px] w-[600px] flex-col gap-8 p-8">
        <h2 className="text-xl font-bold">Thumb Face Gallery</h2>
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center gap-2">
            <SurveyLikertScale.Thumb value={1} />
            <p className="text-sm text-zinc-600">Very Bad (1)</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <SurveyLikertScale.Thumb value={2} />
            <p className="text-sm text-zinc-600">Bad (2)</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <SurveyLikertScale.Thumb value={3} />
            <p className="text-sm text-zinc-600">Neutral (3)</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <SurveyLikertScale.Thumb value={4} />
            <p className="text-sm text-zinc-600">Good (4)</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <SurveyLikertScale.Thumb value={5} />
            <p className="text-sm text-zinc-600">Very Good (5)</p>
          </div>
        </div>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "Gallery showing all five face emoji variations (1=very bad, 2=bad, 3=neutral, 4=good, 5=very good). Useful for previewing the available thumb icons.",
      },
    },
  },
};
