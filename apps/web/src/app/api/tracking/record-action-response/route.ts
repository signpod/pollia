import { recordActionResponse } from "@/actions/tracking/record-action-response";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type RecordActionResponseInput = Pick<
  Prisma.TrackingActionResponseUncheckedCreateInput,
  "missionId" | "sessionId" | "userId" | "actionId" | "metadata"
>;

export async function POST(request: Request) {
  try {
    const data: RecordActionResponseInput = await request.json();

    await recordActionResponse(data);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[API] Failed to record action response:", error);

    if (error instanceof Error) {
      if (error.message.includes("validation") || error.message.includes("Invalid")) {
        return new NextResponse(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
