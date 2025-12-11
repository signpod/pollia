import { AdminSidebarTrigger } from "./AdminSidebarTrigger";

export function AdminLayoutHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2">
      <AdminSidebarTrigger />
      {/*TODO: 뒤로가기, 새로고침 등 버튼 추가 */}
    </header>
  );
}
