"use client";

import { Typo } from "@repo/ui/components";

interface CreateSuccessScreenProps {
  missionId: string;
  warnings: string[];
}

export function CreateSuccessScreen({ missionId, warnings }: CreateSuccessScreenProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-6">
      <div className="flex flex-col gap-2">
        <Typo.SubTitle>프로젝트가 생성되었습니다.</Typo.SubTitle>
        <Typo.Body size="medium" className="text-zinc-600">
          프로젝트 ID: {missionId}
        </Typo.Body>
      </div>

      {warnings.length > 0 ? (
        <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4">
          <Typo.Body size="medium" className="text-red-700">
            일부 항목은 적용되지 않았습니다.
          </Typo.Body>
          <ul className="mt-2 list-disc pl-5">
            {warnings.map(warning => (
              <li key={warning} className="text-sm text-red-600">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
