import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const md = await fs.readFile(path.join(process.cwd(), "data", "philosophy.md"), "utf8");
    return NextResponse.json({ markdown: md });
  } catch {
    return NextResponse.json({ markdown: "# No ruleset found\n\nCreate data/philosophy.md." });
  }
}
