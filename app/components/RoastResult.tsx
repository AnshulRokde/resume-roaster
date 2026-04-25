"use client";

import type { RoastResult } from "@/types/roast";

const SCORE_LABELS: Record<string, string> = {
  clarity: "Clarity",
  impact: "Impact",
  formatting: "Formatting",
  keywords: "Keywords",
  ats: "ATS Compat.",
};

const SCORE_COLORS: Record<number, string> = {};
function scoreColor(n: number): string {
  if (n <= 3) return "bg-red-500";
  if (n <= 6) return "bg-yellow-500";
  return "bg-green-500";
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${scoreColor(value)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-700 w-8 text-right">
        {value}/10
      </span>
    </div>
  );
}

interface Props {
  result: RoastResult;
  fileName: string;
  onReset: () => void;
}

export default function RoastResult({ result, fileName, onReset }: Props) {
  void SCORE_COLORS; // unused but satisfies lint

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Card header */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <span className="text-xl">
            {fileName.endsWith(".pdf") ? "📄" : "🖼️"}
          </span>
          <span className="font-semibold text-gray-800 text-sm truncate">
            {fileName}
          </span>
          <span className="ml-auto text-xs bg-[#ff6b6b]/10 text-[#ff6b6b] font-bold px-2.5 py-1 rounded-full">
            ROASTED
          </span>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* Opening roast */}
          <div className="bg-[#ff6b6b]/5 border border-[#ff6b6b]/20 rounded-xl p-4">
            <p className="text-[#ff6b6b] font-bold text-base leading-relaxed">
              🔥 &ldquo;{result.roast}&rdquo;
            </p>
          </div>

          {/* Scores */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-gray-800 font-black text-sm uppercase tracking-wider">
                Score
              </h3>
              <span className="text-2xl font-black text-gray-800">
                {result.score.overall}
                <span className="text-gray-400 font-normal text-base">/10</span>
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {Object.entries(result.score.breakdown).map(([key, val]) => (
                <ScoreBar
                  key={key}
                  label={SCORE_LABELS[key] ?? key}
                  value={val}
                />
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div>
            <h3 className="text-gray-800 font-black text-sm uppercase tracking-wider mb-3">
              Top 5 Improvements
            </h3>
            <ol className="flex flex-col gap-4">
              {result.improvements.map((imp) => (
                <li key={imp.number} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#ff6b6b] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {imp.number}
                  </span>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">
                      {imp.title}
                    </p>
                    <div className="bg-red-50 rounded-lg px-3 py-2 text-xs text-red-700">
                      <span className="font-bold">Before: </span>
                      {imp.before}
                    </div>
                    <div className="bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700">
                      <span className="font-bold">After: </span>
                      {imp.after}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Overall vibe */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Overall Vibe
            </p>
            <p className="text-gray-700 italic text-sm leading-relaxed">
              &ldquo;{result.vibe}&rdquo;
            </p>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="w-full py-3 rounded-xl border-2 border-[#ff6b6b] text-[#ff6b6b] font-bold text-sm hover:bg-[#ff6b6b] hover:text-white transition-all"
          >
            🔄 Roast Another Resume
          </button>
        </div>
      </div>
    </div>
  );
}
