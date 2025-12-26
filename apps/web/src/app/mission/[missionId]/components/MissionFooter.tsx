import { Typo } from "@repo/ui/components";
import Image from "next/image";
import Link from "next/link";

export function MissionFooter() {
  return (
    <footer className="w-full px-5 py-4 flex gap-4 items-center justify-between">
      <div className="flex gap-2 items-center">
        <Image
          src="/images/pollia-logo.png"
          alt="Pollia"
          width={50}
          height={16}
          className="w-auto h-4 object-contain object-left"
        />
        <Typo.Body size="small" className="text-zinc-300">
          © Pollia All rights reserved.
        </Typo.Body>
      </div>

      <Link
        href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-zinc-400"
      >
        <Typo.Body size="small" className="text-info">
          개인정보처리방침
        </Typo.Body>
      </Link>
    </footer>
  );
}
