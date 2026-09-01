import { NextResponse } from "next/server";
import { fetchCep } from "@/lib/cep";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const cep = request.nextUrl.searchParams.get("cep");
    const address = await fetchCep(cep);

    return NextResponse.json({
      ok: true,
      source: "ViaCEP",
      address,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.status || 502 }
    );
  }
}
