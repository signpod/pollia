import { AdminGate } from "@/app/admin/components/guards/AdminGate";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
