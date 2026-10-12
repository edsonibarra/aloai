"use client";
import { useState } from "react";

/** Starts Stripe Checkout. Access is granted by the webhook, never by this redirect. */
export function CheckoutButton({ label = "Get the Interview Pass", className = "" }: { label?: string; className?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout");
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <button onClick={start} disabled={pending} className="btn btn-primary w-full">
        {pending ? "Opening secure checkout…" : label}
      </button>
      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-red/40 bg-red/10 px-3 py-2 text-sm text-red">
          {error}
        </p>
      )}
    </div>
  );
}
