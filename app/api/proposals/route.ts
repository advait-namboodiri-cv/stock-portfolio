import { NextResponse } from "next/server";
import { getActivity, getProposals } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [proposals, activity] = await Promise.all([getProposals(), getActivity()]);
  return NextResponse.json({ proposals, activity });
}
