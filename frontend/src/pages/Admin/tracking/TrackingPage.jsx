import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import { Play, Pause, RotateCcw, MapPin, Navigation } from "lucide-react";
import { campusService } from "@/services/campusService";
import { trackingService } from "@/services/trackingService";

// Haversine distance (mètres)
function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);

  const h = sin1 * sin1 + Math.cos(lat1) * Math.cos(lat2) * sin2 * sin2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export default function TrackingPage() {
  // campuses
  const [campuses, setCampuses] = useState([]);
  const [campusId, setCampusId] = useState("");
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [campusError, setCampusError] = useState("");

  useEffect(() => {
    (async () => {
      setLoadingCampuses(true);
      setCampusError("");
      try {
        const res = await campusService.getAll(); // adapte si c'est list()
        const list = res?.data ?? res ?? [];
        setCampuses(list);
        if (list.length) setCampusId(String(list[0].id));
      } catch (e) {
        setCampusError("Impossible de charger les campus.");
        setCampuses([]);
      } finally {
        setLoadingCampuses(false);
      }
    })();
  }, []);

  // ✅ FIX: find doit retourner null si pas trouvé (pas de "|| ''")
  const campus = useMemo(() => {
    return campuses.find((c) => String(c.id) === String(campusId)) || null;
  }, [campuses, campusId]);

  const campusPos = useMemo(() => {
    const lat = campus?.location?.latitude ?? campus?.latitude;
    const lng = campus?.location?.longitude ?? campus?.longitude;
    if (!lat || !lng) return null;
    return [Number(lat), Number(lng)];
  }, [campus]);

  // tracking state
  const [tracking, setTracking] = useState(false);
  const [me, setMe] = useState(null);
  const [path, setPath] = useState([]);
  const watchIdRef = useRef(null);
  const prevDistanceRef = useRef(null);
  const trackingStartRef = useRef(null);
  const [savingSession, setSavingSession] = useState(false);
  const [trend, setTrend] = useState(null);

  // (optionnel pro) reset quand on change de campus
  useEffect(() => {
    setPath([]);
    // garde "me" si tu veux, ou reset aussi:
    // setMe(null);
  }, [campusId]);

  // live stats
  const distanceToCampus = useMemo(() => {
    if (!me || !campus?.latitude || !campus?.longitude) return null;
    return haversineMeters(
      { lat: me.lat, lng: me.lng },
      { lat: Number(campus.latitude), lng: Number(campus.longitude) }
    );
  }, [me, campus]);

  const distanceWalked = useMemo(() => {
    if (path.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      total += haversineMeters(path[i - 1], path[i]);
    }
    return total;
  }, [path]);

  const mapCenter = useMemo(() => {
    if (me) return [me.lat, me.lng];
    if (campusPos) return campusPos;
    return [4.0511, 9.7679]; // fallback Douala
  }, [me, campusPos]);

  const startTracking = async () => {
    if (!("geolocation" in navigator)) {
      alert("Votre navigateur ne supporte pas la géolocalisation.");
      return;
    }

    trackingStartRef.current = Date.now();
    setPath([]);
    setCampusRoute([]);
    setTrend(null);

    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        const point = { lat: latitude, lng: longitude };

        setMe({ lat: latitude, lng: longitude, accuracy, speed });

        setPath((prev) => {
          if (prev.length === 0) return [point];
          const last = prev[prev.length - 1];
          const d = haversineMeters(last, point);
          if (d < 3) return prev; // filtre bruit GPS
          return [...prev, point];
        });
      },
      (err) => {
        console.error(err);
        alert("Géolocalisation refusée ou indisponible. Vérifie HTTPS + permissions.");
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000,
      }
    );
  };

  const stopTracking = () => {
    setTracking(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    void flushTracking();
  };

  const resetTracking = () => {
    stopTracking();
    setMe(null);
    trackingStartRef.current = null;
  };

  const flushTracking = useCallback(async () => {
    if (!path.length) return;
    setSavingSession(true);
    const durationSeconds = trackingStartRef.current
      ? Math.max(0, (Date.now() - trackingStartRef.current) / 1000)
      : 0;
    const payload = {
      path,
      distance: distanceWalked,
      duration_seconds: durationSeconds,
      campus_id: campus?.id,
      campus_name: campus?.campus_name ?? campus?.name ?? null,
      meta: {
        trend,
        started_at: trackingStartRef.current
          ? new Date(trackingStartRef.current).toISOString()
          : null,
      },
    };

    try {
      await trackingService.savePath(payload);
    } catch (error) {
      console.error("Impossible d'envoyer la trace GPS", error);
    } finally {
      setSavingSession(false);
      trackingStartRef.current = null;
      setPath([]);
      setCampusRoute([]);
    }
  }, [path, distanceWalked, campus, trend]);

  useEffect(() => {
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [campusRoute, setCampusRoute] = useState([]);
  const routeAbortRef = useRef(null);

  useEffect(() => {
    if (!me || !campusPos) {
      setCampusRoute([]);
      return;
    }
    if (routeAbortRef.current) {
      routeAbortRef.current.abort();
    }
    const controller = new AbortController();
    routeAbortRef.current = controller;
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${me.lng},${me.lat};${campusPos[1]},${campusPos[0]}?overview=full&geometries=geojson`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        const coords = data?.routes?.[0]?.geometry?.coordinates || [];
        setCampusRoute(coords.map(([lng, lat]) => [lat, lng]));
      })
      .catch(() => {
        setCampusRoute([]);
      });
    return () => {
      controller.abort();
    };
  }, [me, campusPos]);

  useEffect(() => {
    if (distanceToCampus === null) return;
    const previous = prevDistanceRef.current;
    if (previous !== null) {
      if (distanceToCampus + 1 < previous) {
        setTrend("approche");
      } else if (distanceToCampus > previous + 1) {
        setTrend("eloigne");
      }
    }
    prevDistanceRef.current = distanceToCampus;
  }, [distanceToCampus]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Tracking</h1>
          <p className="text-sm text-muted-foreground">
            Suivez votre position en temps réel par rapport au campus sélectionné.
          </p>
        </div>

        {/* ✅ SELECT CAMPUS */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground">Campus</span>
            <select
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              disabled={loadingCampuses || campuses.length === 0}
              className="mt-1 rounded-xl border border-input bg-input-background px-4 py-2 text-sm outline-none"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.campus_name}
                </option>
              ))}
            </select>
          </div>

          {!tracking ? (
            <Button
              onClick={startTracking}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loadingCampuses || campuses.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Démarrer
            </Button>
          ) : (
            <Button onClick={stopTracking} variant="outline" className="rounded-xl">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}

          <Button onClick={resetTracking} variant="outline" className="rounded-xl">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        {savingSession && (
          <div className="text-xs text-primary font-bold uppercase tracking-[0.3em]">
            Transmission en cours...
          </div>
        )}
      </div>

      {campusError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <div className="font-bold text-destructive">Erreur</div>
          <div className="text-muted-foreground">{campusError}</div>
        </div>
      ) : null}

      {/* ✅ Alerte si campus sans coords */}
      {campus && !campusPos ? (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm">
          <div className="font-bold">Localisation manquante</div>
          <div className="text-muted-foreground">
            Le campus <b>{campus.campus_name}</b> n’a pas de latitude/longitude.
            Ajoute la localisation dans le modal Campus.
          </div>
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-bold">
            <MapPin className="h-4 w-4 text-primary" /> Campus
          </div>
          <div className="mt-2 text-lg font-extrabold">{campus?.campus_name || "—"}</div>
          <div className="text-sm text-muted-foreground">
            {campusPos ? `${campusPos[0].toFixed(5)}, ${campusPos[1].toFixed(5)}` : "Coordonnées manquantes"}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Navigation className="h-4 w-4 text-primary" /> Distance au campus
          </div>
          <div className="mt-2 text-3xl font-extrabold">
            {distanceToCampus == null ? "—" : `${(distanceToCampus / 1000).toFixed(2)} km`}
          </div>
          <div className="text-sm text-muted-foreground">Mise à jour en temps réel (GPS)</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-sm font-bold">Distance parcourue</div>
          <div className="mt-2 text-3xl font-extrabold">{(distanceWalked / 1000).toFixed(2)} km</div>
          <div className="text-sm text-muted-foreground">
            Points: {path.length} {me?.accuracy ? `• Précision ±${Math.round(me.accuracy)}m` : ""}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {trend === "approche" && (
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] uppercase tracking-[0.3em]">
            Il t’approche
          </span>
        )}
        {trend === "eloigne" && (
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] uppercase tracking-[0.3em]">
            Il s’éloigne
          </span>
        )}
      </div>

      {/* Map */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <MapContainer center={mapCenter} zoom={15} scrollWheelZoom style={{ height: "520px", width: "100%" }}>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Campus marker */}
          {campusPos && (
            <Marker position={campusPos}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{campus.campus_name}</div>
                  <div className="text-muted-foreground">Point campus</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Me marker */}
          {me && (
            <Marker position={[me.lat, me.lng]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">Moi</div>
                  <div className="text-muted-foreground">
                    {me.lat.toFixed(6)}, {me.lng.toFixed(6)}
                  </div>
                  {me.accuracy ? <div className="text-muted-foreground">Précision ±{Math.round(me.accuracy)} m</div> : null}
                </div>
              </Popup>
            </Marker>
          )}

          {/* path */}
          {path.length >= 2 && (
            <Polyline
              positions={path.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#0ea5e9", weight: 4 }}
            />
          )}
          {campusRoute.length > 1 && (
            <Polyline
              positions={campusRoute}
              pathOptions={{ color: "#f97316", weight: 3, dashArray: "4" }}
            />
          )}
          {me && (
            <Circle
              center={[me.lat, me.lng]}
              radius={me.accuracy || 10}
              pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.08 }}
            />
          )}
          {me && campusPos && (
            <Polyline
              positions={[
                [me.lat, me.lng],
                campusPos,
              ]}
              pathOptions={{ color: "#6366f1", dashArray: "6", weight: 2 }}
            />
          )}
        </MapContainer>
      </div>

      <div className="text-xs text-muted-foreground">
        ⚠️ Pour le tracking, la géolocalisation marche seulement sur <b>HTTPS</b> ou <b>localhost</b>.
      </div>
    </div>
  );
}
