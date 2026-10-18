'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Navigation, ShieldCheck, MapPin, Radio, Compass, AlertCircle, ArrowUpRight, Gauge } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

interface DispatchRoute {
  id: string;
  nameEn: string;
  nameTa: string;
  truckId: string;
  truckType: string;
  materialEn: string;
  materialTa: string;
  tonnage: number;
  origin: string;
  destination: string;
  etaMins: number;
  progressPercent: number;
  speedKmh: number;
  weighbridgeStatus: 'verified' | 'in_transit';
}

const ACTIVE_ROUTES: DispatchRoute[] = [
  {
    id: 'R-01',
    nameEn: 'Chennai Port to OMR Metro Viaduct Pier 42',
    nameTa: 'சென்னை துறைமுகம் முதல் OMR மெட்ரோ தூண் 42 வரை',
    truckId: 'TN-04-CX-8821',
    truckType: '16-Wheeler Multi-Axle Trailer (28T)',
    materialEn: 'Tata Tiscon Fe 550D Rebars (16mm)',
    materialTa: 'டாடா டிஸ்கான் Fe 550D கம்பிகள் (16 மிமீ)',
    tonnage: 28.5,
    origin: 'Central Steel Yard, Ennore',
    destination: 'OMR Elevated Corridor Pier 42',
    etaMins: 38,
    progressPercent: 68,
    speedKmh: 46,
    weighbridgeStatus: 'verified',
  },
  {
    id: 'R-02',
    nameEn: 'Arakkonam Yard to Outer Ring Expressway PK-18',
    nameTa: 'அரக்கோணம் யார்டு முதல் அவுட்டர் ரிங் ரோடு PK-18',
    truckId: 'TN-20-BZ-4190',
    truckType: '10-Wheeler Taurus Tipper (16T)',
    materialEn: 'UltraTech Super OPC 53 Grade Cement',
    materialTa: 'அல்ட்ராடெக் சூப்பர் OPC 53 சிமெண்ட்',
    tonnage: 16.0,
    origin: 'Arakkonam Rail Depot Silo 3',
    destination: 'NH-48 Interchange Toll Plaza Site',
    etaMins: 52,
    progressPercent: 44,
    speedKmh: 52,
    weighbridgeStatus: 'verified',
  },
  {
    id: 'R-03',
    nameEn: 'Karur Quarry Hub to Sriperumbudur Industrial Sump',
    nameTa: 'கரூர் குவாரி முதல் ஸ்ரீபெரும்புதூர் தளம் வரை',
    truckId: 'TN-47-E-9032',
    truckType: '6-Wheeler Heavy Tipper (10T)',
    materialEn: 'First-Class Wirecut Red Masonry Bricks',
    materialTa: 'முதல் தர வயர்கட் சிவப்பு செங்கற்கள்',
    tonnage: 11.5,
    origin: 'Namakkal Kiln Zone Yard 7',
    destination: 'Aerospace Park Plant Facility',
    etaMins: 24,
    progressPercent: 82,
    speedKmh: 42,
    weighbridgeStatus: 'verified',
  },
];

export default function AnimatedDispatchRadar() {
  const { locale } = useApp();
  const [selectedRouteId, setSelectedRouteId] = useState<string>('R-01');
  const [liveSecond, setLiveSecond] = useState(0);

  // Simulation tick: gentle speed fluctuation to simulate live movement
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSecond(prev => prev + 1);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const selectedRoute = ACTIVE_ROUTES.find(r => r.id === selectedRouteId) || ACTIVE_ROUTES[0];
  const dynamicProgress = Math.min(98, selectedRoute.progressPercent + (liveSecond % 5) * 0.4);

  return (
    <div className="bg-industrial-950 border border-industrial-800 rounded-2xl overflow-hidden shadow-2xl relative my-8">
      {/* Blueprint Grid Background Pattern */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-30 pointer-events-none" />

      {/* Header telemetry strip */}
      <div className="border-b border-industrial-800 bg-industrial-900/90 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-safety-orange/10 border border-safety-orange/30 flex items-center justify-center">
            <Radio className="w-4 h-4 text-safety-orange animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-safety-orange text-white px-2 py-0.5 rounded uppercase">
                TELEMETRY SIMULATION
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Fleet GPS Active
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {locale === 'ta' ? 'நேரலை சரக்கு கண்காணிப்பு & தள இயக்கம்' : 'Live Freight Dispatch & Transit Radar'}
            </h3>
          </div>
        </div>

        {/* Route Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-industrial-950 border border-industrial-800 rounded-lg font-mono text-xs">
          {ACTIVE_ROUTES.map(route => (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`px-3 py-1.5 rounded transition ${
                selectedRouteId === route.id
                  ? 'bg-safety-orange text-white font-bold shadow'
                  : 'text-industrial-400 hover:text-white'
              }`}
            >
              {route.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Radar & Telemetry Display */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left: Animated Vector Transit Track */}
        <div className="lg:col-span-7 bg-industrial-900/80 border border-industrial-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Scanning Radar Line */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-safety-orange/50 to-transparent animate-scan pointer-events-none" />

          {/* Top route metadata */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-mono text-industrial-400 uppercase tracking-wider">
                [ ROUTE DESIGNATION // {selectedRoute.id} ]
              </div>
              <div className="text-sm sm:text-base font-bold text-white mt-1">
                {locale === 'ta' ? selectedRoute.nameTa : selectedRoute.nameEn}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] font-mono text-industrial-400 uppercase">Speed Telemetry</div>
              <div className="text-lg font-black text-white font-mono flex items-center justify-end gap-1">
                <Gauge className="w-4 h-4 text-safety-orange" />
                <span>{selectedRoute.speedKmh + (liveSecond % 3)} km/h</span>
              </div>
            </div>
          </div>

          {/* Moving Route Vector Animation Track */}
          <div className="py-6 px-2 space-y-3">
            {/* Origin & Destination Labels */}
            <div className="flex justify-between text-xs font-mono text-industrial-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-industrial-400" />
                <span>{selectedRoute.origin}</span>
              </div>
              <div className="flex items-center gap-1.5 text-safety-orange font-bold">
                <Navigation className="w-3.5 h-3.5 text-safety-orange" />
                <span>{selectedRoute.destination}</span>
              </div>
            </div>

            {/* Simulated Animated Road / Rail Corridor Track */}
            <div className="relative h-6 bg-industrial-950 border border-industrial-800 rounded-full overflow-hidden flex items-center px-1">
              {/* Completed track glow */}
              <div 
                className="h-2 bg-gradient-to-r from-safety-orange/40 via-safety-orange to-amber-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${dynamicProgress}%` }}
              />

              {/* Moving Truck Blip on the track */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out flex items-center justify-center"
                style={{ left: `${dynamicProgress}%` }}
              >
                <div className="w-7 h-7 rounded-full bg-safety-orange text-white flex items-center justify-center shadow-lg shadow-safety-orange/50 animate-pulse">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Waypoint Coordinates & Status */}
            <div className="flex justify-between text-[11px] font-mono text-industrial-400 pt-1">
              <span>DEPARTED // 100% SECURE</span>
              <span className="text-white font-bold">{Math.round(dynamicProgress)}% TRANSIT COMPLETE</span>
              <span>EST. DELIVERY IN ~{selectedRoute.etaMins} MINS</span>
            </div>
          </div>

          {/* Safety & Compliance Badge */}
          <div className="mt-4 pt-4 border-t border-industrial-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Weighbridge Slip Verified (IS Electronic Tare)</span>
            </div>
            <div className="text-industrial-400">
              Vehicle Tag: <strong className="text-white">{selectedRoute.truckId}</strong>
            </div>
          </div>
        </div>

        {/* Right: Telemetric Manifest Card */}
        <div className="lg:col-span-5 bg-industrial-900/90 border border-industrial-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
            <span className="text-xs font-mono text-industrial-400 uppercase tracking-wider">
              [ CONSIGNMENT MANIFEST ]
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-bold">
              GPS EN ROUTE
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-mono text-industrial-400 uppercase">Material Cargo</div>
              <div className="text-sm font-bold text-white">
                {locale === 'ta' ? selectedRoute.materialTa : selectedRoute.materialEn}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-industrial-950 border border-industrial-800 rounded p-2.5">
                <div className="text-[10px] font-mono text-industrial-400 uppercase">Consignment Load</div>
                <div className="text-lg font-black text-safety-orange font-mono num-tabular">
                  {selectedRoute.tonnage} Tonnes
                </div>
              </div>

              <div className="bg-industrial-950 border border-industrial-800 rounded p-2.5">
                <div className="text-[10px] font-mono text-industrial-400 uppercase">Carrier Fleet</div>
                <div className="text-xs font-bold text-white mt-1">
                  {selectedRoute.truckType.split(' ')[0]}
                </div>
              </div>
            </div>

            <div className="p-3 bg-industrial-950 border border-industrial-800 rounded text-[11px] font-mono text-industrial-300 space-y-1">
              <div className="text-safety-orange font-bold uppercase">• Platform Direct Managed Logistics</div>
              <div>• Live geo-fencing alert triggered at outer perimeter.</div>
              <div>• Automated SMS e-Way bill issued to site engineer.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
