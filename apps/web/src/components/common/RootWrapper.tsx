import { cn } from "@repo/ui/lib";

export function RootWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "mx-auto min-h-svh w-full max-w-[600px] bg-background shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]",
      )}
    >
      {children}
    </div>
  );
}
