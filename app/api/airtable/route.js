import { NextResponse } from "next/server";
import { createRecord, getAirtableConfig, listRecords } from "@/lib/airtable";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const { configured, tableName } = getAirtableConfig();
    if (!configured) {
      return NextResponse.json(
        {
          ok: false,
          configured: false,
          error: "Airtable não configurado. Defina AIRTABLE_API_KEY, AIRTABLE_BASE_ID e AIRTABLE_TABLE_NAME na Vercel (Settings → Environment Variables) e faça Redeploy.",
        },
        { status: 503 }
      );
    }

    const records = await listRecords();

    return NextResponse.json({
      ok: true,
      configured: true,
      tableName,
      count: records.length,
      records,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, configured: true, error: error.message },
      { status: error.status || 502 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const fields = body?.fields;

    if (!fields || typeof fields !== "object") {
      return NextResponse.json(
        { ok: false, error: "Envie um objeto fields para persistir no Airtable." },
        { status: 400 }
      );
    }

    const record = await createRecord(fields);

    return NextResponse.json({
      ok: true,
      record,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.status || 502 }
    );
  }
}
