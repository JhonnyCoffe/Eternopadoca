"use client";

import { useEffect, useRef, useState } from "react";
import type { DeliveryLocation } from "@/lib/types";
import DeliveryMap from "./DeliveryMap";

export interface LiveDeliveryTrackerProps {
  orderCode: string;
  trackingToken?: string;
  orderStatus: string;
  initialLocation?: DeliveryLocation | null;
}

export default function LiveDeliveryTracker({ orderCode, trackingToken, orderStatus, initialLocation }: LiveDeliveryTrackerProps) {
  const [location, setLocation] = useState<DeliveryLocation | null>(initialLocation ?? null);
  const [connection, setConnection] = useState("idle");
  const sseRef = useRef<EventSource | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (orderStatus !== "saiu" || !trackingToken) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    try {
      const url = `/api/pedido/${orderCode}/localizacao/stream?token=${encodeURIComponent(trackingToken)}`;
      const es = new EventSource(url);
      sseRef.current = es;

      es.onopen = () => {};
      es.onerror = () => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
          try {
            const res = await fetch(`/api/pedido/${orderCode}/localizacao?token=${encodeURIComponent(trackingToken)}`);
            const data = await res.json();
            if (data.ok && data.location) setLocation(data.location);
          } catch {
            // ignora
          }
        }, 15000);
      };

      es.addEventListener("message", (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "location" && msg.data) setLocation(msg.data);
        } catch {
          // ignora
        }
      });

      return () => {
        es.close();
        sseRef.current = null;
        if (pollRef.current) clearInterval(pollRef.current);
      };
    } catch {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/pedido/${orderCode}/localizacao?token=${encodeURIComponent(trackingToken)}`);
          const data = await res.json();
          if (data.ok && data.location) setLocation(data.location);
        } catch {
          // ignora
        }
      }, 15000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [orderCode, trackingToken, orderStatus]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <span className={`h-2 w-2 rounded-full ${connection === "live" ? "bg-emerald-400 animate-pulse" : connection === "polling" ? "bg-amber-400" : "bg-rose-400"}`} />
        <span className="font-bold text-zinc-300">
          {connection === "live" && "Ao vivo"}
          {connection === "polling" && "Atualização periódica"}
          {connection === "reconnecting" && "Reconectando..."}
          {connection === "connecting" && "Conectando..."}
          {connection === "idle" && "Aguardando"}
        </span>
      </div>
      {location ? (
        <DeliveryMap latitude={location.latitude} longitude={location.longitude} orderCode={orderCode} />
      ) : (
        <div className="h-64 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-xs text-zinc-500">
          Aguardando localização do entregador...
        </div>
      )}
    </div>
  );
}
