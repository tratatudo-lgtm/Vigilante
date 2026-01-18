import React, { useEffect, useRef, useState } from 'react';
import { Ticket, Location, Radar } from '../types';
import { translations } from '../services/localization';
import { officialRadars } from '../services/radars';
import { Navigation, NavigationOff, MapPin, Target, X, Eye, EyeOff } from 'lucide-react';

interface MapViewProps {
  tickets: Ticket[];
  center: Location;
  onLocationSelect?: (loc: Location) => void;
  selectedLocation?: Location | null;
  lang?: 'pt' | 'en' | 'es' | 'fr' | 'de';
  showRadars?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ tickets, center, onLocationSelect, selectedLocation, lang = 'pt', showRadars: initialShowRadars = true }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const radarMarkersRef = useRef<any[]>([]);
  const tempMarkerRef = useRef<any>(null);
  const routingControlRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [routingMode, setRoutingMode] = useState(false);
  const [startPoint, setStartPoint] = useState<Location | null>(null);
  const [endPoint, setEndPoint] = useState<Location | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; time: string } | null>(null);
  const [showRadars, setShowRadars] = useState(initialShowRadars);

  const t = translations[lang];

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // @ts-ignore
    const L = window.L;
    const map = L.map(containerRef.current, {
      zoomControl: false 
    }).setView([center.lat, center.lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', (e: any) => {
      if (routingMode) {
        if (!startPoint) {
          setStartPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
        } else if (!endPoint) {
          setEndPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
        return;
      }
      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapRef.current = map;
    locateUser();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [routingMode, startPoint, endPoint]);

  const locateUser = () => {
    if (!mapRef.current) return;
    // @ts-ignore
    const L = window.L;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Critical fix: Check if map still exists inside the async callback
        if (!mapRef.current) return;
        
        const { latitude, longitude } = pos.coords;
        mapRef.current.setView([latitude, longitude], 15);
        
        if (userMarkerRef.current) userMarkerRef.current.remove();
        userMarkerRef.current = L.circleMarker([latitude, longitude], {
          radius: 8,
          fillColor: "#6366f1",
          color: "#fff",
          weight: 3,
          opacity: 1,
          fillOpacity: 1
        }).addTo(mapRef.current).bindPopup(t.my_location);
      },
      (err) => console.warn(err)
    );
  };

  // Renderização de Incidências
  useEffect(() => {
    if (!mapRef.current) return;
    // @ts-ignore
    const L = window.L;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    tickets.forEach(ticket => {
      const marker = L.marker([ticket.location.lat, ticket.location.lng])
        .addTo(mapRef.current!)
        .bindPopup(`
          <div class="p-1">
            <h3 class="font-bold text-sm uppercase tracking-tight">${ticket.category}</h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">${t.severity_label}: ${ticket.severity}</p>
            <p class="text-xs mt-2 border-t pt-2 border-slate-100">${ticket.aiSummary || ticket.description}</p>
          </div>
        `);
      markersRef.current.push(marker);
    });
  }, [tickets, lang]);

  // Renderização de Radares
  useEffect(() => {
    if (!mapRef.current) return;
    // @ts-ignore
    const L = window.L;

    radarMarkersRef.current.forEach(m => m.remove());
    radarMarkersRef.current = [];

    if (showRadars) {
      officialRadars.forEach(radar => {
        const radarIcon = L.divIcon({
          className: 'custom-radar-icon',
          html: `
            <div style="background-color: #ef4444; border: 2px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
              <span style="color: white; font-weight: 900; font-size: 10px;">${radar.speedLimit}</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([radar.location.lat, radar.location.lng], { icon: radarIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div class="p-1 text-center">
              <div class="inline-block px-3 py-1 bg-red-600 text-white rounded-full font-black text-xs mb-2">${radar.speedLimit} KM/H</div>
              <h3 class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-1">${t.radar_fixed} (${radar.country})</h3>
              <p class="font-bold text-xs uppercase">${radar.road}</p>
            </div>
          `);
        radarMarkersRef.current.push(marker);
      });
    }
  }, [showRadars, lang]);

  useEffect(() => {
    if (!mapRef.current) return;
    // @ts-ignore
    const L = window.L;

    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    if (selectedLocation) {
      tempMarkerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(mapRef.current).bindPopup(lang === 'pt' ? 'Local do Incidente' : 'Incident Location').openPopup();
    }
  }, [selectedLocation, lang]);

  // Lógica de Rotas
  useEffect(() => {
    if (!mapRef.current || !startPoint || !endPoint) {
      if (routingControlRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    }

    // @ts-ignore
    const L = window.L;
    
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
    }

    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(startPoint.lat, startPoint.lng),
        L.latLng(endPoint.lat, endPoint.lng)
      ],
      lineOptions: {
        styles: [{ color: '#6366f1', weight: 6, opacity: 0.8 }]
      },
      createMarker: () => null,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false
    }).on('routesfound', (e: any) => {
      const routes = e.routes;
      const summary = routes[0].summary;
      setRouteInfo({
        distance: (summary.totalDistance / 1000).toFixed(1) + ' km',
        time: Math.round(summary.totalTime / 60) + ' min'
      });
    }).addTo(mapRef.current);

  }, [startPoint, endPoint]);

  const toggleRouting = () => {
    setRoutingMode(!routingMode);
    if (routingMode) {
      setStartPoint(null);
      setEndPoint(null);
      setRouteInfo(null);
    }
  };

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full min-h-[300px]" />

      {/* Floating Controls */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
        <button 
          onClick={locateUser}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-indigo-600 active-press"
          title={t.my_location}
        >
          <Target size={24} />
        </button>

        <button 
          onClick={() => setShowRadars(!showRadars)}
          className={`p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 active-press transition-all ${showRadars ? 'bg-red-500 text-white shadow-red-200' : 'bg-white dark:bg-slate-900 text-slate-500'}`}
          title={t.show_radars}
        >
          {showRadars ? <Eye size={24} /> : <EyeOff size={24} />}
        </button>

        <button 
          onClick={toggleRouting}
          className={`p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 active-press transition-all ${routingMode ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500'}`}
          title={t.navigation}
        >
          {routingMode ? <NavigationOff size={24} /> : <Navigation size={24} />}
        </button>
      </div>

      {/* Routing UI Overlay */}
      {routingMode && (
        <div className="absolute top-6 left-6 right-16 z-[1000] md:max-w-sm animate-in fade-in slide-in-from-left-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-[2rem] border border-white dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                 <Navigation size={14} /> {t.navigation}
               </h3>
               <button onClick={toggleRouting} className="text-slate-400 hover:text-slate-600">
                 <X size={18} />
               </button>
            </div>

            <div className="space-y-3">
               <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${startPoint ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                 <MapPin size={18} className={startPoint ? 'text-green-500' : 'text-slate-300'} />
                 <span className="text-[11px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400">
                   {startPoint ? `${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}` : t.start_point}
                 </span>
               </div>

               <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${endPoint ? 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                 <MapPin size={18} className={endPoint ? 'text-red-500' : 'text-slate-300'} />
                 <span className="text-[11px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400">
                   {endPoint ? `${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}` : t.end_point}
                 </span>
               </div>
            </div>

            {!startPoint && (
              <p className="text-[9px] font-black text-amber-600 uppercase text-center animate-pulse">Toque no mapa para o Ponto A</p>
            )}
            {startPoint && !endPoint && (
              <p className="text-[9px] font-black text-indigo-600 uppercase text-center animate-pulse">Toque no mapa para o Destino</p>
            )}

            {routeInfo && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around">
                <div className="text-center">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Distância</p>
                   <p className="text-sm font-black dark:text-white">{routeInfo.distance}</p>
                </div>
                <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
                <div className="text-center">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Tempo Est.</p>
                   <p className="text-sm font-black dark:text-white">{routeInfo.time}</p>
                </div>
              </div>
            )}

            {(startPoint || endPoint) && (
              <button 
                onClick={() => { setStartPoint(null); setEndPoint(null); setRouteInfo(null); }}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest active-press transition-all"
              >
                {t.clear_route}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;