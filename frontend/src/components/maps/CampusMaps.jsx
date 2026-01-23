import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";

/**
 * Props:
 * - campuses: array [{ id, campus_name, city, address, latitude, longitude }]
 * - selected: { latitude, longitude } | null
 * - onPick: (latlng) => void   // click map -> set coordinates
 * - height: string (ex: "380px")
 * - zoom: number
 */
export default function CampusMap({
  campuses = [],
  selected = null,
  onPick,
  height = "380px",
  zoom = 13,
}) {
  const center = useMemo(() => {
    // centre: sélection > premier campus > Douala (fallback)
    if (selected?.latitude && selected?.longitude) {
      return [Number(selected.latitude), Number(selected.longitude)];
    }
    const first = campuses.find((c) => c.latitude && c.longitude);
    if (first) return [Number(first.latitude), Number(first.longitude)];
    return [4.0511, 9.7679]; // Douala (fallback)
  }, [selected, campuses]);

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height, width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Click-to-pick */}
        <PickLocation onPick={onPick} />

        {/* Marqueur sélectionné */}
        {selected?.latitude && selected?.longitude && (
          <Marker position={[Number(selected.latitude), Number(selected.longitude)]}>
            <Popup>
              <div className="text-sm">
                <div className="font-bold">Position sélectionnée</div>
                <div className="text-muted-foreground">
                  {Number(selected.latitude).toFixed(6)}, {Number(selected.longitude).toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueurs campus */}
        {campuses
          .filter((c) => c.latitude && c.longitude)
          .map((c) => (
            <Marker key={c.id} position={[Number(c.latitude), Number(c.longitude)]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{c.campus_name}</div>
                  <div className="text-muted-foreground">{c.city || "—"}</div>
                  {c.address ? <div className="text-muted-foreground">{c.address}</div> : null}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

function PickLocation({ onPick }) {
  useMapEvents({
    click(e) {
      if (typeof onPick === "function") {
        onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      }
    },
  });
  return null;
}
