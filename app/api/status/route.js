import { NextResponse } from "next/server";
import { getAirtableConfig } from "@/lib/airtable";
import { readEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const airtable = getAirtableConfig();

  return NextResponse.json({
    ok: true,
    environment: process.env.VERCEL_ENV || "local",
    services: {
      awesomeapi: { configured: true },
      viacep: { configured: true },
      airtable: {
        configured: airtable.configured,
        tableSet: Boolean(airtable.tableName),
      },
      slack: { configured: Boolean(readEnv("SLACK_WEBHOOK_URL")) },
    },
  });
}
