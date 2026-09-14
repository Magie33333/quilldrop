"use client";

import { useEffect, useRef, useState } from "react";
import type { ScriptoriumPlace } from "../data/scriptoria";

type ScriptoriaData = {
  place: ScriptoriumPlace;
  cards: any[];
  owned: any[];
};

export default function RealLeafletMap({
  scriptoria,
  selectedPlace,
  onSelectPlace,
}: {
  scriptoria: ScriptoriaData[];
  selectedPlace: ScriptoriumPlace;
  onSelectPlace: (place: ScriptoriumPlace) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  // Inicializace Leaflet mapy
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isCancelled = false;

    async function init() {
      try {
        const L = (await import("leaflet")).default;
        if (isCancelled || !mapContainerRef.current) return;

        // Pokud již mapa existuje, odstraníme ji
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Vytvoření mapy vycentrované na střední Evropu
        const map = L.map(mapContainerRef.current, {
          center: [49.5, 15.5],
          zoom: 6,
          minZoom: 4,
          maxZoom: 14,
          zoomControl: false, // vlastní ovládání s historickým stylem
          attributionControl: false,
        });

        // OpenStreetMap dlaždice s pergamenovým filtrem
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}.png", {
          maxZoom: 18,
          subdomains: ["a", "b", "c"],
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (err) {
        console.error("Chyba při inicializaci Leaflet mapy:", err);
      }
    }

    init();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Vykreslení a aktualizace markerů při změně dat
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    let isCancelled = false;

    async function renderMarkers() {
      const L = (await import("leaflet")).default;
      if (isCancelled || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;

      // Vyčištění starých markerů
      markersMapRef.current.forEach((marker) => marker.remove());
      markersMapRef.current.clear();

      scriptoria.forEach(({ place, cards, owned }) => {
        const hasOwned = owned.length > 0;
        const isSelected = selectedPlace.id === place.id;

        // Vytvoření custom DivIconu ve stylu voskové pečeti
        const iconHtml = `
          <div class="medieval-leaf-marker ${hasOwned ? "has-owned" : ""} ${isSelected ? "is-selected" : ""}" title="${place.name}">
            <span class="marker-seal">${place.icon}</span>
            <span class="marker-count">${owned.length}/${cards.length}</span>
            <span class="marker-tooltip">${place.name}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "leaflet-medieval-icon-wrapper",
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });

        const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

        marker.on("click", () => {
          onSelectPlace(place);
          map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 8), {
            duration: 0.8,
            easeLinearity: 0.25,
          });
        });

        markersMapRef.current.set(place.id, marker);
      });
    }

    renderMarkers();

    return () => {
      isCancelled = true;
    };
  }, [mapReady, scriptoria, selectedPlace, onSelectPlace]);

  // Posun kamery při změně vybraného místa
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !selectedPlace) return;
    const map = mapInstanceRef.current;
    map.flyTo([selectedPlace.lat, selectedPlace.lng], Math.max(map.getZoom(), 8), {
      duration: 0.7,
      easeLinearity: 0.25,
    });
  }, [selectedPlace, mapReady]);

  // Tlačítka zoomu a resetu
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };
  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([49.2, 15.5], 6, { duration: 0.8 });
    }
  };

  // Převod na formát zeměpisných stupňů
  const formatCoord = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? "s. š." : "j. š.";
    const lngDir = lng >= 0 ? "v. d." : "z. d.";
    const latDeg = Math.floor(Math.abs(lat));
    const latMin = Math.round((Math.abs(lat) - latDeg) * 60);
    const lngDeg = Math.floor(Math.abs(lng));
    const lngMin = Math.round((Math.abs(lng) - lngDeg) * 60);
    return `${latDeg}°${latMin.toString().padStart(2, "0")}′ ${latDir}, ${lngDeg}°${lngMin.toString().padStart(2, "0")}′ ${lngDir}`;
  };

  return (
    <div className="real-map-wrapper">
      {/* Vlastní mapa Leaflet */}
      <div ref={mapContainerRef} className="real-map-element" />

      {/* Historická kartuše a dekorační rám */}
      <div className="map-decor-border" pointer-events="none" />
      <div className="map-cartouche">ORBIS SCRIPTORIORUM</div>

      {/* Ovládací prvky mapy */}
      <div className="real-map-controls">
        <button type="button" onClick={handleZoomIn} title="Přiblížit mapu" aria-label="Přiblížit">
          +
        </button>
        <button type="button" onClick={handleZoomOut} title="Oddálit mapu" aria-label="Oddálit">
          −
        </button>
        <button type="button" onClick={handleReset} title="Vycentrovat na střední Evropu" aria-label="Centrovat">
          ⊙
        </button>
      </div>

      {/* Stavový štítek se souřadnicemi a lokalitou */}
      <div className="real-map-status">
        <span className="status-pin">{selectedPlace.icon}</span>
        <strong>{selectedPlace.name}</strong>
        <small>{formatCoord(selectedPlace.lat, selectedPlace.lng)}</small>
      </div>
    </div>
  );
}
