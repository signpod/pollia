import Providers from "@/components/providers/QueryProvider";
import { ModalProvider, Toaster } from "@repo/ui/components";
import { Header } from "./components";

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
        <Toaster />
      </Providers>
    </ModalProvider>
  );
}
