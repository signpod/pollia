import { Typo } from "@repo/ui/components";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 flex w-full items-center justify-between bg-background p-5">
      <Typo.Body size="small" className="text-zinc-300">
        © Pollia All rights reserved.
      </Typo.Body>
      <div className="flex items-center gap-4">
        <Link href="mailto:hi@pollia.me">
          <Typo.Body size="small" className="text-info">
            hi@pollia.me
          </Typo.Body>
        </Link>
        <Link
          href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Typo.Body size="small" className="text-info">
            개인정보처리방침
          </Typo.Body>
        </Link>
      </div>
    </footer>
  );
}
