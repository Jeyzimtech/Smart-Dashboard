import React from 'react';
import { Wind, HardDrive, Zap, AlertTriangle } from 'lucide-react';

export const ControlPanel = ({ manualCooling, toggleCooling, simulateSurge, resetAlarm }) => (
  <div className="bg-surface-container rounded-lg p-6 border border-outline-variant/10">
    <h4 className="text-[10px] font-headline tracking-[0.2em] font-bold text-on-surface-variant uppercase mb-4">Manual_Overrides</h4>
    <div className="space-y-3">
      <button 
        onClick={toggleCooling}
        className={`w-full py-3 font-headline font-bold text-[11px] tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${manualCooling ? 'bg-tertiary text-on-tertiary' : 'bg-primary-container text-on-primary-container'}`}
      >
        {manualCooling ? <Wind size={14} className="animate-spin" /> : <HardDrive size={14} />}
        {manualCooling ? 'Disable Auxiliary Cooling' : 'Enable Auxiliary Cooling'}
      </button>
      <button 
        onClick={simulateSurge}
        className="w-full py-3 bg-error-container/40 border border-error/30 text-error font-headline font-bold text-[11px] tracking-widest uppercase hover:bg-error-container/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <Zap size={14} className="animate-pulse" />
        Simulate Thermal Surge
      </button>
      <button 
        onClick={resetAlarm}
        className="w-full py-3 bg-surface-container-high border border-outline-variant text-on-surface font-headline font-bold text-[11px] tracking-widest uppercase hover:bg-surface-container-highest active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <AlertTriangle size={14} />
        Reset Alarm State
      </button>
    </div>
  </div>
);
