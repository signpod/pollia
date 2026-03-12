"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MultipleChoiceSlideProps {
  data: AiReportData;
}

const COLORS = ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"];

export function MultipleChoiceSlide({ data }: MultipleChoiceSlideProps) {
  const { multipleChoice } = data.stats;

  if (multipleChoice.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-7 py-7">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex size-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
            4
          </span>
          <Typo.SubTitle>객관식 응답</Typo.SubTitle>
        </div>
        <Typo.Body size="medium" className="text-zinc-400">
          객관식 질문이 없습니다.
        </Typo.Body>
      </div>
    );
  }

  const displayed = multipleChoice.slice(0, 3);

  return (
    <div className="flex h-full flex-col overflow-y-auto px-7 py-7">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
          4
        </span>
        <Typo.SubTitle>객관식 응답</Typo.SubTitle>
      </div>
      <div className="space-y-4">
        {displayed.map((question, qi) => {
          const chartData = question.responses.slice(0, 6).map(r => ({
            name: r.label.length > 10 ? `${r.label.slice(0, 10)}...` : r.label,
            count: r.count,
          }));

          return (
            <div key={question.actionId} className="rounded-xl bg-zinc-50/60 p-3">
              <div className="mb-1.5 text-xs font-medium text-zinc-500">{question.title}</div>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#d4d4d8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#d4d4d8" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e4e4e7",
                        fontSize: 12,
                      }}
                    />
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
