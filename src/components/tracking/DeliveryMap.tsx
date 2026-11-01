"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface DeliveryMapProps {
  latitude: number;
  longitude: number;
  orderCode?: string;
}

export default function DeliveryMap({ latitude, longitude, orderCode }: DeliveryMapProps) {
  if (typeof window === "undefined") return <div className="h-64 rounded-2xl bg-zinc-900 animate-pulse" />;

  const icon = L.divIcon({
    className: "bg-rose-500 rounded-full border-2 border-white shadow-lg",
    iconSize: [20, 20],
  });

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-white/[0.08]">
      <MapContainer center={[latitude, longitude]} zoom={17} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }} attributionControl={true}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} icon={icon}>
          <Popup>Entregador · Pedido #{orderCode}</Popup>
        </Marker>
      </MapContainer>
      <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] text-white/90">
        OpenStreetMap · Atribuição visível
      </div>
    </div>
  );
}
