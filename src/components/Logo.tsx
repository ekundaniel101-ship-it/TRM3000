export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: 22, md: 28, lg: 40 }[size];
  const text = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size];

  return (
    <div className="flex items-center gap-2">
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="nexus-mark" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <path
          d="M5 23V5L23 23V5"
          stroke="url(#nexus-mark)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`${text} font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
      >
        NEXUS
      </span>
    </div>
  );
}
