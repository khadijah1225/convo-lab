"use client";

import { useState } from "react";

type ApiResponse = {
  score: {
    overall: number;
    confidence: number;
    subscores: Record<string, number>;
    riskFlags: string[];
    whyItWorks: string[];
    watchOuts: string[];
  };
};

export default function Home() {
  const [chatA, setChatA] = useState("");
  const [chatB, setChatB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onAnalyze() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatA, chatB }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as ApiResponse;
      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">Conversation Lab</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Paste two chat histories. We’ll estimate conversational compatibility (MVP).
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Chat A</label>
            <textarea
              className="mt-2 h-72 w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-neutral-400"
              value={chatA}
              onChange={(e) => setChatA(e.target.value)}
              placeholder="Paste Person A's chat history..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Chat B</label>
            <textarea
              className="mt-2 h-72 w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-neutral-400"
              value={chatB}
              onChange={(e) => setChatB(e.target.value)}
              placeholder="Paste Person B's chat history..."
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onAnalyze}
            disabled={loading || !chatA.trim() || !chatB.trim()}
            className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {result && (
          <section className="mt-10 rounded-2xl border border-neutral-200 p-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold">Compatibility</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Confidence: {result.score.confidence}/100
                </p>
              </div>

              <div className="text-4xl font-semibold">{result.score.overall}/100</div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-neutral-50 p-4">
                <h3 className="text-sm font-semibold">Subscores</h3>
                <ul className="mt-3 space-y-1 text-sm text-neutral-700">
                  {Object.entries(result.score.subscores).map(([k, v]) => (
                    <li key={k} className="flex justify-between">
                      <span className="capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-neutral-50 p-4">
                <h3 className="text-sm font-semibold">Risk flags</h3>
                {result.score.riskFlags.length === 0 ? (
                  <p className="mt-3 text-sm text-neutral-600">None detected in MVP.</p>
                ) : (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    {result.score.riskFlags.map((x) => <li key={x}>{x}</li>)}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">Why it works</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                  {result.score.whyItWorks.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Watch-outs</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                  {result.score.watchOuts.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
