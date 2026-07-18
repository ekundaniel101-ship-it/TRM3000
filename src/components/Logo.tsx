export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  if (size === "lg") {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src="/logo-medium.png"
        alt="NEXUS — Connect. Learn. Grow."
        className="w-[200px] rounded-xl shadow-md"
      />
    );
  }

  const iconPx = size === "md" ? 34 : 28;
  const textSize = size === "md" ? "text-lg" : "text-base";

  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-icon.png"
        alt="NEXUS"
        width={iconPx}
        height={iconPx}
        className="rounded-md"
        style={{ width: iconPx, height: "auto" }}
      />
      <span
        className={`${textSize} font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
      >
        NEXUS
      </span>
    </div>
  );
}
