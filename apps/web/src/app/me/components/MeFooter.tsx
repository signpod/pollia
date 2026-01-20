import { Typo } from "@repo/ui/components";
import Link from "next/link";

export function MeFooter() {
  return (
    <footer className="flex w-full items-center justify-between p-5">
      <Typo.Body size="small" className="text-zinc-300">
        © Pollia All rights reserved.
      </Typo.Body>
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
