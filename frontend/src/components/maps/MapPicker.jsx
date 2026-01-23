import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";

/**
 * Props:
 * - value: { latitude, longitude } | null
 * - onChange: ({ latitude, longitude }) => void
 * - height: string
 * - zoom: number
 * - markerLabel?: string
 */
export default function MapPicker({
  value,
  onChange,
  height = "320px",
  zoom = 14,
  markerLabel = "Position du campus",
}) {
  const center = useMemo(() => {
    if (value?.latitude && value?.longitude) {
      return [Number(value.latitude), Number(value.longitude)];
    }
    return [4.0511, 9.7679]; // Douala fallback
  }, [value]);

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

        <ClickToPick onChange={onChange} />

        {value?.latitude && value?.longitude && (
          <Marker position={[Number(value.latitude), Number(value.longitude)]}>
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{markerLabel}</div>
                <div className="text-muted-foreground">
                  {Number(value.latitude).toFixed(6)}, {Number(value.longitude).toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Recenter map when value changes */}
        <Recenter center={center} />
      </MapContainer>
    </div>
  );
}

function ClickToPick({ onChange }) {
  useMapEvents({
    click(e) {
      onChange?.({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}
