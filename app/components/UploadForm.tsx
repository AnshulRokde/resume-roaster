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
  // Dynamically import Tesseract.js — runs client-side via WASM
  const { default: Tesseract } = await import("tesseract.js");
  const {
    data: { text },
  } = await Tesseract.recognize(file, "eng");
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length < 20) {
    throw new Error(
      "Could not read enough text from the image. Make sure the resume is clearly visible."
    );
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
      setValidationError(
        `File too large. Max 10MB (yours is ${formatFileSize(candidate.size)}).`
      );
      return;
    }
    setFile(candidate);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) validateAndSet(picked);
    e.target.value = "";
  }

  function clearFile() {
    setFile(null);
    setValidationError("");
  }

  function reset() {
    setFile(null);
    setValidationError("");
    setApiError("");
    setResult(null);
    setStatus("idle");
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRoast() {
    if (!file) return;
    setApiError("");

    try {
      // Step 1: Extract text
      setStatus("extracting");
      const resumeText =
        file.type === "application/pdf"
          ? await extractTextFromPdf(file)
          : await extractTextFromImage(file);

      // Step 2: Roast
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

  const loadingMessage =
    status === "extracting"
      ? "Extracting text from your resume..."
      : "Roasting your resume...";

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5">
      {/* Upload area — hidden while showing results */}
      {status !== "done" && (
        <>
          <div
            onClick={() => !file && !isLoading && inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              "relative rounded-2xl border-2 border-dashed p-10 text-center transition-all select-none",
              isLoading
                ? "border-white/20 opacity-60 cursor-not-allowed"
                : file
                ? "border-[#ff6b6b] bg-[#ff6b6b]/5 cursor-default"
                : isDragging
                ? "border-[#ff6b6b] bg-[#ff6b6b]/10 scale-[1.01] cursor-copy"
                : "border-white/20 hover:border-[#ff6b6b]/60 hover:bg-white/5 cursor-pointer",
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
                  <span className="text-3xl shrink-0">
                    {file.type === "application/pdf" ? "📄" : "🖼️"}
                  </span>
                  <div className="text-left min-w-0">
                    <p className="text-white font-semibold truncate">
                      {file.name}
                    </p>
                    <p className="text-white/50 text-sm">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                {!isLoading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    aria-label="Remove file"
                    className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-[#ff6b6b]/80 text-white/60 hover:text-white transition-colors flex items-center justify-center text-lg leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <span className="text-5xl">{isDragging ? "📂" : "📁"}</span>
                <p className="text-white font-semibold text-lg">
                  {isDragging
                    ? "Drop it here"
                    : "Drag your resume here or click to upload"}
                </p>
                <p className="text-white/40 text-sm">
                  PDF, JPG, or PNG · Max 10MB
                </p>
              </div>
            )}
          </div>

          {/* Validation error */}
          {validationError && (
            <p className="text-[#ff6b6b] text-sm text-center -mt-1">
              {validationError}
            </p>
          )}

          {/* Loading message */}
          {isLoading && (
            <p className="text-white/60 text-sm text-center animate-pulse">
              {loadingMessage}
            </p>
          )}

          {/* API error */}
          {status === "error" && apiError && (
            <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-xl px-4 py-3 text-[#ff6b6b] text-sm text-center">
              {apiError}
            </div>
          )}

          {/* CTA button */}
          <button
            onClick={handleRoast}
            disabled={!file || isLoading}
            className={[
              "w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all",
              file && !isLoading
                ? "bg-[#ff6b6b] hover:bg-[#ff5252] text-white shadow-lg shadow-[#ff6b6b]/30 hover:shadow-[#ff6b6b]/50 hover:scale-[1.02] active:scale-[0.98]"
                : "bg-white/10 text-white/30 cursor-not-allowed",
            ].join(" ")}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block">🔥</span>
                {status === "extracting" ? "Extracting..." : "Roasting..."}
              </span>
            ) : (
              "🔥 Roast My Resume"
            )}
          </button>
        </>
      )}

      {/* Results */}
      {status === "done" && result && (
        <RoastResult
          result={result}
          fileName={file?.name ?? "resume"}
          onReset={reset}
        />
      )}
    </div>
  );
}
