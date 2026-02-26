import { Typo } from "@repo/ui/components";

export default function EditorMissionPreviewPage() {
  return (
    <div className="border border-zinc-200 bg-white px-5 py-6">
      <Typo.SubTitle>미리보기</Typo.SubTitle>
      <Typo.Body size="medium" className="mt-2 text-zinc-500">
        미리보기 탭은 다음 단계에서 연결합니다.
      </Typo.Body>
    </div>
  );
}
