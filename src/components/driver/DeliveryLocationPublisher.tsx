"use client";

import { useEffect, useRef, useState } from "react";

export type PublisherState = "idle" | "requesting" | "active" | "denied" | "offline" | "stopped";

export interface DeliveryLocationPublisherProps {
  orderId: string;
  code: string;
  status: string;
  trackingToken?: string;
  intervalMs?: number;
  minDistanceM?: number;
}

export default function DeliveryLocationPublisher({
  code,
  status,
  trackingToken,
  intervalMs = 5000,
  minDistanceM = 5,
}: DeliveryLocationPublisherProps) {
  const [state, setState] = useState<PublisherState>("idle");
  const [lastSync, setLastSync] = useState<string>("");
  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  useEffect(() => {
    if (status !== "saiu" || !trackingToken) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const now = Date.now();
      if (lastPosRef.current) {
        const dist = haversine(lastPosRef.current.lat, lastPosRef.current.lng, latitude, longitude);
        if (dist < minDistanceM && now - lastPosRef.current.time < intervalMs) {
          return;
        }
      }
      lastPosRef.current = { lat: latitude, lng: longitude, time: now };
      setState("active");
      setLastSync(new Date().toLocaleTimeString());

      fetch(`/api/pedido/${code}/localizacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: trackingToken,
          latitude,
          longitude,
          accuracy,
          heading: heading ?? undefined,
          speed: speed ?? undefined,
        }),
      }).catch(() => {
        // ignora erro de rede no cliente
      });
    };

    const handleError = (err: GeolocationPositionError) => {
      if (err.code === 1) setState("denied");
      else setState("offline");
    };

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    };
  }, [status, code, trackingToken, intervalMs, minDistanceM]);

  return (
    <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className={`font-bold uppercase tracking-wide ${state === "active" ? "text-emerald-300" : state === "denied" ? "text-red-300" : "text-zinc-400"}`}>
          {state === "idle" && "Aguardando rota"}
          {state === "requesting" && "Solicitando GPS..."}
          {state === "active" && "Localização ativa"}
          {state === "denied" && "GPS negado"}
          {state === "offline" && "GPS indisponível"}
          {state === "stopped" && "Rota finalizada"}
        </span>
        <span className="text-[10px] text-zinc-500">{lastSync && `Última: ${lastSync}`}</span>
      </div>
      <p className="mt-1 text-[11px] text-zinc-400">A localização é compartilhada apenas enquanto a entrega estiver em andamento.</p>
    </div>
  );
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
