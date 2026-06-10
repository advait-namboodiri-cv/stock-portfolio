import { NextResponse } from "next/server";
import { getAccount, getHistory, getPositions } from "@/lib/alpaca";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [account, positions, history] = await Promise.all([
      getAccount(),
      getPositions(),
      getHistory(),
    ]);
    return NextResponse.json({ account, positions, history });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "portfolio fetch failed" },
      { status: 502 },
    );
  }
}
