"use client";

export default function Skeleton({
  className = "",
  pulse = true,
}: {
  className?: string;
  pulse?: boolean;
}) {
  return (
    <div
      className={[
        "animate-pulse rounded-md bg-zinc-900/50",
        pulse ? "" : "static",
        className,
      ].filter(Boolean).join(" ")}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={["space-y-3", className].filter(Boolean).join(" ")}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-zinc-900/50 rounded animate-pulse"
          style={{
            width: i === lines - 1 ? "60%" : "100%",
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "h-10 w-10 rounded-full bg-zinc-900/50 animate-pulse",
        className,
      ].filter(Boolean).join(" ")}
    />
  );
}

export function SkeletonButton({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "h-10 px-4 rounded-full bg-zinc-900/50 animate-pulse",
        className,
      ].filter(Boolean).join(" ")}
    />
  );
}
