"use client";

import React, { useState, useEffect } from "react";

// ============================================================================
// types for the compatibility analysis response
// ============================================================================
type Profile = {
  id: string;
  name: string;
  age?: number;
  occupation?: string;
  avatarUrl?: string;
};

type CompatibilityScore = {
  overall: number;
  confidence: number;
  subscores: {
    styleFit: number;
    paceFit: number;
    warmthFit: number;
    humorFit: number;
    depthFit: number;
    conflictFit: number;
  };
  whyItWorks: string[];
  watchOuts: string[];
  dynamicPrediction: string;
};

type MatchResult = {
  pair: { a: Profile; b: Profile };
  dna: { a: any; b: any };
  score: CompatibilityScore;
  simulation: string | null;
};

// ============================================================================
// fetch profiles from api on load (keeps chat history hidden from client)
// ============================================================================
type ProfileCard = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  avatarUrl: string;
};

export default function Home() {
  // profile data fetched from server
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  
  // ui state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // simulation flow state
  const [showSimulation, setShowSimulation] = useState(false);
  const [loadingSimulation, setLoadingSimulation] = useState(false);

  // fetch profiles on mount
  useEffect(() => {
    fetch("/api/profiles")
      .then((res) => res.json())
      .then((data) => setProfiles(data.profiles))
      .catch(() => setError("failed to load profiles"));
  }, []);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // run initial analysis (without simulation)
  async function onAnalyze() {
    if (selectedIds.length !== 2) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setShowSimulation(false);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idA: selectedIds[0],
          idB: selectedIds[1],
          includeSimulation: false,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `analysis failed (${res.status})`);
      }

      const data: MatchResult = await res.json();
      
      // validate response has required fields
      if (!data.score || typeof data.score.overall !== 'number') {
        throw new Error("invalid response from server");
      }
      
      setResult(data);
      setError(null);
    } catch (e: any) {
      console.error("analysis error:", e);
      setError(e.message || "something went wrong. tap to retry.");
    } finally {
      setLoading(false);
    }
  }

  // generate simulation when user clicks "match"
  async function onMatch() {
    if (!result) return;
    
    setLoadingSimulation(true);
    setError(null);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idA: selectedIds[0],
          idB: selectedIds[1],
          includeSimulation: true,
        }),
      });

      if (!res.ok) {
        // still show simulation modal but with error message
        setShowSimulation(true);
        return;
      }

      const data: MatchResult = await res.json();
      setResult(data);
      setShowSimulation(true);
    } catch (e) {
      console.error("simulation error:", e);
      // fallback: show modal without simulation
      setShowSimulation(true);
    } finally {
      setLoadingSimulation(false);
    }
  }

  // close modal and reset
  function onClose() {
    setResult(null);
    setShowSimulation(false);
    setSelectedIds([]);
  }

  // close without matching
  function onPass() {
    setResult(null);
    setShowSimulation(false);
  }

  // get color for score display
  function getScoreColor(score: number): string {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-500";
  }

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* header */}
      <header className="text-center mb-12">
        <h1 className="text-6xl font-serif text-[--hibiscus] mb-4">Conversation Lab</h1>
        <p className="text-lg opacity-80">testing chemistry beyond the swipe</p>
        <p className="text-sm opacity-50 mt-2">select two profiles to analyze their conversational compatibility</p>
      </header>

      {/* profile gallery */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {profiles.map((p) => (
          <div
            key={p.id}
            onClick={() => toggleSelect(p.id)}
            className={`cursor-pointer transition-all rounded-[32px] p-3 bg-white shadow-sm border-4 hover:shadow-lg
              ${selectedIds.includes(p.id) ? "border-[--hibiscus] scale-105 shadow-xl" : "border-transparent"}`}
          >
            <img
              src={p.avatarUrl}
              className="rounded-[24px] h-48 w-full object-cover mb-3"
              alt={p.name}
            />
            <h3 className="font-bold text-xl px-2">
              {p.name}, {p.age}
            </h3>
            <p className="text-sm opacity-60 px-2 pb-2">{p.occupation}</p>
            {selectedIds.includes(p.id) && (
              <div className="absolute top-2 right-2 bg-[--hibiscus] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                {selectedIds.indexOf(p.id) + 1}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* error display - clickable to retry */}
      {error && !loading && (
        <div 
          onClick={onAnalyze}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-6 py-3 rounded-xl cursor-pointer hover:bg-red-200 transition flex items-center gap-2 shadow-lg"
        >
          <span>⚠️ {error}</span>
          <span className="text-xs bg-red-200 px-2 py-1 rounded">tap to retry</span>
        </div>
      )}

      {/* action button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
        <button
          onClick={onAnalyze}
          disabled={selectedIds.length !== 2 || loading}
          className="bg-[#1a1a2e] text-white px-12 py-4 rounded-full font-bold text-lg shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-[#16213e] hover:scale-105 active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              analyzing...
            </span>
          ) : selectedIds.length < 2 ? (
            `select ${2 - selectedIds.length} more`
          ) : (
            "calculate chemistry"
          )}
        </button>
      </div>

      {/* result modal */}
      {result && !showSimulation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-[48px] max-w-2xl w-full relative shadow-2xl border-t-8 border-[--hibiscus] max-h-[90vh] overflow-y-auto">
            <button onClick={onClose} className="absolute top-6 right-8 text-3xl font-light hover:opacity-60">
              ×
            </button>

            {/* score header */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-4 mb-4">
                <img src={result.pair.a.avatarUrl} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow" alt={result.pair.a.name} />
                <div className={`w-24 h-24 rounded-full border-8 border-[--hibiscus] flex items-center justify-center text-3xl font-black ${getScoreColor(result.score.overall)}`}>
                  {result.score.overall}%
                </div>
                <img src={result.pair.b.avatarUrl} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow" alt={result.pair.b.name} />
              </div>
              <h2 className="text-2xl font-bold">{result.pair.a.name} × {result.pair.b.name}</h2>
              <p className="text-sm opacity-60 mt-1">confidence: {result.score.confidence}%</p>
            </div>

            {/* subscores grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Object.entries(result.score.subscores).map(([key, value]) => (
                <div key={key} className="bg-gray-100 p-3 rounded-xl text-center border border-gray-200">
                  <div className={`text-2xl font-bold ${getScoreColor(value)}`}>{value}</div>
                  <div className="text-xs text-gray-600">{key.replace("Fit", "")}</div>
                </div>
              ))}
            </div>

            {/* prediction */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 p-4 rounded-2xl mb-4 text-center italic text-gray-700">
              "{result.score.dynamicPrediction}"
            </div>

            {/* insights */}
            <div className="space-y-4 mb-8">
              <div className="bg-pink-50 border border-pink-200 p-4 rounded-2xl">
                <h4 className="font-bold text-[--hibiscus] mb-2">✨ why it works</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  {result.score.whyItWorks.map((reason, i) => (
                    <li key={i}>• {reason}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <h4 className="font-bold text-amber-700 mb-2">⚠️ watch out for</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  {result.score.watchOuts.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* action buttons */}
            <div className="flex gap-4">
              <button
                onClick={onPass}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold text-lg hover:bg-gray-300 transition"
              >
                pass
              </button>
              <button
                onClick={onMatch}
                disabled={loadingSimulation}
                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition disabled:opacity-50 ${
                  result.score.overall >= 70 
                    ? "bg-[--hibiscus] text-white hover:opacity-90" 
                    : result.score.overall >= 50 
                    ? "bg-amber-500 text-white hover:opacity-90"
                    : "bg-gray-500 text-white hover:opacity-90"
                }`}
              >
                {loadingSimulation ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    simulating...
                  </span>
                ) : result.score.overall >= 70 ? (
                  "it's a match! 💕"
                ) : result.score.overall >= 50 ? (
                  "see how it could go 🤔"
                ) : (
                  "simulate anyway? 👀"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* simulation modal */}
      {result && showSimulation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`bg-[--background] p-8 rounded-[48px] max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto ${
            result.score.overall >= 70 ? "border-t-8 border-[--sage]" : "border-t-8 border-amber-400"
          }`}>
            <button onClick={onClose} className="absolute top-6 right-8 text-3xl font-light hover:opacity-60">
              ×
            </button>

            {/* header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{result.score.overall >= 70 ? "💬" : "⚡"}</div>
              <h2 className="text-2xl font-bold">
                {result.score.overall >= 70 ? "how they might chat" : "where it might get tricky"}
              </h2>
              <p className="text-sm opacity-60">ai-generated simulation based on their conversation dna</p>
            </div>

            {/* simulated conversation */}
            <div className="bg-white/50 rounded-2xl p-4 mb-6 max-h-96 overflow-y-auto">
              {result.simulation ? (
                <div className="space-y-2 font-mono text-sm">
                  {result.simulation.split("\n").map((line, i) => {
                    const isPersonA = line.toLowerCase().startsWith(result.pair.a.name.toLowerCase());
                    const isPersonB = line.toLowerCase().startsWith(result.pair.b.name.toLowerCase());
                    
                    return (
                      <div
                        key={i}
                        className={`p-2 rounded-lg ${
                          isPersonA
                            ? "bg-[--hibiscus]/10 ml-0 mr-8"
                            : isPersonB
                            ? "bg-[--sage]/10 ml-8 mr-0"
                            : "opacity-50"
                        }`}
                      >
                        {line}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center opacity-60">simulation not available</p>
              )}
            </div>

            {/* result message based on score */}
            <div className="text-center">
              {result.score.overall >= 70 ? (
                <p className="text-lg font-bold text-[--hibiscus] mb-4">match confirmed! 🎉</p>
              ) : result.score.overall >= 50 ? (
                <p className="text-lg font-bold text-amber-600 mb-4">could work with effort! 💪</p>
              ) : (
                <p className="text-lg font-bold text-gray-500 mb-4">might be a tough match 😬</p>
              )}
              <button
                onClick={onClose}
                className="bg-[#1a1a2e] text-white px-8 py-3 rounded-full font-bold hover:bg-[#16213e] transition"
              >
                done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ethics footer */}
      <footer className="text-center text-[10px] opacity-40 mt-20 pb-10 max-w-2xl mx-auto">
        <p className="font-bold mb-2">legal & ethical notice</p>
        <p>
          conversation lab predicts communication friction, not destiny. data is processed via anonymized embeddings. 
          by using this tool, you consent to linguistic pattern analysis. no raw chat history is stored.
        </p>
      </footer>
    </main>
  );
}

