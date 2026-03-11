import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import { FixedBottomLayout, FixedTopLayout, ModalProvider } from "@repo/ui/components";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <NetworkStatusProvider>
        <FixedBottomLayout hasBottomGap={false} className="flex-1">
          <FixedTopLayout className="flex flex-1 flex-col py-6">{children}</FixedTopLayout>
        </FixedBottomLayout>
      </NetworkStatusProvider>
    </ModalProvider>
  );
}
