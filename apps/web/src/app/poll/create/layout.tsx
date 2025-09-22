import { AuthGate } from "@/components/providers/AuthGate";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate>{children}</AuthGate>;
}
