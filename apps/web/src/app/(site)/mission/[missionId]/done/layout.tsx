import { FixedBottomLayout } from "@repo/ui/components";

export default function MissionDoneLayout({ children }: { children: React.ReactNode }) {
  return (
    <FixedBottomLayout
      className="flex flex-col min-h-screen [scrollbar-gutter:stable]"
      hasGradient
      hasBottomGap={false}
    >
      <div className="w-full flex justify-center flex-1">{children}</div>
    </FixedBottomLayout>
  );
}
