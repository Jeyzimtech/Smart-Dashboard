import React from 'react';
import { Activity } from 'lucide-react';

export const MetricHero = ({ temperature, isCritical, peakTemp }) => (
  <div className={`rounded-lg p-12 relative overflow-hidden min-h-[480px] flex flex-col justify-center border transition-all duration-500 ${isCritical ? 'bg-error-container/20 border-error/30' : 'bg-surface-container border-outline-variant/5'}`}>
    <div className={`absolute -top-24 -right-24 w-96 h-96 blur-[100px] rounded-full transition-colors duration-1000 ${isCritical ? 'bg-error/20' : 'bg-primary/10'}`}></div>
    <div className="relative z-10">
      <div className="flex items-baseline gap-4">
        <span className={`text-[10px] font-headline tracking-[0.4em] uppercase font-bold ${isCritical ? 'text-error' : 'text-primary'}`}>Current_Reading</span>
        <div className={`h-[1px] flex-grow bg-gradient-to-r to-transparent ${isCritical ? 'from-error/30' : 'from-primary/30'}`}></div>
      </div>
      <div className="flex items-start gap-4 mt-4">
        <span className={`text-7xl sm:text-9xl md:text-[10rem] lg:text-[12rem] leading-[0.8] font-headline font-extrabold tracking-tighter transition-colors duration-500 ${isCritical ? 'text-error' : 'text-on-surface'}`}>
          {temperature.toFixed(1)}
        </span>
        <div className="pt-2 sm:pt-6 space-y-4">
          <span className="text-3xl sm:text-6xl font-headline font-light text-on-surface-variant/50">°C</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-2xl">
        <MetricSmall label="Setpoint_Max" value="30.0 °C" />
        <MetricSmall label="Peak_Recorded" value={`${peakTemp.toFixed(1)} °C`} />
        <MetricSmall 
          label="Variance" 
          value={`${((temperature - 25) / 25 * 100).toFixed(1)}%`} 
          color={temperature > 25 ? 'text-tertiary' : 'text-primary'}
        />
      </div>
    </div>
  </div>
);

export const MetricSmall = ({ label, value, color = "text-on-surface" }) => (
  <div className="space-y-1">
    <span className="text-[9px] font-headline tracking-widest text-on-surface-variant uppercase">{label}</span>
    <p className={`text-2xl font-headline font-medium ${color}`}>{value}</p>
  </div>
);

export const StatusCard = ({ label, value, progress, icon, special }) => (
  <div className="bg-surface-container rounded p-4 border border-outline-variant/10">
    <span className="text-[9px] font-headline tracking-widest text-on-surface-variant uppercase block mb-3">{label}</span>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <div className="text-2xl font-headline font-bold text-on-surface">{value}</div>
    </div>
    <div className="w-full bg-surface-container-low h-1 rounded-full overflow-hidden">
      <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
    </div>
    {special && (
      <div className="flex items-center gap-1 text-[8px] text-tertiary font-bold mt-2 uppercase tracking-tighter">
        <Activity size={10} className="animate-pulse" />
        {special}
      </div>
    )}
  </div>
);
