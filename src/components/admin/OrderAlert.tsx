"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Alertas do painel:
 * - consulta o servidor a cada 10s (badge e som sempre atualizados)
 * - toca um som curto quando entra pedido novo
 * - mostra a contagem no título da aba
 * - usa a Notificação do sistema apenas se o usuário já tiver permitido
 */
export default function OrderAlert({
  newOrders,
  unreadChats = 0,
}: {
  newOrders: number;
  unreadChats?: number;
}) {
  const router = useRouter();
  const prevOrders = useRef<number | null>(null);
  const baseTitle = useRef<string>("");

  // Badge no título da aba. O App Router reescreve document.title a cada
  // refresh do RSC, então reaplicamos o badge num intervalo curto.
  useEffect(() => {
    const apply = () => {
      if (!baseTitle.current) baseTitle.current = document.title.replace(/^\(\d+\)\s*/, "");
      const total = newOrders + unreadChats;
      const next = total > 0 ? `(${total}) ${baseTitle.current}` : baseTitle.current;
      if (document.title !== next) document.title = next;
    };
    apply();
    const id = setInterval(apply, 3000);
    return () => clearInterval(id);
  }, [newOrders, unreadChats]);

  // Polling central do painel
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 10000);
    return () => clearInterval(id);
  }, [router]);

  // Detecta pedido novo → som + notificação
  useEffect(() => {
    if (prevOrders.current === null) {
      prevOrders.current = newOrders;
      return;
    }
    if (newOrders > prevOrders.current) {
      playChime();
      systemNotify(newOrders);
    }
    prevOrders.current = newOrders;
  }, [newOrders]);

  return null;
}

function playChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const start = ctx.currentTime;
    const notes = [880, 1174.66, 1567.98]; // Lá → Ré → Sol (alerta alegre)

    notes.forEach((freq, i) => {
      const at = start + i * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.18);
    });

    setTimeout(() => ctx.close(), 1200);
  } catch {
    // navegador sem Web Audio: silencioso
  }
}

function systemNotify(count: number) {
  try {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification("Novo pedido!", {
      body: `${count} pedido${count > 1 ? "s" : ""} aguardando confirmação.`,
      tag: "novo-pedido",
    });
  } catch {
    // notificação indisponível: silencioso
  }
}
