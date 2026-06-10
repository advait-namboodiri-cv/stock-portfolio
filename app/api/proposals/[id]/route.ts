import { NextResponse } from "next/server";
import { submitOrder } from "@/lib/alpaca";
import { appendActivity, updateProposal } from "@/lib/store";

export const dynamic = "force-dynamic";

// POST /api/proposals/:id  { decision: "approve" | "reject" }
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { decision } = (await req.json()) as { decision?: string };

  if (decision !== "approve" && decision !== "reject") {
    return NextResponse.json({ error: "decision must be approve or reject" }, { status: 400 });
  }

  if (decision === "reject") {
    const proposal = await updateProposal(id, { status: "rejected" });
    if (!proposal) return NextResponse.json({ error: "proposal not found" }, { status: 404 });
    await appendActivity({
      kind: "rejected",
      symbol: proposal.symbol,
      action: proposal.action,
      notional: proposal.notional,
      summary: `Rejected: ${proposal.action} $${proposal.notional} ${proposal.symbol}`,
      reasoning: proposal.reasoning,
    });
    return NextResponse.json({ proposal });
  }

  const approved = await updateProposal(id, { status: "approved" });
  if (!approved) return NextResponse.json({ error: "proposal not found" }, { status: 404 });

  try {
    const order = await submitOrder(approved.symbol, approved.notional, approved.action);
    const proposal = await updateProposal(id, { status: "executed", orderId: order.id });
    await appendActivity({
      kind: "executed",
      symbol: approved.symbol,
      action: approved.action,
      notional: approved.notional,
      summary: `Executed: ${approved.action} $${approved.notional} ${approved.symbol} (order ${order.status})`,
      reasoning: approved.reasoning,
    });
    return NextResponse.json({ proposal });
  } catch (err) {
    const message = err instanceof Error ? err.message : "order failed";
    const proposal = await updateProposal(id, { status: "failed", error: message });
    await appendActivity({
      kind: "failed",
      symbol: approved.symbol,
      action: approved.action,
      notional: approved.notional,
      summary: `Order failed: ${approved.action} $${approved.notional} ${approved.symbol}`,
      reasoning: message,
    });
    return NextResponse.json({ proposal, error: message }, { status: 502 });
  }
}
