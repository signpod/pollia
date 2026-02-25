import { ROUTES } from "@/constants/routes";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "서비스 소개", href: "/", className: "text-primary" },
  { label: "이용약관", href: "#", className: "text-zinc-500" },
  {
    label: "개인정보처리방침",
    href: process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL ?? "#",
    external: true,
    className: "text-zinc-500",
  },
  { label: "문의하기", href: ROUTES.ME_PARTNERSHIP, className: "text-zinc-500" },
] as const;

export function Footer() {
  return (
    <footer className="flex items-end justify-between bg-zinc-50 px-5 py-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold tracking-tight text-primary">폴리아 Pollia</h2>
          <p className="text-sm text-zinc-500">
            폴리아는 재미있는 참여로 인사이트를 만드는 리서치 콘텐츠 플랫폼 입니다.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {FOOTER_LINKS.map((link, i) => (
            <span key={link.label} className="flex items-center gap-x-2">
              {i > 0 && <span className="text-zinc-300">|</span>}
              {"external" in link && link.external ? (
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link.className}
                >
                  {link.label}
                </Link>
              ) : (
                <Link href={link.href} className={link.className}>
                  {link.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
        <p className="text-sm text-zinc-500">© 2026 Pollia. All rights reserved.</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <PolliaIcon className="size-6 text-primary" />
        <PolliaWordmark className="h-6 w-auto text-black" />
      </div>
    </footer>
  );
}
