'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  RotateCw, 
  Activity, 
  Droplet, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function ConcreteBatchingSimulator() {
  const { locale } = useApp();

  const [concreteGrade, setConcreteGrade] = useState<'M20' | 'M25' | 'M30' | 'M40'>('M25');
  const [drumRpm, setDrumRpm] = useState<number>(8); // 0 to 18 RPM
  const [waterCementRatio, setWaterCementRatio] = useState<number>(0.45); // 0.38 to 0.60
  const [batchVolumeM3, setBatchVolumeM3] = useState<number>(6); // 1 to 12 m3

  // Slump calculation based on w/c ratio & grade
  const slumpMm = useMemo(() => {
    // base slump ~ 100mm at 0.45 w/c
    const base = 100;
    const delta = (waterCementRatio - 0.45) * 400;
    return Math.min(180, Math.max(50, Math.round(base + delta)));
  }, [waterCementRatio]);

  const slumpWorkability = useMemo(() => {
    if (slumpMm < 75) return { label: 'Low Workability (Heavy Pavements)', color: 'text-amber-400', badge: 'bg-amber-400/10 border-amber-400/30' };
    if (slumpMm <= 130) return { label: 'Medium Workability (Normal RCC Beams & Slabs)', color: 'text-emerald-400', badge: 'bg-emerald-400/10 border-emerald-400/30' };
    return { label: 'High Workability (Pumping & Deep Piles)', color: 'text-blue-400', badge: 'bg-blue-400/10 border-blue-400/30' };
  }, [slumpMm]);

  // Mix constituents calculation
  const recipe = useMemo(() => {
    const grades = {
      M20: { c: 320, s: 750, a: 1180, costPerM3: 4950, strength: '20 N/mm²' },
      M25: { c: 380, s: 710, a: 1160, costPerM3: 5600, strength: '25 N/mm²' },
      M30: { c: 420, s: 680, a: 1140, costPerM3: 6150, strength: '30 N/mm²' },
      M40: { c: 480, s: 640, a: 1120, costPerM3: 7100, strength: '40 N/mm²' },
    };
    const g = grades[concreteGrade];
    const totalCementBags = Math.ceil((g.c * batchVolumeM3) / 50);
    const totalSandTonnes = Number(((g.s * batchVolumeM3) / 1000).toFixed(1));
    const totalAggTonnes = Number(((g.a * batchVolumeM3) / 1000).toFixed(1));
    const totalWaterLitres = Math.round(g.c * waterCementRatio * batchVolumeM3);
    const totalCostInr = Math.round(g.costPerM3 * batchVolumeM3);

    return {
      ...g,
      totalCementBags,
      totalSandTonnes,
      totalAggTonnes,
      totalWaterLitres,
      totalCostInr,
    };
  }, [concreteGrade, waterCementRatio, batchVolumeM3]);

  // Dynamic animation duration for drum rotation
  const spinSpeedSeconds = drumRpm > 0 ? (60 / drumRpm).toFixed(2) : '0';

  return (
    <div className="bg-industrial-950 border border-industrial-800 rounded-2xl overflow-hidden shadow-2xl relative my-8">
      {/* Background blueprint dots pattern */}
      <div className="absolute inset-0 bg-blueprint-dots opacity-30 pointer-events-none" />

      {/* Header telemetry strip */}
      <div className="border-b border-industrial-800 bg-industrial-900/90 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-safety-orange/15 border border-safety-orange/30 flex items-center justify-center">
            <RotateCw className={`w-5 h-5 text-safety-orange ${drumRpm > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: `${Math.max(1, Number(spinSpeedSeconds))}s` }} />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider">
              {locale === 'ta' ? 'ரெடி-மிக்ஸ் கான்கிரீட் தயாரிப்பு மாதிரி' : 'AUTOMATED RMC BATCHING & TRANSIT MIXER KINETICS'}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white font-display">
              {locale === 'ta' ? 'சுழலும் டிரான்ஸிட் கலவை மற்றும் ஸ்லம்ப் ஓட்ட சோதனை' : 'Transit Drum RPM Rotation & Slump Cone Rheology'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${slumpWorkability.badge} ${slumpWorkability.color}`}>
            SLUMP: {slumpMm} mm
          </span>
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-industrial-950 border border-industrial-800 text-white">
            IS 456 / IS 10262
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10">
        {/* Left Side: Animated Rotating Drum & Slump Visualizer (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col items-center justify-between min-h-[380px] bg-gradient-to-b from-industrial-950 via-industrial-900/50 to-industrial-950 border-b lg:border-b-0 lg:border-r border-industrial-800 relative">
          
          {/* Top Drum RPM status */}
          <div className="w-full flex items-center justify-between text-xs font-mono text-industrial-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-safety-orange animate-ping" />
              <span>DRUM STATUS: </span>
              <span className="text-white font-bold">
                {drumRpm === 0 ? 'STATIONARY (IDLE)' : drumRpm <= 6 ? 'AGITATING IN-TRANSIT' : 'HIGH-SHEAR BATCH MIXING'}
              </span>
            </div>
            <div className="text-safety-orange font-bold num-tabular">
              {drumRpm} RPM ({drumRpm > 0 ? `${spinSpeedSeconds}s / rev` : 'OFF'})
            </div>
          </div>

          {/* Isometric Transit Mixer Drum SVG with Real CSS Continuous Rotation */}
          <div className="w-full max-w-md aspect-16/9 relative flex items-center justify-center my-4">
            <svg viewBox="0 0 400 220" className="w-full h-full drop-shadow-2xl">
              {/* Truck Chassis Platform */}
              <rect x="50" y="160" width="300" height="14" fill="#0f1624" stroke="#2d3d5c" strokeWidth="2" rx="2" />
              {/* Wheels */}
              <circle cx="90" cy="180" r="18" fill="#080c14" stroke="#93a5cc" strokeWidth="3" />
              <circle cx="90" cy="180" r="7" fill="#f97316" />
              <circle cx="270" cy="180" r="18" fill="#080c14" stroke="#93a5cc" strokeWidth="3" />
              <circle cx="270" cy="180" r="7" fill="#f97316" />
              <circle cx="310" cy="180" r="18" fill="#080c14" stroke="#93a5cc" strokeWidth="3" />
              <circle cx="310" cy="180" r="7" fill="#f97316" />

              {/* Truck Driver Cabin */}
              <polygon points="50,160 50,90 95,90 120,120 120,160" fill="#141e30" stroke="#f97316" strokeWidth="2" />
              <rect x="60" y="100" width="30" height="25" fill="#2d3d5c" opacity="0.8" rx="2" />
              <rect x="100" y="115" width="14" height="20" fill="#2d3d5c" opacity="0.8" rx="1" />

              {/* Drum Mounting Pedestal Supports */}
              <polygon points="140,160 160,110 180,160" fill="#1c283f" stroke="#2d3d5c" strokeWidth="1.5" />
              <polygon points="280,160 295,120 310,160" fill="#1c283f" stroke="#2d3d5c" strokeWidth="1.5" />

              {/* Rotating Heavy Double-Cone Transit Drum */}
              {/* Center of Drum is approx at (225, 115) */}
              <g transform="translate(225, 115)">
                {/* Drum Body with dynamic CSS rotation when RPM > 0 */}
                <g 
                  className={drumRpm > 0 ? 'gpu-accelerated' : ''}
                  style={drumRpm > 0 ? {
                    animation: `drumSpin ${spinSpeedSeconds}s linear infinite`,
                    transformOrigin: '0px 0px',
                  } : {}}
                >
                  {/* Pear/Cone Drum Outline */}
                  <ellipse cx="0" cy="0" rx="70" ry="46" fill="#0f1624" stroke="#f97316" strokeWidth="3" />
                  
                  {/* Spiral Agitator Blades on Drum Exterior */}
                  <path d="M -55 -25 Q 0 -45 55 -20" stroke="#f97316" strokeWidth="2.5" fill="none" opacity="0.9" />
                  <path d="M -60 10 Q 0 45 60 10" stroke="#f97316" strokeWidth="2.5" fill="none" opacity="0.9" />
                  <path d="M -40 -35 Q 0 0 40 35" stroke="#93a5cc" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.7" />

                  {/* Safety Hazard Stripes Across Drum Center */}
                  <rect x="-45" y="-12" width="90" height="24" fill="#1c283f" stroke="#f97316" strokeWidth="1" rx="2" opacity="0.85" />
                  <text x="0" y="4" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    BUILDMART RMC
                  </text>
                </g>

                {/* Central Bearing Axle Hub (Doesn't spin, stays steady) */}
                <circle cx="0" cy="0" r="10" fill="#080c14" stroke="#fff" strokeWidth="2" />
                <circle cx="0" cy="0" r="4" fill="#f97316" />
              </g>

              {/* Discharge Chute (Right Side) */}
              <polygon points="305,100 350,135 345,145 300,110" fill="#2d3d5c" stroke="#f97316" strokeWidth="1.5" />
              
              {/* Flowing Concrete Slurry Animation from Chute when RPM > 6 */}
              {drumRpm > 4 && (
                <g className="animate-pulse">
                  <path d="M 345 145 Q 360 165 370 190" stroke="#93a5cc" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <circle cx="370" cy="192" r="6" fill="#485b82" />
                </g>
              )}
            </svg>
          </div>

          {/* Bottom Slump Rheology Status */}
          <div className="w-full bg-industrial-900/90 border border-industrial-800 rounded-xl p-4 backdrop-blur">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-industrial-300 font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-safety-orange" />
                <span>IS 1199 SLUMP WORKABILITY CLASS:</span>
              </span>
              <span className={`font-bold ${slumpWorkability.color}`}>
                {slumpWorkability.label}
              </span>
            </div>

            {/* Slump Cone Visual Height Bar */}
            <div className="w-full h-2.5 bg-industrial-950 rounded-full overflow-hidden border border-industrial-800 flex">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-safety-orange to-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(slumpMm / 180) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-industrial-500 mt-1">
              <span>50mm (Zero Slump)</span>
              <span>100mm (Standard RCC)</span>
              <span>180mm (Flowing RMC)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Batch Mix Recipes & Sliders (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 bg-industrial-900/30">
          <div>
            <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
              {locale === 'ta' ? 'கலவை விவஸ்தை மற்றும் அளவு' : 'BATCH MIX DESIGN & HYDRATION'}
            </div>
            <h4 className="text-xl font-black text-white font-display">
              {concreteGrade} Concrete Mix Calibration
            </h4>
          </div>

          {/* Grade Selector Radio Bento */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-industrial-300 flex items-center justify-between">
              <span>{locale === 'ta' ? 'கான்கிரீட் தரம்:' : 'STRUCTURAL GRADE:'}</span>
              <span className="text-safety-orange font-bold">{recipe.strength} 28-Day Strength</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['M20', 'M25', 'M30', 'M40'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setConcreteGrade(g)}
                  className={`py-2 px-1 rounded-lg border text-xs font-black transition text-center ${
                    concreteGrade === g
                      ? 'bg-safety-orange text-white border-safety-orange shadow-lg shadow-safety-orange/20'
                      : 'bg-industrial-950 border-industrial-800 text-industrial-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Slider 1: Drum RPM Speed */}
          <div className="space-y-2 bg-industrial-950/80 p-3.5 rounded-xl border border-industrial-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-industrial-300 font-bold flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-safety-orange" />
                {locale === 'ta' ? 'டிரான்ஸிட் டிரம் சுழற்சி வேகம்:' : 'DRUM ROTATION SPEED:'}
              </span>
              <span className="text-safety-orange font-black text-sm num-tabular">{drumRpm} RPM</span>
            </div>
            <input
              type="range"
              min={0}
              max={16}
              value={drumRpm}
              onChange={(e) => setDrumRpm(Number(e.target.value))}
              className="w-full accent-safety-orange cursor-pointer h-2 bg-industrial-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-industrial-500">
              <span>0 RPM (Halt)</span>
              <span>4-6 RPM (Transit)</span>
              <span>12-16 RPM (Discharge)</span>
            </div>
          </div>

          {/* Slider 2: Water / Cement Ratio */}
          <div className="space-y-2 bg-industrial-950/80 p-3.5 rounded-xl border border-industrial-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-industrial-300 font-bold flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-blue-400" />
                {locale === 'ta' ? 'நீர்/சிமெண்ட் விகிதம் (w/c):' : 'WATER-CEMENT (w/c) RATIO:'}
              </span>
              <span className="text-blue-400 font-black text-sm num-tabular">{waterCementRatio.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.38}
              max={0.58}
              step={0.01}
              value={waterCementRatio}
              onChange={(e) => setWaterCementRatio(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-industrial-800 rounded-lg"
            />
          </div>

          {/* Slider 3: Batch Transit Mixer Volume */}
          <div className="space-y-2 bg-industrial-950/80 p-3.5 rounded-xl border border-industrial-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-industrial-300 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                {locale === 'ta' ? 'மொத்த அளவு (m³):' : 'TRUCK BATCH VOLUME:'}
              </span>
              <span className="text-emerald-400 font-black text-sm num-tabular">{batchVolumeM3} m³</span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              step={1}
              value={batchVolumeM3}
              onChange={(e) => setBatchVolumeM3(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-industrial-800 rounded-lg"
            />
          </div>

          {/* Dynamic Recipe Breakdown */}
          <div className="p-4 bg-industrial-950 border border-industrial-800 rounded-xl space-y-3">
            <div className="text-xs font-mono font-bold text-white flex items-center justify-between border-b border-industrial-800 pb-2">
              <span>{locale === 'ta' ? 'தேவையான மூலப்பொருட்கள்' : 'RAW MATERIAL CONSUMPTION'}</span>
              <span className="text-safety-orange font-black">₹{recipe.totalCostInr.toLocaleString('en-IN')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-industrial-400 text-[10px]">{locale === 'ta' ? 'சிமெண்ட் (OPC 53):' : 'OPC 53 Cement:'}</span>
                <div className="text-white font-bold">{recipe.totalCementBags} Bags</div>
              </div>
              <div>
                <span className="text-industrial-400 text-[10px]">{locale === 'ta' ? 'ஆற்று மணல் / M-Sand:' : 'Manufactured Sand:'}</span>
                <div className="text-white font-bold">{recipe.totalSandTonnes} Tonnes</div>
              </div>
              <div>
                <span className="text-industrial-400 text-[10px]">{locale === 'ta' ? '20மிமீ ஜல்லி கற்கள்:' : '20mm Aggregates:'}</span>
                <div className="text-white font-bold">{recipe.totalAggTonnes} Tonnes</div>
              </div>
              <div>
                <span className="text-industrial-400 text-[10px]">{locale === 'ta' ? 'தண்ணீர் அளவு:' : 'Mixing Water:'}</span>
                <div className="text-white font-bold">{recipe.totalWaterLitres} Litres</div>
              </div>
            </div>

            <Link
              href="/quote"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-safety-orange hover:bg-safety-orange-hover text-white font-bold py-2.5 rounded-lg text-xs transition shadow-lg shadow-safety-orange/20"
            >
              <span>{locale === 'ta' ? 'இந்த கலவைக்கு நேரடி விலை கோரிக்கை' : 'Request Dispatch for this Batch'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
