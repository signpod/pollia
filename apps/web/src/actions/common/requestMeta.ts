"use server";

import { headers } from "next/headers";

function parseForwardedFor(raw: string | null): string | null {
  if (!raw) {
    return null;
  }

  const firstIp = raw.split(",")[0]?.trim();
  return firstIp && firstIp.length > 0 ? firstIp : null;
}

export interface RequestMeta {
  ipAddress: string | null;
  userAgent: string | null;
}

export async function getRequestMeta(): Promise<RequestMeta> {
  const headerList = await headers();

  const ipAddress =
    parseForwardedFor(headerList.get("x-forwarded-for")) ??
    headerList.get("x-real-ip") ??
    headerList.get("cf-connecting-ip") ??
    null;

  const userAgent = headerList.get("user-agent") ?? null;

  return {
    ipAddress,
    userAgent,
  };
}
