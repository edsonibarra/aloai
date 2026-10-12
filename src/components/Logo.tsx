import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="focus-ring group flex items-center gap-2 rounded-lg">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet to-pink font-display text-lg font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-transform group-hover:rotate-6">
        A
      </span>
      <span className="font-display text-xl font-bold tracking-wide">
        Alo<span className="text-gradient">AI</span>
      </span>
    </Link>
  );
}
