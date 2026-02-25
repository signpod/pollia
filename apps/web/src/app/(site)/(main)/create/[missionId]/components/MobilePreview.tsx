"use client";

import { Typo } from "@repo/ui/components";
import { useEditor } from "../context/EditorContext";

const SCALE = 310 / 390;

export function MobilePreview() {
  const {
    activeSection,
    activeActionIndex,
    activeCompletionIndex,
    previewMission,
    previewActions,
    previewCompletions,
  } = useEditor();

  const action = previewActions[activeActionIndex] ?? null;
  const completion = previewCompletions[activeCompletionIndex] ?? null;

  return (
    <div
      className="overflow-hidden rounded-[38px] border-[14px] border-zinc-900 bg-zinc-900 shadow-xl"
      style={{ width: 310, height: 560 }}
    >
      <div className="flex h-full w-full flex-col bg-white" style={{ width: 310, height: 560 }}>
        <div className="flex h-9 shrink-0 items-center justify-center border-b border-zinc-100 px-3">
          <span className="text-[10px] text-zinc-500">9:41</span>
        </div>
        <div
          className="flex-1 overflow-auto"
          style={{
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
            width: 390,
            minHeight: 471,
          }}
        >
          {activeSection === "info" && (
            <div className="flex min-h-full flex-col p-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-100">
                {previewMission?.imageUrl ? (
                  <img
                    src={previewMission.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-400">
                    썸네일
                  </div>
                )}
              </div>
              <Typo.Body size="large" className="mt-4 font-bold text-zinc-900">
                {previewMission?.title || "미션 제목"}
              </Typo.Body>
              {previewMission?.description ? (
                <div
                  className="mt-2 text-sm text-zinc-600 [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: previewMission.description }}
                />
              ) : (
                <Typo.Body size="small" className="mt-2 text-zinc-500">
                  설명을 입력하세요
                </Typo.Body>
              )}
            </div>
          )}
          {activeSection === "actions" && action && (
            <div className="flex min-h-full flex-col p-4">
              <Typo.Body size="large" className="font-bold text-zinc-900">
                {action.title || "질문 제목"}
              </Typo.Body>
              {action.description ? (
                <div
                  className="mt-2 text-sm text-zinc-600 [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: action.description }}
                />
              ) : (
                <Typo.Body size="small" className="mt-2 text-zinc-500">
                  질문 설명 (선택)
                </Typo.Body>
              )}
              <div className="mt-6 rounded-lg border border-dashed border-zinc-200 p-4 text-center text-zinc-400">
                응답 영역
              </div>
            </div>
          )}
          {activeSection === "completions" && (
            <div className="flex min-h-full flex-col p-4">
              {completion ? (
                <>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-100">
                    {completion.imageUrl ? (
                      <img
                        src={completion.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        이미지
                      </div>
                    )}
                  </div>
                  <Typo.Body size="large" className="mt-4 font-bold text-zinc-900">
                    {completion.title}
                  </Typo.Body>
                  <div
                    className="mt-2 text-sm text-zinc-600 [&_p]:mb-2"
                    dangerouslySetInnerHTML={{ __html: completion.description }}
                  />
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-zinc-400">
                  결과 화면을 추가하세요
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
