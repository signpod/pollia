import { FixedBottomLayout, FixedTopLayout, ModalProvider } from "@repo/ui/components";
import LoginHeaderLogo from "./LoginHeaderLogo";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <FixedBottomLayout hasBottomGap={false} className="min-h-screen">
        <FixedTopLayout className="flex min-h-screen flex-1 flex-col py-6">
          <FixedTopLayout.Content>
            <div className="flex items-center justify-center gap-2 py-3">
              <LoginHeaderLogo />
            </div>
          </FixedTopLayout.Content>

          {children}
        </FixedTopLayout>
      </FixedBottomLayout>
    </ModalProvider>
  );
}
