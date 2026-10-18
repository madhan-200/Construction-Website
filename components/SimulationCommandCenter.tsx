'use client';

import React, { useState } from 'react';
import { 
  Gauge, 
  Truck, 
  RotateCw, 
  Calculator, 
  Radio, 
  Sliders, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import HeavyMachineryCraneSimulator from '@/components/HeavyMachineryCraneSimulator';
import AnimatedDispatchRadar from '@/components/AnimatedDispatchRadar';
import ConcreteBatchingSimulator from '@/components/ConcreteBatchingSimulator';
import MaterialSimulator from '@/components/MaterialSimulator';

type SimulatorTab = 'crane' | 'radar' | 'batching' | 'calculator';

export default function SimulationCommandCenter() {
  const { locale } = useApp();
  const [activeTab, setActiveTab] = useState<SimulatorTab>('crane');

  return (
    <div className="space-y-6">
      {/* Simulation Command Center Header Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-industrial-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 bg-safety-orange/15 border border-safety-orange/30 text-safety-orange text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{locale === 'ta' ? 'ஊடாடும் தள உருவகப்படுத்துதல் மையம்' : 'Interactive Construction Physics & Dispatch Center'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display tracking-tight">
            {locale === 'ta' ? 'இயந்திர இயக்கங்கள் மற்றும் சரக்கு உருவகப்படுத்துதல்' : 'Live Plant Kinetics & Logistics Simulation'}
          </h2>
          <p className="text-xs sm:text-sm text-industrial-400 mt-1 max-w-2xl font-sans">
            {locale === 'ta' 
              ? 'சுழலும் இயந்திரங்கள், டவர் கிரேன் சுமை கணக்கீடு, மற்றும் தள சரக்கு போக்குவரத்து வழிகளை நிகழ்நேரத்தில் சோதிக்கவும்.'
              : 'Experience real-time site engineering simulations: adjust tower crane boom pitch, rotate RMC transit drums, monitor weighbridge dispatch corridors, and calculate raw material loads.'}
          </p>
        </div>

        {/* Tab Navigation Controls with Dribbble Tactile Switch */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-industrial-900 border border-industrial-800 rounded-xl">
          <button
            onClick={() => setActiveTab('crane')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'crane'
                ? 'bg-safety-orange text-white shadow-lg shadow-safety-orange/20'
                : 'text-industrial-400 hover:text-white hover:bg-industrial-800/60'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{locale === 'ta' ? '1. டவர் கிரேன்' : '1. Tower Crane Rig'}</span>
          </button>

          <button
            onClick={() => setActiveTab('batching')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'batching'
                ? 'bg-safety-orange text-white shadow-lg shadow-safety-orange/20'
                : 'text-industrial-400 hover:text-white hover:bg-industrial-800/60'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{locale === 'ta' ? '2. கான்கிரீட் சுழற்சி' : '2. RMC Transit Drum'}</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'radar'
                ? 'bg-safety-orange text-white shadow-lg shadow-safety-orange/20'
                : 'text-industrial-400 hover:text-white hover:bg-industrial-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{locale === 'ta' ? '3. தள ரேடார்' : '3. Dispatch Radar'}</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'calculator'
                ? 'bg-safety-orange text-white shadow-lg shadow-safety-orange/20'
                : 'text-industrial-400 hover:text-white hover:bg-industrial-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{locale === 'ta' ? '4. அளவு கால்குலேட்டர்' : '4. Engineering Calc'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Tab Stage */}
      <div className="transition-all duration-300">
        {activeTab === 'crane' && <HeavyMachineryCraneSimulator />}
        {activeTab === 'batching' && <ConcreteBatchingSimulator />}
        {activeTab === 'radar' && <AnimatedDispatchRadar />}
        {activeTab === 'calculator' && <MaterialSimulator />}
      </div>
    </div>
  );
}
