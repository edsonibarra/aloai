export function CuratedBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-gold sm:text-sm ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden>
        <path d="M12 2l2.6 5.6 6.1.7-4.5 4.2 1.2 6.1L12 15.6 6.6 18.6l1.2-6.1L3.3 8.3l6.1-.7z" />
      </svg>
      Questions curated by expert Python software engineers
    </div>
  );
}
