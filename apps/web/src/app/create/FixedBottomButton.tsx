"use client";

type Props = {
  onPrev: () => void;
  onNext: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
};

export default function FixedBottomButton({
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 border-t bg-[--color-background] p-3" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={disablePrev}
          className="h-12 flex-1 rounded-lg border bg-white transition disabled:bg-[--color-muted] disabled:text-[--color-muted-foreground] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ borderColor: "var(--color-input)" }}
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={disableNext}
          className="h-12 flex-[2] rounded-lg border text-white transition disabled:text-[--color-muted-foreground] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "var(--color-primary)", borderColor: "var(--color-foreground)" }}
        >
          다음
        </button>
      </div>
    </div>
  );
}


