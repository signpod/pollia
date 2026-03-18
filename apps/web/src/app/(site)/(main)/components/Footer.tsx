import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { Typo } from "@repo/ui/components";

export function Footer() {
  return (
    <footer className="flex items-end justify-between bg-white px-5 py-3">
      <div className="flex items-center gap-[2.775px]">
        <PolliaIcon className="size-[11px] text-primary" />
        <PolliaWordmark className="h-4 w-auto" />
      </div>

      <Typo.Body size="small" className="text-zinc-300">
        © Pollia All rights reserved.
      </Typo.Body>
    </footer>
  );
}
