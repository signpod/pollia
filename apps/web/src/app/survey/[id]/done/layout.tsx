import { ButtonV2, FixedBottomLayout } from "@repo/ui/components";

export default function SurveyDoneLayout({ children }: { children: React.ReactNode }) {
  return (
    <FixedBottomLayout className="flex flex-col min-h-screen">
      <div className="w-full flex items-center justify-center flex-1">{children}</div>
      <FixedBottomLayout.Content className="px-5 py-3">
        <ButtonV2 variant="primary" size="large" className="w-full ">
          <div className="flex justify-center items-center text-center flex-1">확인</div>
        </ButtonV2>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}
