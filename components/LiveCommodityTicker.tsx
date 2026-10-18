'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ShieldAlert, Truck, Sparkles, Activity } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

interface TickerItem {
  code: string;
  name: string;
  nameTa: string;
  price: string;
  change: string;
  isUp: boolean;
  status: string;
}

const TICKER_ITEMS: TickerItem[] = [
  { code: 'OPC-53', name: 'UltraTech OPC 53 Cement', nameTa: 'அல்ட்ராடெக் சிமெண்ட்', price: '₹385/bag', change: '+1.8%', isUp: true, status: 'HIGH DEMAND' },
  { code: 'TMT-550D', name: 'Tata Tiscon 550D Rebar 12mm', nameTa: 'டாடா 550D கம்பிகள்', price: '₹64,500/tonne', change: '-0.5%', isUp: false, status: 'STABLE' },
  { code: 'WRC-1K', name: 'Machine Wire-Cut Red Bricks', nameTa: 'வயர்கட் சிவப்பு செங்கற்கள்', price: '₹11,500/1k', change: '+2.4%', isUp: true, status: 'YARD STOCK' },
  { code: 'MCH-500L', name: 'Apex 500L Diesel Mixer', nameTa: 'டீசல் கான்கிரீட் கலவை', price: '₹1,85,000/unit', change: '0.0%', isUp: true, status: '8 READY' },
  { code: 'UPVC-160', name: 'SN4 Underground UPVC Sewer Pipe', nameTa: 'UPVC வடிகால் குழாய்', price: '₹2,450/6m', change: '+0.8%', isUp: true, status: 'IN STOCK' },
  { code: 'ARM-4C', name: '1.1kV 4-Core Armoured Cable', nameTa: 'ஆர்மர்டு மின் கேபிள்', price: '₹16,800/100m', change: '+1.2%', isUp: true, status: 'CERTIFIED' },
  { code: 'PPC-DAL', name: 'Dalmia Concretdge PPC', nameTa: 'டால்மியா PPC சிமெண்ட்', price: '₹365/bag', change: '+0.5%', isUp: true, status: 'SUPPLY ACTIVE' },
  { code: 'AAC-64', name: 'Ultralite AAC Blocks Cube', nameTa: 'AAC இலகுரக பிளாக்குகள்', price: '₹4,800/cube', change: '-1.1%', isUp: false, status: 'FAST DISPATCH' },
];

export default function LiveCommodityTicker() {
  const { locale } = useApp();

  return (
    <div className="bg-industrial-950 border-y border-industrial-800/80 overflow-hidden py-2.5 relative select-none group">
      {/* Subtle background hazard diagonal pattern */}
      <div className="absolute inset-0 bg-hazard-stripes opacity-40 pointer-events-none" />

      {/* Left indicator pill */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-4 bg-industrial-950/95 border-r border-industrial-800 backdrop-blur">
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-safety-orange tracking-wider uppercase">
          <Activity className="w-3.5 h-3.5 text-safety-orange animate-pulse" />
          <span className="hidden sm:inline">LIVE PROCUREMENT INDEX</span>
          <span className="sm:hidden">LIVE</span>
        </div>
      </div>

      {/* Infinite Scrolling Track */}
      <div className="flex gap-8 pl-36 sm:pl-56 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused] gpu-accelerated">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-3 bg-industrial-900/90 border border-industrial-800 hover:border-safety-orange px-3.5 py-1 rounded text-xs font-mono transition"
          >
            <span className="font-bold text-white tracking-tight">
              {locale === 'ta' ? item.nameTa : item.name}
            </span>
            <span className="text-safety-orange font-bold num-tabular">
              {item.price}
            </span>
            <span
              className={`flex items-center text-[10px] font-bold ${
                item.isUp ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {item.isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {item.change}
            </span>
            <span className="text-[9px] bg-industrial-950 border border-industrial-800 text-industrial-400 px-1.5 py-0.2 rounded font-semibold">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
