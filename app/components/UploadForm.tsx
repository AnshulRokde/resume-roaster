"use client";

import { useState, useRef, useCallback } from "react";
import RoastResult from "@/app/components/RoastResult";
import type { RoastResult as RoastResultType } from "@/types/roast";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";

type Status = "idle" | "extracting" | "roasting" | "done" | "error";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function extractTextFromPdf(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);
  const res = await fetch("/api/extract", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to extract PDF text.");
  return data.text as string;
}

async function extractTextFromImage(file: File): Promise<string> {
  const { default: Tesseract } = await import("tesseract.js");
  const { data: { text } } = await Tesseract.recognize(file, "eng");
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length < 20) {
    throw new Error("Could not read enough text from the image. Make sure the resume is clearly visible.");
  }
  return cleaned;
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState<RoastResultType | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndSet(candidate: File) {
    setValidationError("");
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setValidationError("Only PDF, JPG, and PNG files are accepted.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setValidationError(`File too large. Max 10MB (yours is ${formatFileSize(candidate.size)}).`);
      return;
    }
    setFile(candidate);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) validateAndSet(picked);
    e.target.value = "";
  }

  function clearFile() { setFile(null); setValidationError(""); }

  function reset() {
    setFile(null); setValidationError("");
    setApiError(""); setResult(null); setStatus("idle");
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRoast() {
    if (!file) return;
    setApiError("");
    try {
      setStatus("extracting");
      const resumeText = file.type === "application/pdf"
        ? await extractTextFromPdf(file)
        : await extractTextFromImage(file);

      setStatus("roasting");
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Roast API failed.");
      setResult(data as RoastResultType);
      setStatus("done");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const isLoading = status === "extracting" || status === "roasting";

  if (status === "done" && result) {
    return <RoastResult result={result} fileName={file?.name ?? "resume"} onReset={reset} />;
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">

      {/* Drop zone */}
      <div
        onClick={() => !file && !isLoading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "corner-bracket relative rounded-none border p-8 text-center transition-all duration-300 select-none",
          isLoading
            ? "border-[#00d4ff]/20 opacity-60 cursor-not-allowed"
            : file
            ? "border-[#ff6b6b]/50 border-glow-red bg-[#ff6b6b]/5 cursor-default"
            : isDragging
            ? "border-[#00d4ff] border-glow-cyan bg-[#00d4ff]/5 scale-[1.01] cursor-copy"
            : "border-[#00d4ff]/25 hover:border-[#00d4ff]/60 hover:border-glow-cyan hover:bg-[#00d4ff]/5 cursor-pointer",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading}
        />

        {file ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0 text-[#ff6b6b]">
                {file.type === "application/pdf" ? "▣" : "◈"}
              </span>
              <div className="text-left min-w-0">
                <p className="text-white font-bold tracking-wide truncate uppercase text-sm">
                  {file.name}
                </p>
                <p className="text-[#00d4ff]/50 text-xs tracking-[0.1em] font-mono mt-0.5">
                  {formatFileSize(file.size)} · READY TO ROAST
                </p>
              </div>
            </div>
            {!isLoading && (
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                aria-label="Remove file"
                className="shrink-0 w-8 h-8 border border-white/20 hover:border-[#ff6b6b] text-white/40 hover:text-[#ff6b6b] transition-all flex items-center justify-center text-base"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pointer-events-none py-4">
            <div className={`text-5xl transition-all duration-300 ${isDragging ? "text-[#00d4ff] scale-110" : "text-white/20"}`}>
              {isDragging ? "◈" : "▣"}
            </div>
            <p className={`font-bold tracking-[0.15em] uppercase text-sm transition-colors ${isDragging ? "text-[#00d4ff]" : "text-white/50"}`}>
              {isDragging ? "Drop to Upload" : "Drag your resume here or click to upload"}
            </p>
            <p className="text-white/20 text-xs tracking-[0.1em] font-mono uppercase">
              PDF · JPG · PNG &nbsp;/&nbsp; Max 10MB
            </p>
          </div>
        )}
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-[#ff6b6b] text-xs tracking-[0.1em] font-mono uppercase text-center">
          ✕ {validationError}
        </p>
      )}

      {/* Loading status */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-[#00d4ff]/70 text-xs tracking-[0.2em] font-mono uppercase">
            {status === "extracting" ? "Extracting resume data..." : "Roasting in progress..."}
          </p>
        </div>
      )}

      {/* API error */}
      {status === "error" && apiError && (
        <div className="border border-[#ff6b6b]/30 bg-[#ff6b6b]/5 px-4 py-3 text-[#ff6b6b] text-xs tracking-[0.1em] font-mono uppercase text-center">
          ✕ {apiError}
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={handleRoast}
        disabled={!file || isLoading}
        className={[
          "w-full py-4 font-black text-sm tracking-[0.25em] uppercase transition-all duration-300",
          file && !isLoading
            ? "bg-[#ff6b6b] hover:bg-[#ff5252] text-white btn-glow hover:scale-[1.02] active:scale-[0.98]"
            : "bg-white/5 text-white/20 cursor-not-allowed border border-white/10",
        ].join(" ")}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {status === "extracting" ? "Extracting..." : "Roasting..."}
          </span>
        ) : (
          "▶ Roast My Resume"
        )}
      </button>
    </div>
  );
}
