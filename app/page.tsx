import UploadForm from "@/app/components/UploadForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#03040a] text-white flex flex-col relative overflow-hidden grid-bg">
      {/* Scan line */}
      <div className="scanline" />

      {/* Glow spots */}
      <div className="glow-spot-red -top-32 -left-32" />
      <div className="glow-spot-blue -top-20 right-0" />
      <div className="glow-spot-red bottom-0 left-1/2 -translate-x-1/2" />

      {/* Header */}
      <header className="relative z-10 px-6 sm:px-10 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="text-xl text-[#00d4ff] font-black tracking-[0.2em] uppercase flicker">
            ▲ RESUME ROASTER
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-[0.15em] uppercase text-white/40">
          <span className="hover:text-[#00d4ff] cursor-default transition-colors">Home</span>
          <span className="hover:text-[#00d4ff] cursor-default transition-colors">How It Works</span>
          <span className="hover:text-[#00d4ff] cursor-default transition-colors">About</span>
        </nav>
        <div className="hidden sm:flex items-center gap-2 border border-[#00d4ff]/30 px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase text-[#00d4ff] border-glow-cyan">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
          System Online
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">

        {/* Status badge */}
        <div className="mb-6 inline-flex items-center gap-2 border border-[#ff6b6b]/30 px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase text-[#ff6b6b]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] animate-pulse" />
          AI-Powered Brutal Honesty Engine
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.95] uppercase mb-6 max-w-4xl">
          <span className="block text-white">YOUR RESUME</span>
          <span className="block text-glow-red" style={{ color: "#ff6b6b" }}>
            GETS ROASTED
          </span>
          <span className="block text-white text-3xl sm:text-4xl md:text-5xl mt-2 font-black tracking-[0.05em]">
            AND{" "}
            <span className="text-glow-cyan" style={{ color: "#00d4ff" }}>
              FIXED
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-white/40 text-sm sm:text-base tracking-[0.12em] uppercase mb-12 max-w-md">
          Upload it &nbsp;/&nbsp; Get destroyed &nbsp;/&nbsp; Actually improve
        </p>

        {/* Divider line */}
        <div className="w-full max-w-xl flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />
          <span className="text-[#00d4ff]/40 text-xs tracking-[0.2em] uppercase">Upload Your Resume</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />
        </div>

        <UploadForm />

        {/* Stats row */}
        <div className="mt-14 flex items-center gap-8 sm:gap-16 text-center">
          {[
            { value: "GPT-4o", label: "AI Model" },
            { value: "PDF", label: "Format" },
            { value: "5", label: "Fix Areas" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-xl sm:text-2xl font-black text-[#00d4ff] text-glow-cyan">
                {s.value}
              </span>
              <span className="text-white/30 text-xs tracking-[0.15em] uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center border-t border-white/5">
        <p className="text-white/20 text-xs tracking-[0.2em] uppercase">
          Made with{" "}
          <span className="text-[#ff6b6b]/60">Claude Code</span>
          {" "}· Powered by OpenAI
        </p>
      </footer>
    </div>
  );
}
