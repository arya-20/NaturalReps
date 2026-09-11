"use client";

export type Tab = "home" | "post" | "profile";

const items: { id: Tab; label: string; icon: React.ReactElement }[] = [
  {
    id: "home",
    label: "Home",
    icon: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  },
  {
    id: "post",
    label: "Post",
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
  },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-[430px] justify-center pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      {/* luminous backlight (subtle) */}
      <div
        aria-hidden
        className="absolute bottom-6 left-1/2 h-12 w-3/5 -translate-x-1/2 rounded-full bg-white/8 blur-2xl"
      />

      <nav className="pointer-events-auto relative">
        {/* liquid-glass pill */}
        <div className="relative flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.4)] backdrop-blur-2xl backdrop-saturate-150">
          {/* soft top-gloss gradient */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-white/5 to-transparent"
          />
          {/* inner hairline highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-px rounded-full ring-1 ring-inset ring-white/10"
          />

          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => onChange(it.id)}
                aria-label={it.label}
                aria-current={isActive}
                className="relative flex flex-col items-center gap-0.5 rounded-full px-5 py-2 transition-colors"
              >
                {/* active liquid-glass highlight bubble */}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-white/25 bg-white/12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-md"
                  />
                )}
                <span
                  className={`relative flex h-6 w-6 items-center justify-center transition-colors ${
                    isActive ? "text-white" : "text-white/55"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[22px] w-[22px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                  >
                    {it.icon}
                  </svg>
                </span>
                <span
                  className={`relative text-[10px] font-medium tracking-wide transition-colors ${
                    isActive ? "text-white" : "text-white/50"
                  }`}
                >
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
