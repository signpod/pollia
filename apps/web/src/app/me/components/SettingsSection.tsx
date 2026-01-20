"use client";

import { Typo } from "@repo/ui/components";
import { ChevronRightIcon, FileTextIcon, MessageCircleIcon } from "lucide-react";
import Link from "next/link";

interface SettingsMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function SettingsMenuItem({ icon, label, href }: SettingsMenuItemProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-zinc-50"
    >
      <span className="text-zinc-500">{icon}</span>
      <Typo.Body size="large" className="flex-1">
        {label}
      </Typo.Body>
      <ChevronRightIcon className="h-5 w-5 text-zinc-300" />
    </Link>
  );
}

export function SettingsSection() {
  const privacyPolicyUrl = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL;
  const inquiryUrl = process.env.NEXT_PUBLIC_INQUIRY_URL;

  return (
    <section>
      <Typo.MainTitle size="small" className="mb-4">
        설정
      </Typo.MainTitle>
      <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
        {privacyPolicyUrl && (
          <SettingsMenuItem
            icon={<FileTextIcon className="h-5 w-5" />}
            label="개인정보 처리방침"
            href={privacyPolicyUrl}
          />
        )}
        {inquiryUrl && (
          <SettingsMenuItem
            icon={<MessageCircleIcon className="h-5 w-5" />}
            label="문의하기"
            href={inquiryUrl}
          />
        )}
      </div>
    </section>
  );
}
