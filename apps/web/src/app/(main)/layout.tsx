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
        <div className="mx-auto w-full max-w-[600px] pb-20 shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]">
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
