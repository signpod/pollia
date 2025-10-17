import { FixedTopLayout, IconButton } from "@repo/ui/components";
import { MoreVertical, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function PollHeader() {
  const router = useRouter();

  const handleClickX = () => {
    router.push("/me");
  };

  return (
    <FixedTopLayout.Content className="bg-zinc-50">
      <div className="flex items-center justify-between px-1">
        <IconButton icon={X} className="size-12" onClick={handleClickX} />
        <IconButton icon={MoreVertical} className="size-12" disabled />
      </div>
    </FixedTopLayout.Content>
  );
}
