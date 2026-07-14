import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * LocationMap
 * - interactive=false → read-only map with "Open in Maps" button
 * - interactive=true  → draggable marker; calls onLocationChange({ lat, lng, label }) when pin is moved
 */
const LocationMap = ({ lat, lng, className = "", interactive = false, onLocationChange }) => {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const markerRef   = useRef(null);

  const makeIcon = () =>
    L.divIcon({
      html: `<div style="
        background: hsl(145,42%,30%);
        width: 22px; height: 22px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.45);
      "></div>`,
      className: "",
      iconSize: [22, 22],
      iconAnchor: [11, 22],
    });

  // Reverse-geocode via Nominatim and call back
  const reverseGeocode = async (lt, ln) => {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lt}&lon=${ln}&format=json`
      );
      const data = await res.json();
      const a    = data.address || {};
      const label =
        [a.village, a.town, a.suburb, a.city_district, a.city, a.county]
          .filter(Boolean)[0] ||
        `${lt.toFixed(4)}, ${ln.toFixed(4)}`;
      onLocationChange?.({ lat: lt, lng: ln, label });
    } catch {
      onLocationChange?.({ lat: lt, lng: ln, label: `${lt.toFixed(4)}, ${ln.toFixed(4)}` });
    }
  };

  // Initialise map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [lat || 11.6643, lng || 78.146],
      zoom:   15,
      zoomControl: interactive,
      dragging:    interactive,
      scrollWheelZoom: interactive,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const marker = L.marker([lat || 11.6643, lng || 78.146], {
      icon:      makeIcon(),
      draggable: interactive,
    }).addTo(map);

    if (interactive) {
      marker.on("dragend", (e) => {
        const { lat: lt, lng: ln } = e.target.getLatLng();
        reverseGeocode(lt, ln);
      });
      // Also allow clicking on map to move marker
      map.on("click", (e) => {
        const { lat: lt, lng: ln } = e.latlng;
        marker.setLatLng([lt, ln]);
        map.panTo([lt, ln]);
        reverseGeocode(lt, ln);
      });
    }

    mapInstance.current = map;
    markerRef.current   = marker;

    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current   = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker + view when lat/lng props change externally
  useEffect(() => {
    if (!mapInstance.current || !markerRef.current) return;
    if (!lat || !lng) return;
    mapInstance.current.setView([lat, lng], 15, { animate: true });
    markerRef.current.setLatLng([lat, lng]);
  }, [lat, lng]);

  const openGoogleMaps = () =>
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className}`}>
      {interactive && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none">
          📍 Drag pin or tap map to set exact location
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[200px]" />
      {!interactive && lat && lng && (
        <button
          onClick={openGoogleMaps}
          className="absolute bottom-3 right-3 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg shadow-md hover:opacity-90 transition-opacity z-[1000]"
        >
          Open in Maps →
        </button>
      )}
    </div>
  );
};

export default LocationMap;
