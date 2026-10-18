'use client';

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Gauge, 
  Wind, 
  ShieldAlert, 
  Sliders, 
  RotateCw, 
  Maximize2, 
  Layers, 
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function HeavyMachineryCraneSimulator() {
  const { locale } = useApp();

  // Crane simulation parameters
  const [boomAngleDeg, setBoomAngleDeg] = useState<number>(55); // 30 to 75 degrees
  const [winchHeightM, setWinchHeightM] = useState<number>(24); // 5 to 40 meters
  const [slewAngleDeg, setSlewAngleDeg] = useState<number>(135); // 0 to 360 degrees
  const [payloadType, setPayloadType] = useState<'rebar' | 'concrete' | 'counterweight'>('rebar');
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(14);
  const [autoSlew, setAutoSlew] = useState<boolean>(false);

  // Micro-simulation: subtle wind fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setWindSpeedKmh(prev => {
        const delta = (Math.random() - 0.48) * 1.5;
        return Number(Math.max(8, Math.min(28, prev + delta)).toFixed(1));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slew motion simulation
  useEffect(() => {
    if (!autoSlew) return;
    const interval = setInterval(() => {
      setSlewAngleDeg(prev => (prev + 1) % 360);
    }, 80);
    return () => clearInterval(interval);
  }, [autoSlew]);

  // Physics calculations
  const payloadSpecs = {
    rebar: { nameEn: 'Fe 550D Rebar Slings (8 Tonnes)', nameTa: 'Fe 550D கம்பி கட்டுகள் (8 டன்கள்)', weightT: 8.0, iconColor: 'text-amber-400' },
    concrete: { nameEn: 'RMC Concrete Skip (12 Tonnes)', nameTa: 'கான்கிரீட் பக்கெட் (12 டன்கள்)', weightT: 12.0, iconColor: 'text-safety-orange' },
    counterweight: { nameEn: 'Precast Beam Segment (16 Tonnes)', nameTa: 'ப்ரீகாஸ்ட் பீம் பகுதி (16 டன்கள்)', weightT: 16.0, iconColor: 'text-rose-400' },
  };

  const currentPayload = payloadSpecs[payloadType];
  
  // Working radius (approx R = BoomLength * cos(angle))
  const boomLengthM = 50;
  const rad = (boomAngleDeg * Math.PI) / 180;
  const radiusM = Number((boomLengthM * Math.cos(rad)).toFixed(1));
  const tipHeightM = Number((boomLengthM * Math.sin(rad) + 12).toFixed(1));

  // Safe Working Load (SWL decreases as radius increases)
  const maxSafeLoadT = Number((320 / (radiusM + 5)).toFixed(1));
  const loadPercentage = Math.round((currentPayload.weightT / maxSafeLoadT) * 100);
  const isOverload = loadPercentage > 95;
  const isWarning = loadPercentage > 80 && !isOverload;

  return (
    <div className="bg-industrial-950 border border-industrial-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-25 pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="border-b border-industrial-800 bg-industrial-900/90 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-safety-orange/15 border border-safety-orange/30 flex items-center justify-center">
            <Gauge className="w-5 h-5 text-safety-orange animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-safety-orange tracking-widest uppercase">
                {locale === 'ta' ? 'தள இயந்திர இயற்பியல் மாதிரி' : 'SITE KINETICS & RIG PHYSICS SIMULATOR'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE 60FPS
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white font-display">
              {locale === 'ta' ? 'டாப்-கிட் டவர் கிரேன் மற்றும் தூக்கும் சுமை மாடலிங்' : 'Top-Kit Tower Crane SWL & Slew Radius Telemetry'}
            </h3>
          </div>
        </div>

        {/* Quick Readout Pills */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-industrial-950 border border-industrial-800 flex items-center gap-2">
            <Wind className={`w-3.5 h-3.5 ${windSpeedKmh > 20 ? 'text-rose-400' : 'text-blue-400'}`} />
            <span className="text-industrial-400">{locale === 'ta' ? 'காற்று வேகம்:' : 'Wind:'}</span>
            <span className="font-bold text-white num-tabular">{windSpeedKmh} km/h</span>
          </div>

          <button
            onClick={() => setAutoSlew(!autoSlew)}
            className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition flex items-center gap-1.5 ${
              autoSlew 
                ? 'bg-safety-orange text-white border-safety-orange shadow-lg shadow-safety-orange/20' 
                : 'bg-industrial-950 text-industrial-300 border-industrial-800 hover:border-safety-orange'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoSlew ? 'animate-spin' : ''}`} />
            <span>{autoSlew ? (locale === 'ta' ? 'சுழற்சி இயங்குகிறது' : 'Auto-Slew ON') : (locale === 'ta' ? 'சுழற்று' : 'Auto-Slew')}</span>
          </button>
        </div>
      </div>

      {/* Main Kinetic Simulation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10">
        {/* Left Interactive SVG Rig Stage (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col items-center justify-between min-h-[420px] bg-gradient-to-b from-industrial-950 via-industrial-900/60 to-industrial-950 border-b lg:border-b-0 lg:border-r border-industrial-800 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-safety-orange/10 rounded-full blur-3xl pointer-events-none" />

          {/* Slew Compass Ring */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-industrial-400 mb-2">
            <div className="flex items-center gap-1.5 bg-industrial-900/80 px-2.5 py-1 rounded border border-industrial-800">
              <Compass className="w-3.5 h-3.5 text-safety-orange" />
              <span>SLEW BEARING: </span>
              <span className="text-white font-bold">{slewAngleDeg}° ({slewAngleDeg > 180 ? 'SW' : 'NE'})</span>
            </div>
            <div className="bg-industrial-900/80 px-2.5 py-1 rounded border border-industrial-800 text-safety-orange font-bold">
              CAD SPEC: IS 4573 / DIN 15018
            </div>
          </div>

          {/* Real-time SVG Crane Mechanics Rendering */}
          <div className="w-full max-w-lg aspect-16/10 relative flex items-center justify-center">
            <svg
              viewBox="0 0 500 320"
              className="w-full h-full drop-shadow-2xl overflow-visible select-none"
            >
              {/* Ground & Construction Foundation Pad */}
              <line x1="40" y1="280" x2="460" y2="280" stroke="#1c283f" strokeWidth="2" strokeDasharray="4 4" />
              <rect x="140" y="270" width="80" height="14" fill="#0f1624" stroke="#2d3d5c" strokeWidth="2" rx="2" />
              <rect x="155" y="284" width="50" height="20" fill="#1c283f" opacity="0.5" />

              {/* Vertical Lattice Mast Tower */}
              <g stroke="#f97316" strokeWidth="2" opacity="0.9">
                <line x1="160" y1="270" x2="160" y2="80" />
                <line x1="200" y1="270" x2="200" y2="80" />
                {/* Internal Cross Lattice Bracing */}
                {[250, 220, 190, 160, 130, 100].map((y, idx) => (
                  <g key={idx}>
                    <line x1="160" y1={y} x2="200" y2={y - 30} stroke="#93a5cc" strokeWidth="1" opacity="0.6" />
                    <line x1="160" y1={y - 30} x2="200" y2={y} stroke="#93a5cc" strokeWidth="1" opacity="0.6" />
                    <line x1="160" y1={y} x2="200" y2={y} stroke="#f97316" strokeWidth="1.5" />
                  </g>
                ))}
              </g>

              {/* Crane Slewing Turntable Unit */}
              <circle cx="180" cy="78" r="14" fill="#080c14" stroke="#f97316" strokeWidth="3" />
              <circle cx="180" cy="78" r="6" fill="#f97316" />

              {/* Operator Cabin */}
              <rect x="150" y="65" width="22" height="22" fill="#141e30" stroke="#f97316" strokeWidth="1.5" rx="2" />
              <rect x="152" y="68" width="10" height="10" fill="#697fa8" opacity="0.8" />

              {/* Counter-Jib & Ballast Weight (Left Side) */}
              <g transform="translate(180, 78)">
                <line x1="0" y1="0" x2="-90" y2="-10" stroke="#f97316" strokeWidth="3" />
                <line x1="0" y1="-25" x2="-90" y2="-10" stroke="#93a5cc" strokeWidth="1.5" strokeDasharray="3 2" />
                {/* Concrete Counterweights */}
                <rect x="-85" y="-5" width="28" height="24" fill="#2d3d5c" stroke="#f97316" strokeWidth="1.5" rx="1" />
                <text x="-71" y="11" fill="#fff" fontSize="8" fontFamily="monospace" textAnchor="middle">18T</text>
              </g>

              {/* Apex Tower Peak (A-Frame) */}
              <line x1="170" y1="78" x2="180" y2="40" stroke="#f97316" strokeWidth="2.5" />
              <line x1="190" y1="78" x2="180" y2="40" stroke="#f97316" strokeWidth="2.5" />

              {/* Dynamic Jib Boom Arm (Rotates with boomAngleDeg) */}
              {/* Jib Pivot is at (180, 78) */}
              <g transform={`translate(180, 78) rotate(${-boomAngleDeg + 40})`}>
                {/* Main Upper Chord */}
                <line x1="0" y1="0" x2="240" y2="0" stroke="#f97316" strokeWidth="3.5" />
                {/* Lower Chord */}
                <line x1="10" y1="12" x2="235" y2="4" stroke="#f97316" strokeWidth="2" />

                {/* Jib Internal Triangular Webbing */}
                {[30, 60, 90, 120, 150, 180, 210].map((x, idx) => (
                  <g key={idx}>
                    <line x1={x} y1="0" x2={x + 15} y2="10" stroke="#93a5cc" strokeWidth="1" opacity="0.7" />
                    <line x1={x + 15} y1="10" x2={x + 30} y2="0" stroke="#93a5cc" strokeWidth="1" opacity="0.7" />
                  </g>
                ))}

                {/* Trolley Unit along the Jib (Positions dynamically) */}
                <rect x="160" y="-3" width="16" height="10" fill="#080c14" stroke="#fff" strokeWidth="1.5" rx="1" />

                {/* Hoist Steel Cable Line (Hangs vertically down regardless of rotation) */}
                {/* We counteract the group rotation to make cable hang straight down */}
                <g transform="translate(168, 7)">
                  <g transform={`rotate(${boomAngleDeg - 40})`}>
                    <line 
                      x1="0" 
                      y1="0" 
                      x2="0" 
                      y2={winchHeightM * 2.8} 
                      stroke="#93a5cc" 
                      strokeWidth="2" 
                      strokeDasharray="2 1" 
                      className="animate-pulse"
                    />

                    {/* Heavy Forged Crane Hook & Pulley Block */}
                    <g transform={`translate(0, ${winchHeightM * 2.8})`}>
                      <rect x="-7" y="0" width="14" height="12" fill="#141e30" stroke="#f97316" strokeWidth="1.5" rx="2" />
                      <circle cx="0" cy="6" r="3" fill="#f97316" />
                      {/* Forged Steel Hook Curve */}
                      <path d="M 0 12 Q 0 22 -6 22 Q -12 22 -12 15 Q -12 11 -8 11" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Suspended Payload with Micro Kinetic Sway */}
                      <g transform="translate(0, 24)" className="animate-float">
                        <line x1="0" y1="0" x2="-18" y2="14" stroke="#93a5cc" strokeWidth="1" />
                        <line x1="0" y1="0" x2="18" y2="14" stroke="#93a5cc" strokeWidth="1" />

                        {payloadType === 'rebar' && (
                          <g transform="translate(-25, 14)">
                            <rect width="50" height="14" fill="#2d3d5c" stroke="#f97316" strokeWidth="1.5" rx="2" />
                            <line x1="5" y1="4" x2="45" y2="4" stroke="#93a5cc" strokeWidth="1" strokeDasharray="3 2" />
                            <line x1="5" y1="10" x2="45" y2="10" stroke="#93a5cc" strokeWidth="1" strokeDasharray="3 2" />
                            <text x="25" y="10" fill="#fff" fontSize="7" fontFamily="monospace" textAnchor="middle">Fe 550D TMT</text>
                          </g>
                        )}

                        {payloadType === 'concrete' && (
                          <g transform="translate(-16, 14)">
                            <polygon points="0,0 32,0 24,20 8,20" fill="#1c283f" stroke="#f97316" strokeWidth="1.5" />
                            <text x="16" y="12" fill="#f97316" fontSize="7" fontFamily="monospace" textAnchor="middle">RMC 12T</text>
                          </g>
                        )}

                        {payloadType === 'counterweight' && (
                          <g transform="translate(-28, 14)">
                            <rect width="56" height="18" fill="#141e30" stroke="#ef4444" strokeWidth="2" rx="2" />
                            <text x="28" y="12" fill="#fff" fontSize="7" fontFamily="monospace" textAnchor="middle">BEAM 16T</text>
                          </g>
                        )}
                      </g>
                    </g>
                  </g>
                </g>
              </g>

              {/* Tie Pendants from Apex to Jib */}
              <line x1="180" y1="40" x2="280" y2="70" stroke="#93a5cc" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 2" />

              {/* Dynamic Dimension Dimension Lines */}
              <g stroke="#485b82" strokeWidth="1" opacity="0.7">
                {/* Radius dimension line */}
                <line x1="180" y1="295" x2="380" y2="295" markerEnd="url(#arrow)" />
                <text x="280" y="310" fill="#93a5cc" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  WORKING RADIUS: {radiusM}m
                </text>
              </g>
            </svg>
          </div>

          {/* Real-time Overload / SWL HUD Bar */}
          <div className="w-full mt-4 bg-industrial-900/90 border border-industrial-800 rounded-xl p-3.5 backdrop-blur">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="flex items-center gap-1.5 font-bold text-industrial-300">
                {isOverload ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>SAFE WORKING LOAD (SWL) CAPACITY</span>
              </span>
              <span className={`font-black num-tabular ${
                isOverload ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {loadPercentage}% OF LIMIT ({currentPayload.weightT}T / {maxSafeLoadT}T)
              </span>
            </div>

            {/* Kinetic Segmented Meter Bar */}
            <div className="w-full h-3 bg-industrial-950 rounded-full overflow-hidden border border-industrial-800 p-0.5 flex gap-1">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverload ? 'bg-rose-500 animate-pulse' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, loadPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Controller Cockpit & Physics Levers (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 bg-industrial-900/40">
          <div>
            <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
              {locale === 'ta' ? 'இயந்திர கட்டுப்பாட்டு பலகை' : 'HYDRAULIC & HOIST ACTUATORS'}
            </div>
            <h4 className="text-xl font-black text-white font-display">
              {locale === 'ta' ? 'கிரேன் செயல்பாடு மற்றும் சுமை சோதனையாளர்' : 'Kinetic Load & Boom Control'}
            </h4>
          </div>

          {/* Payload Selector Radio Bento */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-industrial-300 flex items-center justify-between">
              <span>{locale === 'ta' ? 'தூக்கும் பொருள் தேர்வு:' : 'SUSPENDED MATERIAL PAYLOAD:'}</span>
              <span className="text-safety-orange">{currentPayload.weightT} Tonnes</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['rebar', 'concrete', 'counterweight'] as const).map(pt => (
                <button
                  key={pt}
                  onClick={() => setPayloadType(pt)}
                  className={`p-2.5 rounded-lg border text-xs font-bold text-left transition flex flex-col justify-between ${
                    payloadType === pt
                      ? 'bg-safety-orange/15 border-safety-orange text-white shadow-lg shadow-safety-orange/10'
                      : 'bg-industrial-950 border-industrial-800 text-industrial-400 hover:text-white hover:border-industrial-700'
                  }`}
                >
                  <span className="font-mono text-[10px] text-industrial-400 uppercase">
                    {pt === 'rebar' ? 'STEEL' : pt === 'concrete' ? 'RMC' : 'PRECAST'}
                  </span>
                  <span className="text-xs mt-1 font-semibold line-clamp-1">
                    {pt === 'rebar' ? 'Fe 550D (8T)' : pt === 'concrete' ? 'Concrete (12T)' : 'Precast (16T)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Slider 1: Boom Angle (Pitch) */}
          <div className="space-y-2 bg-industrial-950/80 p-4 rounded-xl border border-industrial-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-industrial-300 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-safety-orange" />
                {locale === 'ta' ? 'பூம் கோணம் (லிப்ட்):' : 'BOOM ELEVATION ANGLE:'}
              </span>
              <span className="text-safety-orange font-black text-sm num-tabular">{boomAngleDeg}°</span>
            </div>
            <input
              type="range"
              min={30}
              max={75}
              value={boomAngleDeg}
              onChange={(e) => setBoomAngleDeg(Number(e.target.value))}
              className="w-full accent-safety-orange cursor-pointer h-2 bg-industrial-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-industrial-500">
              <span>30° (Max Reach)</span>
              <span>55° (Nominal)</span>
              <span>75° (High Lift)</span>
            </div>
          </div>

          {/* Slider 2: Hoist Winch Cable Drop */}
          <div className="space-y-2 bg-industrial-950/80 p-4 rounded-xl border border-industrial-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-industrial-300 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                {locale === 'ta' ? 'வின்ச் கம்பி இறக்கம்:' : 'HOIST WINCH CABLE DROP:'}
              </span>
              <span className="text-blue-400 font-black text-sm num-tabular">{winchHeightM} Metres</span>
            </div>
            <input
              type="range"
              min={6}
              max={38}
              value={winchHeightM}
              onChange={(e) => setWinchHeightM(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-industrial-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-industrial-500">
              <span>6m (Mast Head)</span>
              <span>24m (Pier Height)</span>
              <span>38m (Ground)</span>
            </div>
          </div>

          {/* Slider 3: Slew Turntable Rotation */}
          <div className="space-y-2 bg-industrial-950/80 p-4 rounded-xl border border-industrial-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-industrial-300 font-bold flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                {locale === 'ta' ? 'கிடைமட்ட சுழற்சி கோணம்:' : 'SLEW TURNTABLE BEARING:'}
              </span>
              <span className="text-emerald-400 font-black text-sm num-tabular">{slewAngleDeg}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={slewAngleDeg}
              onChange={(e) => setSlewAngleDeg(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-industrial-800 rounded-lg"
            />
          </div>

          {/* Live Calculated Engineering Telemetry Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
            <div className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg">
              <div className="text-industrial-400 text-[10px] uppercase">{locale === 'ta' ? 'அதிகபட்ச ஆரம்' : 'Jib Radius'}</div>
              <div className="text-lg font-black text-white num-tabular mt-0.5">{radiusM} m</div>
              <div className="text-[10px] text-safety-orange">IS 4573 Certified</div>
            </div>

            <div className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg">
              <div className="text-industrial-400 text-[10px] uppercase">{locale === 'ta' ? 'உயரம்' : 'Tip Hook Height'}</div>
              <div className="text-lg font-black text-white num-tabular mt-0.5">{tipHeightM} m</div>
              <div className="text-[10px] text-emerald-400">Clear Clearance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
