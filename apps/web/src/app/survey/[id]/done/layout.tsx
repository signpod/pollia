import { FixedBottomLayout } from "@repo/ui/components";

export default function SurveyDoneLayout({ children }: { children: React.ReactNode }) {
  return (
    <FixedBottomLayout className="flex flex-col min-h-screen">
      <div className="w-full flex justify-center flex-1">{children}</div>
    </FixedBottomLayout>
  );
}
