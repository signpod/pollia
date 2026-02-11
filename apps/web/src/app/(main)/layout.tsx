import Providers from "@/components/providers/QueryProvider";
import { ModalProvider, Toaster } from "@repo/ui/components";
import { BottomNavBar, Footer, Header } from "./components";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider>
      <Providers>
        <div className="pb-20">
          <Header />
          {children}
          <Footer />
        </div>
        <BottomNavBar />
        <Toaster />
      </Providers>
    </ModalProvider>
  );
}
