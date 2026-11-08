"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "padoca_cookie_consent";
const CONSENT_VERSION = "1.0";

type Consent = {
  version: string;
  necessary: boolean; // sempre true
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Consent;
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed);
        } else {
          setShow(true);
        }
      } else {
        setShow(true);
      }
    } catch {
      setShow(true);
    }
  }, []);

  const accept = (analytics: boolean, marketing: boolean) => {
    const next: Consent = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics,
      marketing,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    } catch {}
    setConsent(next);
    setShow(false);
  };

  const rejectNonEssential = () => {
    accept(false, false);
  };

  if (!show && !consent) return null;
  if (!show && consent) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-6 border-t border-white/[0.12] bg-[#0e0e13]/95 backdrop-blur text-zinc-200 text-sm"
    >
      <div className="space-y-1 sm:space-y-0">
        <p className="font-semibold">
          Usamos cookies para o funcionamento do site (carrinho, sessão) e, com
          seu consentimento, para analytics e marketing.
        </p>
        <p className="text-xs text-zinc-500">
          Nenhum rastreador é ativado antes do seu consentimento.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <button
          onClick={() => rejectNonEssential()}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-zinc-300 transition hover:bg-white/10"
        >
          Recusar não essenciais
        </button>
        <button
          onClick={() => accept(true, false)}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-4 py-2.5 text-xs font-bold text-zinc-200 transition hover:bg-white/12"
        >
          Aceitar cookies
        </button>
      </div>
    </div>
  );
}
