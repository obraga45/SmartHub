import { NextResponse } from "next/server";
import { fetchCurrencies } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const { quotes, source } = await fetchCurrencies();

    return NextResponse.json({
      ok: true,
      source,
      updatedAt: new Date().toISOString(),
      quotes,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.status || 502 }
    );
  }
}
