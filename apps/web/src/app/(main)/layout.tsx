import Providers from "@/components/providers/QueryProvider";
import { ModalProvider, Toaster } from "@repo/ui/components";
import { Footer, Header } from "./components";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider>
      <Providers>
        <Header />
        {children}
        <Footer />
        <Toaster />
      </Providers>
    </ModalProvider>
  );
}
