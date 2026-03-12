"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MultipleChoiceSlideProps {
  data: AiReportData;
}

const COLORS = ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8"];

export function MultipleChoiceSlide({ data }: MultipleChoiceSlideProps) {
  const { multipleChoice } = data.stats;

  if (multipleChoice.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-6">
        <Typo.SubTitle className="mb-2">객관식 응답</Typo.SubTitle>
        <Typo.Body size="medium" className="text-zinc-400">
          객관식 질문이 없습니다.
        </Typo.Body>
      </div>
    );
  }

  const displayed = multipleChoice.slice(0, 4);

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-6">
      <Typo.SubTitle className="mb-4">객관식 응답</Typo.SubTitle>
      <div className="space-y-5">
        {displayed.map((question, qi) => {
          const chartData = question.responses.slice(0, 6).map(r => ({
            name: r.label.length > 10 ? `${r.label.slice(0, 10)}...` : r.label,
            count: r.count,
          }));

          return (
            <div key={question.actionId}>
              <Typo.Body size="small" className="mb-2 font-medium text-zinc-600">
                {question.title}
              </Typo.Body>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#a1a1aa" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#a1a1aa" allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill={COLORS[qi % COLORS.length]}
                      radius={[4, 4, 0, 0]}
                      name="응답 수"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
