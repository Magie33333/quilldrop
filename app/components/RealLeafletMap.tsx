"use client";

import { useEffect, useRef, useState } from "react";
import type { ScriptoriumPlace } from "../data/scriptoria";
import { MODERN_COUNTRIES, MEDIEVAL_RIVERS } from "../data/medievalMapData";

type ScriptoriaData = {
  place: ScriptoriumPlace;
  cards: any[];
  owned: any[];
};

export default function RealLeafletMap({
  scriptoria,
  selectedPlace,
  onSelectPlace,
  compact = false,
  onOpenFull,
}: {
  scriptoria: ScriptoriaData[];
  selectedPlace: ScriptoriumPlace;
  onSelectPlace: (place: ScriptoriumPlace) => void;
  compact?: boolean;
  onOpenFull?: () => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const geoJsonLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Inicializace Leaflet mapy
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isCancelled = false;

    async function init() {
      try {
        const L = (await import("leaflet")).default;
        if (isCancelled || !mapContainerRef.current) return;

        // Pokud již mapa existuje, bezpečně ji odstraníme
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Vytvoření mapy vycentrované na střední Evropu (Česko, Polsko, Rakousko, Německo, Itálie)
        const initialCenter: [number, number] = compact ? [49.3, 15.2] : [49.2, 15.2];
        const initialZoom = compact ? 5.2 : 6;

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          minZoom: 4,
          maxZoom: 13,
          zoomControl: false,
          attributionControl: false,
        });

        // 1. Podkladové dlaždice s opravenou URL ({y})
        // CartoDB Voyager bez nápisů - vytváří historický plastický terén a moře
        const tileLayer = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
          {
            subdomains: ["a", "b", "c", "d"],
            maxZoom: 14,
            opacity: 0.65,
          }
        );
        tileLayer.addTo(map);

        // 2. Vektorový podklad slepé mapy Evropy s moderními státy a archivy uložení
        try {
          const res = await fetch("/data/europe.json");
          if (res.ok) {
            const europeData = await res.json();
            if (!isCancelled) {
              const geoLayer = L.geoJSON(europeData, {
                style: (feature) => {
                  const countryName = feature?.properties?.NAME || "";
                  const info = MODERN_COUNTRIES[countryName];
                  const isCzech = countryName === "Czech Republic";
                  const hasManuscripts = info?.hasManuscripts ?? false;

                  return {
                    fillColor: isCzech ? "#edd5a8" : hasManuscripts ? "#f6e8cc" : "#faf4e8",
                    fillOpacity: 0.88,
                    color: isCzech ? "#925f2b" : hasManuscripts ? "#a47949" : "#cfb794",
                    weight: isCzech ? 1.9 : hasManuscripts ? 1.3 : 0.85,
                    opacity: 0.9,
                  };
                },
                onEachFeature: (feature, layer) => {
                  const name = feature?.properties?.NAME || "";
                  const info = MODERN_COUNTRIES[name];
                  const title = info?.name || name;

                  let tooltipContent = `<div class="map-country-tooltip">
                    <strong>📍 ${title}</strong>`;

                  if (info?.hasManuscripts) {
                    tooltipContent += `<div class="tooltip-storage-label">Archivy a knihovny s kodexy:</div>
                      <ul class="tooltip-repo-list">
                        ${info.repositories.map((r) => `<li>• ${r}</li>`).join("")}
                      </ul>
                      ${info.note ? `<small>${info.note}</small>` : ""}`;
                  } else {
                    tooltipContent += `<div style="font-size: 10px; color: #7a5a3a; margin-top: 3px;">
                      Bez evidovaných kodexů v aktuální sbírce.
                    </div>`;
                  }

                  tooltipContent += `</div>`;

                  layer.bindTooltip(tooltipContent, { sticky: true, opacity: 0.95 });

                  layer.on({
                    mouseover: (e) => {
                      const l = e.target;
                      l.setStyle({
                        fillColor: "#ffd68a",
                        fillOpacity: 0.96,
                        weight: 2.2,
                        color: "#6b350a",
                      });
                      if (l.bringToFront) l.bringToFront();
                      markersMapRef.current.forEach((m) => {
                        if (m.bringToFront) m.bringToFront();
                      });
                    },
                    mouseout: (e) => {
                      geoLayer.resetStyle(e.target);
                    },
                  });
                },
              });

              geoLayer.addTo(map);
              geoJsonLayerRef.current = geoLayer;
            }
          }
        } catch (geoErr) {
          console.warn("Chyba při načítání GeoJSON slepé mapy Evropy:", geoErr);
        }

        // 3. Středověké říční toky (přirozené geografické koridory písemnictví)
        MEDIEVAL_RIVERS.forEach((river) => {
          const riverLine = L.polyline(river.coords, {
            color: "#3a658a",
            weight: river.id === "vltava" || river.id === "labe" ? 2.4 : 1.8,
            opacity: 0.72,
            smoothFactor: 1.2,
          }).addTo(map);

          riverLine.bindTooltip(
            `<div class="medieval-river-tooltip">🌊 <strong>${river.name}</strong></div>`,
            { sticky: true }
          );
        });

        mapInstanceRef.current = map;
        setMapReady(true);

        // Vynutit správné překreslení rozměrů mapy
        setTimeout(() => map.invalidateSize(), 50);
        setTimeout(() => map.invalidateSize(), 200);
        setTimeout(() => map.invalidateSize(), 600);
      } catch (err) {
        console.error("Chyba při inicializaci Leaflet mapy:", err);
      }
    }

    init();

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      isCancelled = true;
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [compact]);

  // Vykreslení a aktualizace markerů skriptorií
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
        const markerSize = compact ? 34 : 40;

        // Vytvoření custom DivIconu ve stylu voskové pečeti
        const iconHtml = `
          <div class="medieval-leaf-marker ${compact ? "is-compact" : ""} ${hasOwned ? "has-owned" : ""} ${isSelected ? "is-selected" : ""}" title="${place.name} (${place.country})">
            <span class="marker-seal">${place.icon}</span>
            <span class="marker-count">${owned.length}/${cards.length}</span>
            <span class="marker-tooltip">${place.name} · ${place.country}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "leaflet-medieval-icon-wrapper",
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2],
        });

        const marker = L.marker([place.lat, place.lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : 100,
        }).addTo(map);

        marker.on("click", () => {
          onSelectPlace(place);
          if (compact && onOpenFull) {
            onOpenFull();
          } else {
            map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 8), {
              duration: 0.8,
              easeLinearity: 0.25,
            });
          }
        });

        markersMapRef.current.set(place.id, marker);
      });
    }

    renderMarkers();

    return () => {
      isCancelled = true;
    };
  }, [mapReady, scriptoria, selectedPlace, onSelectPlace, compact, onOpenFull]);

  // Posun kamery při změně vybraného místa (pouze v nekompaktním režimu)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !selectedPlace || compact) return;
    const map = mapInstanceRef.current;

    markersMapRef.current.forEach((marker, id) => {
      if (id === selectedPlace.id) {
        marker.setZIndexOffset(1000);
      } else {
        marker.setZIndexOffset(100);
      }
    });

    map.flyTo([selectedPlace.lat, selectedPlace.lng], Math.max(map.getZoom(), 8), {
      duration: 0.7,
      easeLinearity: 0.25,
    });
  }, [selectedPlace, mapReady, compact]);

  // Ovládací tlačítka mapy
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };
  const handleCenterBohemia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([49.8, 15.0], compact ? 6.2 : 7, { duration: 0.8 });
    }
  };
  const handleCenterEurope = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([49.2, 15.2], compact ? 4.8 : 5.2, { duration: 0.8 });
    }
  };

  // Formátování souřadnic
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
    <div className={`real-map-wrapper ${compact ? "compact-mode" : ""}`}>
      {/* Kontejner Leaflet mapy */}
      <div ref={mapContainerRef} className="real-map-element" />

      {/* Dekorační rám */}
      <div className="map-decor-border" pointer-events="none" />

      {/* Kartuše */}
      <div className="map-cartouche">
        <span>📜 ORBIS SCRIPTORIORUM</span>
        {!compact && (
          <small style={{ display: "block", fontSize: "9.5px", opacity: 0.88, fontWeight: 600 }}>
            Geografické uložení kodexů a skriptorií
          </small>
        )}
      </div>

      {/* Tlačítko zvětšení v kompaktním režimu */}
      {compact && onOpenFull && (
        <button
          type="button"
          className="map-compact-expand-btn"
          onClick={onOpenFull}
          title="Otevřít celou interaktivní mapu"
        >
          🔍 Otevřít velkou mapu ↗
        </button>
      )}

      {/* Ovládací prvky mapy */}
      <div className="real-map-controls">
        <button type="button" onClick={handleZoomIn} title="Přiblížit mapu (+)" aria-label="Přiblížit">
          +
        </button>
        <button type="button" onClick={handleZoomOut} title="Oddálit mapu (−)" aria-label="Oddálit">
          −
        </button>
        <button
          type="button"
          onClick={handleCenterBohemia}
          title="Zaměřit na Českou republiku"
          aria-label="Česká republika"
        >
          🏰
        </button>
        {!compact && (
          <button
            type="button"
            onClick={handleCenterEurope}
            title="Zobrazit celou Evropu"
            aria-label="Celá Evropa"
          >
            🗺️
          </button>
        )}
      </div>

      {/* Stavový štítek se souřadnicemi a lokalitou */}
      {!compact && (
        <div className="real-map-status">
          <span className="status-pin">{selectedPlace.icon}</span>
          <strong>{selectedPlace.name}</strong>
          <span className="status-country">({selectedPlace.country})</span>
          <small>{formatCoord(selectedPlace.lat, selectedPlace.lng)}</small>
        </div>
      )}
    </div>
  );
}
