'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { 
  Calculator, 
  Truck, 
  Layers, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  Gauge,
  Sliders,
  Boxes
} from 'lucide-react';

type SimulationMode = 'concrete' | 'freight' | 'steel';

export default function MaterialSimulator() {
  const { locale } = useApp();
  const [activeTab, setActiveTab] = useState<SimulationMode>('concrete');

  // 1. Concrete Mix State
  const [concreteGrade, setConcreteGrade] = useState<'M15' | 'M20' | 'M25' | 'M30'>('M25');
  const [structureType, setStructureType] = useState<'slab' | 'column' | 'foundation'>('slab');
  const [lengthM, setLengthM] = useState<number>(10);
  const [widthM, setWidthM] = useState<number>(8);
  const [thicknessMm, setThicknessMm] = useState<number>(150);

  // Concrete Mix Ratios & Calculations (IS 456:2000 & IS 10262)
  const concreteCalcs = useMemo(() => {
    const wetVolumeM3 = lengthM * widthM * (thicknessMm / 1000);
    // Dry volume factor ~ 1.54 to 1.57
    const dryVolumeM3 = wetVolumeM3 * 1.54;

    // Ratio constants [Cement, Sand, Aggregates]
    const ratios: Record<string, { c: number; s: number; a: number; bagsPerM3: number; costPerM3: number }> = {
      M15: { c: 1, s: 2, a: 4, bagsPerM3: 6.3, costPerM3: 4200 },
      M20: { c: 1, s: 1.5, a: 3, bagsPerM3: 8.0, costPerM3: 4950 },
      M25: { c: 1, s: 1, a: 2, bagsPerM3: 9.8, costPerM3: 5600 },
      M30: { c: 1, s: 0.8, a: 1.8, bagsPerM3: 11.2, costPerM3: 6250 },
    };

    const cfg = ratios[concreteGrade];
    const totalBags = Math.ceil(wetVolumeM3 * cfg.bagsPerM3);
    const sandTonnes = Number((wetVolumeM3 * 0.72).toFixed(1));
    const aggregateTonnes = Number((wetVolumeM3 * 1.25).toFixed(1));
    const waterLitres = Math.round(totalBags * 28);
    const estCostInr = Math.round(wetVolumeM3 * cfg.costPerM3);

    return {
      wetVolumeM3: wetVolumeM3.toFixed(2),
      dryVolumeM3: dryVolumeM3.toFixed(2),
      totalBags,
      sandTonnes,
      aggregateTonnes,
      waterLitres,
      estCostInr,
    };
  }, [lengthM, widthM, thicknessMm, concreteGrade]);

  // 2. Freight Logistics State
  const [totalTonnage, setTotalTonnage] = useState<number>(24);
  const [distanceKm, setDistanceKm] = useState<number>(45);

  const freightCalcs = useMemo(() => {
    // 6-wheeler (10T capacity), 10-wheeler (16T), 16-wheeler (28T)
    let recommendedTruck = '10-Wheeler Taurus (16 Tonne)';
    let truckCount = 1;
    let axleLoadSafety = 94; // %

    if (totalTonnage <= 10) {
      recommendedTruck = '6-Wheeler Tipper (10 Tonne)';
      truckCount = 1;
      axleLoadSafety = Math.round((totalTonnage / 10) * 100);
    } else if (totalTonnage <= 16) {
      recommendedTruck = '10-Wheeler Taurus (16 Tonne)';
      truckCount = 1;
      axleLoadSafety = Math.round((totalTonnage / 16) * 100);
    } else if (totalTonnage <= 28) {
      recommendedTruck = '16-Wheeler Heavy Trailer (28 Tonne)';
      truckCount = 1;
      axleLoadSafety = Math.round((totalTonnage / 28) * 100);
    } else {
      recommendedTruck = '16-Wheeler Fleet Combination';
      truckCount = Math.ceil(totalTonnage / 28);
      axleLoadSafety = 98;
    }

    // Base freight rate approx ₹45/km + ₹12/tonne-km
    const baseFreightInr = Math.round(distanceKm * 45 + totalTonnage * distanceKm * 8.5);

    return {
      recommendedTruck,
      truckCount,
      axleLoadSafety: Math.min(100, Math.max(10, axleLoadSafety)),
      baseFreightInr,
      turnaroundHrs: (distanceKm / 35 + 2).toFixed(1), // Average 35km/h in transit + 2h unload
    };
  }, [totalTonnage, distanceKm]);

  // 3. Steel Rebar Schedule State
  const [barDiameterMm, setBarDiameterMm] = useState<number>(12);
  const [barCount, setBarCount] = useState<number>(120);
  const [cutLengthM, setCutLengthM] = useState<number>(6.5);

  const steelCalcs = useMemo(() => {
    // Standard rebar unit weight: D^2 / 162 kg/m
    const weightPerMetreKg = (barDiameterMm * barDiameterMm) / 162;
    const totalLengthMetres = barCount * cutLengthM;
    const totalWeightKg = totalLengthMetres * weightPerMetreKg;
    const totalTonnage = (totalWeightKg / 1000).toFixed(2);
    // Standard bundle weight approx 2,000 kg (2T)
    const bundles = Math.ceil(totalWeightKg / 2000);
    // Base rate ₹64.5/kg -> ₹64,500/tonne
    const estSteelCostInr = Math.round((totalWeightKg * 64.5));

    return {
      weightPerMetreKg: weightPerMetreKg.toFixed(3),
      totalLengthMetres: totalLengthMetres.toFixed(1),
      totalWeightKg: Math.round(totalWeightKg),
      totalTonnage,
      bundles,
      estSteelCostInr,
    };
  }, [barDiameterMm, barCount, cutLengthM]);

  return (
    <section className="relative overflow-hidden my-12" id="simulators">
      {/* Outer Shell: Double-Bezel Hardware Frame */}
      <div className="rounded-2xl p-1 sm:p-2 bg-gradient-to-b from-industrial-700/60 to-industrial-900/80 border border-industrial-800 shadow-2xl">
        <div className="rounded-xl bg-industrial-950 p-6 sm:p-8 border border-industrial-800/80">
          
          {/* Header Telemetry Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-industrial-800">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-safety-orange animate-pulse" />
                <span>[ TELEMETRY SIMULATION LAB // REV 2.4 ]</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {locale === 'ta' ? 'கட்டுமான தள அளவீட்டு உருவகப்படுத்துதல்' : 'Interactive Civil Site & Material Dispatch Simulators'}
              </h2>
              <p className="text-xs sm:text-sm text-industrial-400 mt-0.5">
                {locale === 'ta' 
                  ? 'IS தரநிலைகளுக்கு ஏற்ப துல்லியமான கான்கிரீட், எஃகு மற்றும் சரக்கு தேவை உருவகப்படுத்துதல்'
                  : 'Real-time structural mix estimators, rebar schedules, and freight dispatch telemetry for contractors.'}
              </p>
            </div>

            {/* Simulation Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-industrial-900 border border-industrial-800 rounded-lg self-start md:self-auto font-mono text-xs">
              <button
                onClick={() => setActiveTab('concrete')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                  activeTab === 'concrete' 
                    ? 'bg-safety-orange text-white font-bold shadow' 
                    : 'text-industrial-400 hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{locale === 'ta' ? 'கான்கிரீட்' : 'Concrete Mix'}</span>
              </button>

              <button
                onClick={() => setActiveTab('freight')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                  activeTab === 'freight' 
                    ? 'bg-safety-orange text-white font-bold shadow' 
                    : 'text-industrial-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{locale === 'ta' ? 'சரக்கு' : 'Freight Fleet'}</span>
              </button>

              <button
                onClick={() => setActiveTab('steel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                  activeTab === 'steel' 
                    ? 'bg-safety-orange text-white font-bold shadow' 
                    : 'text-industrial-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{locale === 'ta' ? 'எஃகு கம்பி' : 'Rebar Schedule'}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: CONCRETE MIX SIMULATOR */}
          {activeTab === 'concrete' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-5">
                <div className="space-y-3">
                  <label className="text-xs font-mono font-bold text-industrial-300 uppercase flex items-center justify-between">
                    <span>Target Concrete Grade (IS 456)</span>
                    <span className="text-safety-orange">{concreteGrade} Grade</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['M15', 'M20', 'M25', 'M30'] as const).map(grade => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setConcreteGrade(grade)}
                        className={`py-2 text-xs font-mono font-bold rounded border transition ${
                          concreteGrade === grade
                            ? 'bg-industrial-800 border-safety-orange text-safety-orange'
                            : 'bg-industrial-900 border-industrial-800 text-industrial-400 hover:text-white'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono font-bold text-industrial-300 uppercase flex items-center justify-between">
                    <span>Structural Element</span>
                    <span className="text-industrial-400 font-normal capitalize">{structureType}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'slab', label: 'Roof Slab', th: 150 },
                      { id: 'column', label: 'Columns', th: 450 },
                      { id: 'foundation', label: 'Raft Footing', th: 600 },
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setStructureType(st.id as any);
                          setThicknessMm(st.th);
                        }}
                        className={`py-2 text-xs font-mono rounded border transition ${
                          structureType === st.id
                            ? 'bg-industrial-800 border-safety-orange text-white font-bold'
                            : 'bg-industrial-900 border-industrial-800 text-industrial-400 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimension Sliders */}
                <div className="space-y-4 pt-2 border-t border-industrial-900">
                  <div>
                    <div className="flex justify-between text-xs font-mono text-industrial-300 mb-1">
                      <span>Length (Metres)</span>
                      <span className="font-bold text-white num-tabular">{lengthM} m</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={40}
                      step={0.5}
                      value={lengthM}
                      onChange={e => setLengthM(Number(e.target.value))}
                      className="w-full accent-safety-orange cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-industrial-300 mb-1">
                      <span>Width (Metres)</span>
                      <span className="font-bold text-white num-tabular">{widthM} m</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={0.5}
                      value={widthM}
                      onChange={e => setWidthM(Number(e.target.value))}
                      className="w-full accent-safety-orange cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-industrial-300 mb-1">
                      <span>Thickness (Millimetres)</span>
                      <span className="font-bold text-white num-tabular">{thicknessMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={1200}
                      step={25}
                      value={thicknessMm}
                      onChange={e => setThicknessMm(Number(e.target.value))}
                      className="w-full accent-safety-orange cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Simulation Telemetry Output Column */}
              <div className="lg:col-span-7 bg-industrial-900/90 border border-industrial-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
                  <div className="text-xs font-mono text-industrial-400 uppercase tracking-wider">
                    [ BATCH YIELD COMPUTATION ]
                  </div>
                  <div className="text-xs font-mono font-bold text-safety-orange">
                    Volume: {concreteCalcs.wetVolumeM3} m³ (Wet)
                  </div>
                </div>

                {/* 4 Metric Telemetry Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3 text-center">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">OPC 53 Cement</div>
                    <div className="text-lg font-black text-white num-tabular">{concreteCalcs.totalBags}</div>
                    <div className="text-[10px] text-safety-orange font-mono">Bags (50kg)</div>
                  </div>

                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3 text-center">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">M-Sand / Sand</div>
                    <div className="text-lg font-black text-white num-tabular">{concreteCalcs.sandTonnes}</div>
                    <div className="text-[10px] text-industrial-400 font-mono">Tonnes</div>
                  </div>

                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3 text-center">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">20mm Aggregates</div>
                    <div className="text-lg font-black text-white num-tabular">{concreteCalcs.aggregateTonnes}</div>
                    <div className="text-[10px] text-industrial-400 font-mono">Tonnes</div>
                  </div>

                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3 text-center">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">Water Volume</div>
                    <div className="text-lg font-black text-white num-tabular">{concreteCalcs.waterLitres}</div>
                    <div className="text-[10px] text-industrial-400 font-mono">Litres</div>
                  </div>
                </div>

                {/* Material Bill & Quick Action */}
                <div className="bg-industrial-950/80 border border-industrial-800/80 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-mono text-industrial-400">
                      Estimated Material Cost (Direct Yard Supply)
                    </div>
                    <div className="text-2xl font-black text-safety-orange num-tabular">
                      ₹{concreteCalcs.estCostInr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-mono text-industrial-500">
                      Includes 50kg bag cement + sand + coarse aggregate mix estimate
                    </div>
                  </div>

                  <Link
                    href={`/quote?prefill=Cement+OPC+53+${concreteCalcs.totalBags}+Bags`}
                    className="inline-flex items-center justify-center gap-2 bg-safety-orange hover:bg-safety-orange-hover text-white text-xs font-bold px-4 py-2.5 rounded transition shadow shrink-0"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Transfer to Bulk RFQ</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FREIGHT DISPATCH SIMULATOR */}
          {activeTab === 'freight' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-mono text-industrial-300 mb-1">
                    <span>Total Consignment Weight (Tonnes)</span>
                    <span className="font-bold text-white num-tabular">{totalTonnage} Tonnes</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={120}
                    step={2}
                    value={totalTonnage}
                    onChange={e => setTotalTonnage(Number(e.target.value))}
                    className="w-full accent-safety-orange cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-industrial-500 mt-1">
                    <span>2T (Single Axel)</span>
                    <span>50T (Fleet)</span>
                    <span>120T (Mega Infrastructure)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-industrial-300 mb-1">
                    <span>Site Haul Distance (Kilometres)</span>
                    <span className="font-bold text-white num-tabular">{distanceKm} km</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={300}
                    step={5}
                    value={distanceKm}
                    onChange={e => setDistanceKm(Number(e.target.value))}
                    className="w-full accent-safety-orange cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-industrial-900 border border-industrial-800 rounded text-xs font-mono space-y-1 text-industrial-300">
                  <div className="text-safety-orange font-bold uppercase">[ FREIGHT COMPLIANCE NOTES ]</div>
                  <div>• Platform-managed freight adheres to MoRTH axle weight limits.</div>
                  <div>• All heavy tipper trucks include GPS site tracking and verified weighbridge slips.</div>
                </div>
              </div>

              {/* Simulation Telemetry Column */}
              <div className="lg:col-span-7 bg-industrial-900/90 border border-industrial-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
                  <div className="text-xs font-mono text-industrial-400 uppercase tracking-wider">
                    [ FLEET ALLOCATION TELEMETRY ]
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>MoRTH Compliant</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">Vehicle Classification</div>
                    <div className="text-sm font-bold text-white">{freightCalcs.recommendedTruck}</div>
                    <div className="text-[10px] text-safety-orange font-mono mt-1">{freightCalcs.truckCount} Vehicle(s) required</div>
                  </div>

                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">Axle Load Safety</div>
                    <div className="text-lg font-black text-white num-tabular">{freightCalcs.axleLoadSafety}%</div>
                    <div className="w-full bg-industrial-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className={`h-full ${freightCalcs.axleLoadSafety > 90 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                        style={{ width: `${freightCalcs.axleLoadSafety}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">Transit & Unload SLA</div>
                    <div className="text-lg font-black text-white num-tabular">~{freightCalcs.turnaroundHrs}h</div>
                    <div className="text-[10px] text-industrial-400 font-mono">Gate-to-gate turnaround</div>
                  </div>
                </div>

                <div className="bg-industrial-950/80 border border-industrial-800/80 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-mono text-industrial-400">
                      Estimated Freight Surcharge
                    </div>
                    <div className="text-2xl font-black text-safety-orange num-tabular">
                      ₹{freightCalcs.baseFreightInr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-mono text-industrial-500">
                      Platform-managed flat rate including toll, loading, and transit insurance
                    </div>
                  </div>

                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 bg-industrial-800 hover:bg-industrial-700 text-white text-xs font-bold px-4 py-2.5 rounded transition border border-industrial-700 hover:border-safety-orange shrink-0"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STEEL REBAR BENDING SCHEDULE */}
          {activeTab === 'steel' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-5">
                <div className="space-y-3">
                  <label className="text-xs font-mono font-bold text-industrial-300 uppercase flex items-center justify-between">
                    <span>Bar Diameter (Nominal Ø)</span>
                    <span className="text-safety-orange">{barDiameterMm} mm</span>
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {([8, 10, 12, 16, 20, 25] as const).map(dia => (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => setBarDiameterMm(dia)}
                        className={`py-2 text-xs font-mono font-bold rounded border transition ${
                          barDiameterMm === dia
                            ? 'bg-industrial-800 border-safety-orange text-safety-orange'
                            : 'bg-industrial-900 border-industrial-800 text-industrial-400 hover:text-white'
                        }`}
                      >
                        {dia}mm
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-industrial-300 mb-1">
                    <span>Number of Rebars</span>
                    <span className="font-bold text-white num-tabular">{barCount} bars</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={barCount}
                    onChange={e => setBarCount(Number(e.target.value))}
                    className="w-full accent-safety-orange cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-industrial-300 mb-1">
                    <span>Cutting Length per Bar</span>
                    <span className="font-bold text-white num-tabular">{cutLengthM} metres</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    step={0.25}
                    value={cutLengthM}
                    onChange={e => setCutLengthM(Number(e.target.value))}
                    className="w-full accent-safety-orange cursor-pointer"
                  />
                  <div className="text-[10px] font-mono text-industrial-500 mt-1">
                    Standard mill rebar stock length is 12.0 Metres.
                  </div>
                </div>
              </div>

              {/* Simulation Telemetry Column */}
              <div className="lg:col-span-7 bg-industrial-900/90 border border-industrial-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
                  <div className="text-xs font-mono text-industrial-400 uppercase tracking-wider">
                    [ STEEL TONNAGE COMPUTATION // IS 1786 ]
                  </div>
                  <div className="text-xs font-mono font-bold text-safety-orange">
                    Unit: {steelCalcs.weightPerMetreKg} kg/m
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3 text-center">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">Total Run Length</div>
                    <div className="text-lg font-black text-white num-tabular">{steelCalcs.totalLengthMetres}</div>
                    <div className="text-[10px] text-industrial-400 font-mono">Metres</div>
                  </div>

                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3 text-center">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">Total Weight</div>
                    <div className="text-lg font-black text-white num-tabular">{steelCalcs.totalWeightKg}</div>
                    <div className="text-[10px] text-safety-orange font-mono">Kilograms</div>
                  </div>

                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3 text-center">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">Consignment Tonnage</div>
                    <div className="text-lg font-black text-white num-tabular">{steelCalcs.totalTonnage}</div>
                    <div className="text-[10px] text-industrial-400 font-mono">Tonnes</div>
                  </div>

                  <div className="bg-industrial-950 border border-industrial-800 rounded p-3 text-center">
                    <div className="text-[10px] font-mono text-industrial-400 uppercase mb-1">Steel Bundles</div>
                    <div className="text-lg font-black text-white num-tabular">{steelCalcs.bundles}</div>
                    <div className="text-[10px] text-industrial-400 font-mono">Bundles (Strapped)</div>
                  </div>
                </div>

                <div className="bg-industrial-950/80 border border-industrial-800/80 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-mono text-industrial-400">
                      Estimated Tata Tiscon Fe 550D Rebar Value
                    </div>
                    <div className="text-2xl font-black text-safety-orange num-tabular">
                      ₹{steelCalcs.estSteelCostInr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-mono text-industrial-500">
                      Based on current mill wholesale index (₹64,500/Tonne)
                    </div>
                  </div>

                  <Link
                    href={`/quote?prefill=Tata+Tiscon+Fe+550D+${barDiameterMm}mm+${steelCalcs.totalTonnage}+Tonnes`}
                    className="inline-flex items-center justify-center gap-2 bg-safety-orange hover:bg-safety-orange-hover text-white text-xs font-bold px-4 py-2.5 rounded transition shadow shrink-0"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Generate Steel RFQ</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
