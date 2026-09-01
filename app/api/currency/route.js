import { NextResponse } from "next/server";
import { fetchCurrencies } from "@/lib/currency";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quotes = await fetchCurrencies();

    return NextResponse.json({
      ok: true,
      source: "AwesomeAPI",
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
