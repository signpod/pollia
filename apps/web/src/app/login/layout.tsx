import { FixedBottomLayout, FixedTopLayout, ModalProvider } from "@repo/ui/components";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <FixedBottomLayout hasBottomGap={false} className="min-h-screen">
        <FixedTopLayout className="flex min-h-screen flex-1 flex-col py-6">
          {children}
        </FixedTopLayout>
      </FixedBottomLayout>
    </ModalProvider>
  );
}
