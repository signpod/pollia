import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";
import LoginHeaderLogo from "./LoginHeaderLogo";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FixedBottomLayout hasBottomGap={false} className="min-h-screen">
      <FixedTopLayout className="flex-1 min-h-screen flex flex-col py-6">
        <FixedTopLayout.Content>
          <div className="flex items-center gap-2 justify-center py-3">
            <LoginHeaderLogo />
          </div>
        </FixedTopLayout.Content>

        {children}
      </FixedTopLayout>
    </FixedBottomLayout>
  );
}
