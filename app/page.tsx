import UploadForm from "@/app/components/UploadForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="font-black text-xl tracking-tight">Resume Roaster</span>
        </div>
        <p className="text-white/50 text-sm font-medium hidden sm:block">
          Get Roasted. Get Better.
        </p>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-12 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            Your Resume Deserves{" "}
            <span className="text-[#ff6b6b]">Brutal Honesty</span>
          </h1>
          <p className="text-white/60 text-lg sm:text-xl">
            Upload it. Get roasted. Actually improve.
          </p>
        </div>

        <UploadForm />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-white/30 text-sm">
        Made with{" "}
        <span className="text-[#ff6b6b]">Claude Code</span>
      </footer>
    </div>
  );
}
