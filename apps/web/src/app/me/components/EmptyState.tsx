import { Typo } from "@repo/ui/components";

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-50 py-12">
      <Typo.Body size="large" className="text-zinc-400">
        {message}
      </Typo.Body>
    </div>
  );
}
