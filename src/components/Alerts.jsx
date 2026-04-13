import React from 'react';
import { Terminal } from 'lucide-react';

export const NotificationPanel = ({ logs, setShowNotifPanel }) => (
  <div className="absolute top-12 right-[-50px] sm:right-0 w-[90vw] sm:w-80 bg-surface-container border border-outline-variant shadow-2xl rounded-lg overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
    <div className="p-4 border-b border-outline-variant/10 bg-surface-container-high/50 flex justify-between items-center">
      <span className="text-[10px] font-headline font-bold tracking-widest uppercase text-on-surface">Recent Alerts</span>
      <button onClick={() => setShowNotifPanel(false)} className="text-on-surface-variant hover:text-on-surface text-[10px] uppercase font-bold">Close</button>
    </div>
    <div className="max-h-96 overflow-y-auto scrolling-logs p-2 space-y-2">
      {logs.length === 0 ? (
        <div className="p-4 text-center text-xs text-on-surface-variant italic">No new notifications</div>
      ) : (
        [...logs].reverse().slice(0, 8).map(log => (
          <div key={log.id} className={`p-3 rounded border border-transparent ${log.type === 'CRIT' ? 'bg-error/5 border-error/10' : 'bg-surface-container-low'}`}>
            <div className="flex justify-between items-start mb-1">
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${log.type === 'CRIT' ? 'text-error' : 'text-primary'}`}>{log.type}</span>
              <span className="text-[9px] text-on-surface-variant/50">{log.time}</span>
            </div>
            <p className="text-[11px] leading-tight text-on-surface">{log.msg}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

export const SystemLogs = ({ logs, scrollRef, isCritical, clearLogs, currentTime }) => (
  <div className="bg-surface-container-low rounded-lg border border-outline-variant/20 flex flex-col h-[calc(100vh-420px)] min-h-[460px]">
    <div className="p-4 border-b border-outline-variant/10 bg-surface-container/30 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Terminal className="text-on-surface-variant w-4 h-4" />
        <h3 className="text-[11px] font-headline tracking-[0.2em] font-bold text-on-surface uppercase">System Notifications</h3>
      </div>
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-surface-container-highest text-[8px] font-headline text-on-surface-variant tracking-widest uppercase">
        <span className="w-1 h-1 bg-primary rounded-full animate-pulse"></span>
        Streaming
      </span>
    </div>
    <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto scrolling-logs font-mono text-[11px] space-y-3">
      {logs.map(log => (
        <div key={log.id} className={`flex gap-3 p-1.5 rounded transition-colors ${log.type === 'CRIT' ? 'bg-error/10 border-l-2 border-error' : ''}`}>
          <span className="text-on-surface-variant/40 shrink-0 font-mono">{log.time}</span>
          <span className={`font-bold shrink-0 ${log.type === 'CRIT' ? 'text-error' : log.type === 'WARN' ? 'text-tertiary' : 'text-primary'}`}>
            [{log.type}]
          </span>
          <span className={log.type === 'CRIT' ? 'text-on-error-container' : 'text-on-surface'}>{log.msg}</span>
        </div>
      ))}
      <div className="flex gap-3 animate-pulse opacity-50">
        <span className="text-on-surface-variant/40 shrink-0">{currentTime}</span>
        <span className="text-on-surface-variant">_ awaiting telemetry packet...</span>
      </div>
    </div>
    <div className="p-4 bg-surface-container-lowest flex items-center justify-between border-t border-outline-variant/10">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-error animate-ping' : 'bg-primary'}`}></div>
        <span className={`text-[9px] font-headline tracking-widest font-bold uppercase ${isCritical ? 'text-error' : 'text-on-surface-variant'}`}>
          {isCritical ? 'High_Surface_Temp_Alert' : 'Environment_Nominal'}
        </span>
      </div>
      <button onClick={clearLogs} className="text-[9px] font-headline tracking-widest text-primary hover:underline uppercase transition-all">Clear Logs</button>
    </div>
  </div>
);
