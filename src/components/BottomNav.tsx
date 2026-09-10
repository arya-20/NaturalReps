"use client";

export type Tab = "home" | "post" | "profile";

const items: { id: Tab; label: string; icon: React.ReactElement }[] = [
  {
    id: "home",
    label: "Home",
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />
    ),
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
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-lg">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map((it) => {
          const isActive = active === it.id;
          const isPost = it.id === "post";
          return (
            <li key={it.id} className="flex-1">
              <button
                onClick={() => onChange(it.id)}
                aria-label={it.label}
                aria-current={isActive}
                className="flex w-full flex-col items-center gap-1 py-2.5"
              >
                <span
                  className={
                    isPost
                      ? "flex h-11 w-11 -translate-y-3 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-white/10"
                      : `flex h-6 w-6 items-center justify-center ${
                          isActive ? "text-white" : "text-neutral-500"
                        }`
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isPost ? "h-6 w-6" : "h-6 w-6"}
                  >
                    {it.icon}
                  </svg>
                </span>
                <span
                  className={`text-[11px] ${
                    isActive ? "text-white" : "text-neutral-500"
                  } ${isPost ? "-translate-y-2" : ""}`}
                >
                  {it.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
