import { NextResponse } from "next/server";
import { createRecords } from "@/lib/airtable";
import { fetchCurrencies, toAirtableCurrencyFields } from "@/lib/currency";
import { notifyVariationAlerts } from "@/lib/webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 15;

async function runSync() {
  const { quotes, source } = await fetchCurrencies();
  const fieldsList = quotes.map(toAirtableCurrencyFields);
  const saved = await createRecords(fieldsList);
  const webhook = await notifyVariationAlerts(quotes);

  return {
    ok: true,
    syncedAt: new Date().toISOString(),
    source,
    quotes,
    savedCount: saved.length,
    webhook,
  };
}

export async function GET() {
  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.status || 502 }
    );
  }
}

export async function POST() {
  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.status || 502 }
    );
  }
}
