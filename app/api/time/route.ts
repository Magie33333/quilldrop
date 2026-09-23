import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Zabezpečený serverový koncový bod pro zjištění autoritativního UTC času.
 * Klientské zařízení nemůže tento čas zfalšovat změnou systémových hodin.
 */
export async function GET() {
  const now = new Date();
  return NextResponse.json(
    {
      now: now.toISOString(),
      date: now.toISOString().slice(0, 10),
      timestamp: now.getTime(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
