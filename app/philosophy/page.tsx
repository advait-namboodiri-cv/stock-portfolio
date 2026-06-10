import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PhilosophyPage() {
  let md = "# No ruleset found\n\nCreate data/philosophy.md.";
  try {
    md = await fs.readFile(path.join(process.cwd(), "data", "philosophy.md"), "utf8");
  } catch {
    // keep fallback
  }
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        <header className="rise border-b border-ink-edge pb-4">
          <Link href="/" className="text-xs text-paper-dim hover:text-agent transition-colors">
            ← back to the desk
          </Link>
          <h1 className="font-serif italic text-4xl mt-3">The Ruleset</h1>
          <p className="text-paper-dim text-xs mt-2 uppercase tracking-[0.25em]">
            what the agent is allowed to do, and nothing else
          </p>
        </header>
        <pre className="rise whitespace-pre-wrap text-sm leading-relaxed text-paper/90 border border-ink-edge bg-ink-raised/70 p-6" style={{ animationDelay: "100ms" }}>
          {md}
        </pre>
      </div>
    </main>
  );
}
