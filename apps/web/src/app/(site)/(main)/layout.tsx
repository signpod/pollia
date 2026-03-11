import Providers from "@/components/providers/QueryProvider";
import { FixedBottomLayout, ModalProvider } from "@repo/ui/components";
import { Header } from "./components";
import { MainBottomContentStack } from "./components/MainBottomContentStack";
import { MainBottomSlotProvider } from "./components/MainBottomSlotContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider>
      <Providers>
        <MainBottomSlotProvider>
          <FixedBottomLayout hasGradientBlur className="flex flex-1 flex-col">
            <Header />
            <div className="flex flex-1 flex-col">{children}</div>
            <FixedBottomLayout.Content className="px-0">
              <MainBottomContentStack />
            </FixedBottomLayout.Content>
          </FixedBottomLayout>
        </MainBottomSlotProvider>
      </Providers>
    </ModalProvider>
  );
}
