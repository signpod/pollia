import { AdminGate } from "./components/guards/AdminGate";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
