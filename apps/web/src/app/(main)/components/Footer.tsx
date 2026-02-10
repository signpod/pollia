import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { Typo } from "@repo/ui/components";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex items-end justify-between bg-white p-5">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-[2.775px]">
          <PolliaIcon className="size-[11px]" />
          <PolliaWordmark className="h-4 w-auto" />
        </div>
        <Typo.Body size="small" className="text-zinc-300">
          © Pollia All rights reserved.
        </Typo.Body>
      </div>
      <Link
        href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Typo.Body size="small" className="text-info">
          개인정보처리방침
        </Typo.Body>
      </Link>
    </footer>
  );
}
