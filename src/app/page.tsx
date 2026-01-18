"use client";

import React, { useState } from "react";

// 1. Defined profiles with "hidden" chat history for the demo
const PROFILES = [
  { id: "1", name: "Kyle", age: 24, occupation: "Surf Instructor", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", history: "Hey! Just got back from the waves. You catch the sunset? / Yeah it was wild! / I'm starving, tacos?" },
  { id: "2", name: "Maya", age: 26, occupation: "Digital Artist", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", history: "I've been staring at my iPad for 8 hours. Send help lol. / What are you drawing? / A futuristic version of Toronto." },
  { id: "3", name: "Elena", age: 23, occupation: "Plant Shop Owner", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400", history: "The monstera is finally blooming! / That's amazing. / Do you think plants have feelings? Because I'm worried about my fern." },
  { id: "4", name: "Jordan", age: 27, occupation: "Chef", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", history: "Service was crazy tonight. / What's the special? / Truffle risotto. I'm exhausted." }
];

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
  score: {
    overall: number;
    whyItWorks: string[];
    watchOuts: string[];
  };
};

export default function Home() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  async function onAnalyze() {
    setLoading(true);
    setError(null);
    
    // Find the chat history for the two selected people
    const personA = PROFILES.find(p => p.id === selectedIds[0]);
    const personB = PROFILES.find(p => p.id === selectedIds[1]);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatA: personA?.history, chatB: personB?.history }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json() as MatchResult;
      setResult(data);
    } catch (e: any) {
      setError("Something went wrong with the Lab analysis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-6xl font-serif text-[--hibiscus] mb-4">Conversation Lab</h1>
        <p className="text-lg opacity-80">Testing chemistry beyond the swipe.</p>
      </header>

      {/* Profile Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {PROFILES.map((p) => (
          <div 
            key={p.id} 
            onClick={() => toggleSelect(p.id)}
            className={`cursor-pointer transition-all rounded-[32px] p-3 bg-white shadow-sm border-4 
              ${selectedIds.includes(p.id) ? 'border-[--hibiscus] scale-105 shadow-xl' : 'border-transparent'}`}
          >
            <img src={p.image} className="rounded-[24px] h-48 w-full object-cover mb-3" alt={p.name} />
            <h3 className="font-bold text-xl px-2">{p.name}, {p.age}</h3>
            <p className="text-sm opacity-60 px-2 pb-2">{p.occupation}</p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
        <button 
          onClick={onAnalyze}
          disabled={selectedIds.length !== 2 || loading}
          className="bg-[--hibiscus] text-white px-12 py-4 rounded-full font-bold text-lg shadow-2xl disabled:opacity-20 transition-transform active:scale-95"
        >
          {loading ? "Simulating Chats..." : selectedIds.length < 2 ? `Select ${2 - selectedIds.length} more` : "Calculate Chemistry"}
        </button>
      </div>

      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[--background] p-10 rounded-[48px] max-w-lg w-full relative shadow-2xl border-t-8 border-[--hibiscus]">
            <button onClick={() => setResult(null)} className="absolute top-6 right-8 text-3xl font-light">×</button>
            
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-full border-8 border-[--hibiscus] flex items-center justify-center text-3xl font-black mx-auto mb-4">
                {result.score.overall}%
              </div>
              <h2 className="text-3xl font-bold">Match Score</h2>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-white/50 p-4 rounded-2xl">
                <h4 className="font-bold text-[--hibiscus] mb-1">Why it works</h4>
                <p className="text-sm">{result.score.whyItWorks[0]}</p>
              </div>
              <div className="bg-white/50 p-4 rounded-2xl">
                <h4 className="font-bold text-[--sage] mb-1">Watch out for</h4>
                <p className="text-sm">{result.score.watchOuts[0]}</p>
              </div>
            </div>

            <button className="w-full bg-[--hibiscus] text-white py-4 rounded-2xl font-bold text-lg">
              It's a Match!
            </button>
          </div>
        </div>
      )}

      {/* Ethics Footer */}
      <footer className="text-center text-[10px] opacity-40 mt-20 pb-10 max-w-2xl mx-auto">
        <p className="font-bold mb-2">LEGAL & ETHICAL NOTICE</p>
        <p>Conversation Lab predicts communication friction, not destiny. Data is processed via anonymized embeddings. By using this tool, you consent to linguistic pattern analysis. No raw chat history is stored.</p>
      </footer>
    </main>
  );
}

