"use client";

import { useEffect, useMemo, useState } from "react";

type Profile = {
  id: string;
  name: string;
  age?: number;
  occupation?: string;
  avatarUrl?: string;
};

type MatchResult = {
  pair: { a: Profile; b: Profile };
  result: {
    dnaA: { verbosity: number; humor: number; directness: number };
    dnaB: { verbosity: number; humor: number; directness: number };
    compatScore: number;
  };
};

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [idA, setIdA] = useState<string>("");
  const [idB, setIdB] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profiles");
      const data = await res.json();
      setProfiles(data.profiles ?? []);
    })();
  }, []);

  const canRun = useMemo(() => idA && idB && idA !== idB, [idA, idB]);

  async function runMatch() {
    setError("");
    setMatch(null);
    setLoading(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idA, idB }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const data = (await res.json()) as MatchResult;
      setMatch(data);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Conversation Lab (Dev Demo)</h1>
      <p className="mt-2 text-sm opacity-80">
        Select two profiles, then run the LangGraph + Backboard pipeline.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {profiles.map((p) => {
          const selected = p.id === idA || p.id === idB;
          return (
            <button
              key={p.id}
              className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                selected ? "border-black" : "border-gray-200"
              }`}
              onClick={() => {
                if (!idA) setIdA(p.id);
                else if (!idB && p.id !== idA) setIdB(p.id);
                else if (p.id === idA) setIdA("");
                else if (p.id === idB) setIdB("");
              }}
            >
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="mt-1 text-sm opacity-80">
                {p.occupation} {p.age ? `• ${p.age}` : ""}
              </div>
              <div className="mt-3 text-xs opacity-60">id: {p.id}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="text-sm">
          Selected: <b>{idA || "—"}</b> & <b>{idB || "—"}</b>
        </div>

        <button
          disabled={!canRun || loading}
          onClick={runMatch}
          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
            !canRun || loading ? "bg-gray-400" : "bg-black"
          }`}
        >
          {loading ? "Analyzing..." : "Run Match"}
        </button>

        <button
          onClick={() => {
            setIdA("");
            setIdB("");
            setMatch(null);
            setError("");
          }}
          className="rounded-xl border px-4 py-2 text-sm"
        >
          Reset
        </button>
      </div>

      {error ? (
        <pre className="mt-6 whitespace-pre-wrap rounded-xl border border-red-300 bg-red-50 p-4 text-sm">
          {error}
        </pre>
      ) : null}

      {match ? (
        <div className="mt-6 rounded-2xl border p-5 shadow-sm">
          <div className="text-xl font-bold">
            Compatibility: {match.result.compatScore}%
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="font-semibold">{match.pair.a.name}</div>
              <pre className="mt-2 text-sm">
{JSON.stringify(match.result.dnaA, null, 2)}
              </pre>
            </div>
            <div className="rounded-xl border p-4">
              <div className="font-semibold">{match.pair.b.name}</div>
              <pre className="mt-2 text-sm">
{JSON.stringify(match.result.dnaB, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
