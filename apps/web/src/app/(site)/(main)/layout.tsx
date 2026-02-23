import Providers from "@/components/providers/QueryProvider";
import { FixedBottomLayout, ModalProvider } from "@repo/ui/components";
import { BottomNavBar, Footer, Header } from "./components";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider>
      <Providers>
        <FixedBottomLayout hasGradientBlur>
          <Header />
          {children}
          <Footer />
          <FixedBottomLayout.Content className="px-0">
            <BottomNavBar />
          </FixedBottomLayout.Content>
        </FixedBottomLayout>
      </Providers>
    </ModalProvider>
  );
}
