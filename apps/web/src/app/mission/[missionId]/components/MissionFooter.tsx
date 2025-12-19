import { Typo } from "@repo/ui/components";
import Image from "next/image";
import Link from "next/link";

export function MissionFooter() {
  return (
    <footer className="w-full bg-zinc-700 px-5 py-4 flex flex-col gap-4">
      <Link
        href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-zinc-400"
      >
        <Typo.Body size="medium" className="text-disabled">
          개인정보처리방침
        </Typo.Body>
      </Link>

      <Image
        src="/images/pollia-logo-white.png"
        alt="Pollia"
        width={100}
        height={100}
        className="w-auto h-10 object-contain object-left"
      />

      <Typo.Body size="medium" className="text-info">
        © Pollia All rights reserved.
      </Typo.Body>
    </footer>
  );
}
