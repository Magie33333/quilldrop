"use client";

import { useEffect, useRef, useState } from "react";
import type { ScriptoriumPlace } from "../data/scriptoria";
import { HISTORICAL_REALMS, MEDIEVAL_RIVERS } from "../data/medievalMapData";

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

        // Vytvoření mapy vycentrované na střední Evropu (Čechy, Morava, Polsko, Rakousko, Německo, Itálie)
        const map = L.map(mapContainerRef.current, {
          center: [49.2, 15.2],
          zoom: 6,
          minZoom: 4,
          maxZoom: 13,
          zoomControl: false,
          attributionControl: false,
        });

        // 1. Podkladové dlaždice s opravenou URL (včetně parametru {y})
        // CartoDB Voyager bez moderních nápisů - vytváří historický plastický terén a moře
        const tileLayer = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
          {
            subdomains: ["a", "b", "c", "d"],
            maxZoom: 14,
            opacity: 0.65,
          }
        );
        tileLayer.addTo(map);

        // Fallback: Pokud by CartoDB selhalo, OpenStreetMap jako záloha
        tileLayer.on("tileerror", () => {
          // GeoJSON podklad zajistí, že mapa je VŽDY plně viditelná i offline
        });

        // 2. Vektorový GeoJSON podklad - SLEPÁ MAPA EVROPY (Offline-ready z public/data/europe.json)
        try {
          const res = await fetch("/data/europe.json");
          if (res.ok) {
            const europeData = await res.json();
            if (!isCancelled) {
              const geoLayer = L.geoJSON(europeData, {
                style: (feature) => {
                  const countryName = feature?.properties?.NAME || "";
                  const isCzech = countryName === "Czech Republic";
                  const isPrimaryRealm = [
                    "Czech Republic",
                    "Poland",
                    "Germany",
                    "Italy",
                    "Austria",
                  ].includes(countryName);

                  return {
                    fillColor: isCzech ? "#f5dfb8" : isPrimaryRealm ? "#f9ecd5" : "#fdf6ea",
                    fillOpacity: 0.85,
                    color: isCzech ? "#78350f" : isPrimaryRealm ? "#8c5c28" : "#af814e",
                    weight: isCzech ? 2.2 : isPrimaryRealm ? 1.6 : 1.1,
                    opacity: 0.9,
                    dashArray: isPrimaryRealm ? undefined : "3, 3",
                  };
                },
                onEachFeature: (feature, layer) => {
                  const name = feature?.properties?.NAME || "";
                  const realm = HISTORICAL_REALMS[name];
                  const title = realm?.czech || name;
                  const latin = realm?.latin ? `<em>${realm.latin}</em><br/>` : "";
                  const note = realm?.note ? `<small>${realm.note}</small>` : "";

                  layer.bindTooltip(
                    `<div class="map-country-tooltip">
                      <strong>${title}</strong><br/>
                      ${latin}
                      ${note}
                    </div>`,
                    { sticky: true, opacity: 0.95 }
                  );

                  layer.on({
                    mouseover: (e) => {
                      const l = e.target;
                      l.setStyle({
                        fillColor: "#fed7aa",
                        fillOpacity: 0.96,
                        weight: 2.5,
                        color: "#602203",
                      });
                      if (l.bringToFront) l.bringToFront();
                      // Udržet markery v popředí
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

        // 3. Středověké říční toky (Vltava, Labe, Dunaj, Rýn, Visla, Pád, Arno)
        MEDIEVAL_RIVERS.forEach((river) => {
          const riverLine = L.polyline(river.coords, {
            color: "#3a658a",
            weight: river.id === "vltava" || river.id === "labe" ? 2.6 : 2.0,
            opacity: 0.72,
            smoothFactor: 1.2,
          }).addTo(map);

          riverLine.bindTooltip(
            `<div class="medieval-river-tooltip">🌊 <strong>${river.name}</strong> <em>(${river.latin})</em></div>`,
            { sticky: true }
          );
        });

        mapInstanceRef.current = map;
        setMapReady(true);

        // Vynutit správné překreslení rozměrů mapy v modálním okně
        setTimeout(() => map.invalidateSize(), 60);
        setTimeout(() => map.invalidateSize(), 200);
        setTimeout(() => map.invalidateSize(), 600);
      } catch (err) {
        console.error("Chyba při inicializaci Leaflet mapy:", err);
      }
    }

    init();

    // Sledování změn velikosti kontejneru
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
  }, []);

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

        const marker = L.marker([place.lat, place.lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : 100,
        }).addTo(map);

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

    // Aktualizace z-indexu aktivního markeru
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
  }, [selectedPlace, mapReady]);

  // Ovládací tlačítka mapy
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };
  const handleCenterBohemia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([49.8, 15.0], 7, { duration: 0.8 });
    }
  };
  const handleCenterEurope = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([49.2, 15.2], 5, { duration: 0.8 });
    }
  };

  // Formátování zeměpisných souřadnic
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
      {/* Kontejner Leaflet mapy */}
      <div ref={mapContainerRef} className="real-map-element" />

      {/* Historická kartuše a dekorační rám */}
      <div className="map-decor-border" pointer-events="none" />
      <div className="map-cartouche">
        <span>📜 ORBIS SCRIPTORIORUM</span>
        <small style={{ display: "block", fontSize: "9px", opacity: 0.85, fontWeight: 600 }}>
          Slepá mapa středověké Evropy (14.–15. stol.)
        </small>
      </div>

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
          title="Zaměřit na České království"
          aria-label="České království"
        >
          🏰
        </button>
        <button
          type="button"
          onClick={handleCenterEurope}
          title="Zobrazit celou Evropu"
          aria-label="Celá Evropa"
        >
          🗺️
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
