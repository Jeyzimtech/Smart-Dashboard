import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart3, Zap, Wind, LayoutDashboard, Activity, Settings, History } from 'lucide-react';

// Specialized Components
import { Navbar, Sidebar } from './components/Navigation';
import { NotificationPanel, SystemLogs } from './components/Alerts';
import { MetricHero, StatusCard } from './components/Metrics';
import { ControlPanel } from './components/Controls';

// --- Constants ---
const TEMP_THRESHOLD = 30.0;
const POLLING_INTERVAL = 10000;

const App = () => {
  // --- State ---
  const [temperature, setTemperature] = useState(22.4);
  const [isCritical, setIsCritical] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, time: '17:40:00', type: 'INFO', msg: 'IoT Sensor Node SVR-RACK-ALPHA-9 online.' },
    { id: 2, time: '17:42:00', type: 'INFO', msg: 'Core cooling synchronization: STABLE.' }
  ]);
  const [tempHistory, setTempHistory] = useState([21.2, 21.8, 22.1, 23.3, 22.8, 22.1, 22.5, 23.2, 22.4, 22.4]);
  const [peakTemp, setPeakTemp] = useState(28.1);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [manualCooling, setManualCooling] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const scrollRef = useRef(null);

  // --- Helpers ---
  const addLog = (msg, type = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [...prev.slice(-49), { id: crypto.randomUUID(), time: timestamp, type, msg }]);
  };

  const playSiren = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      [440, 880, 440, 880, 440].forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + (i * 0.2));
      });
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1);
    } catch (e) {
      console.warn("Audio blocked:", e);
    }
  };

  // --- Logic ---
  const fetchData = useCallback(async () => {
    try {
      await fetch('/data.json');
      const timeSec = Date.now() / 1000;
      const oscillation = Math.sin((2 * Math.PI * timeSec) / 40) * 8.5;
      const noise = (Math.random() - 0.5) * 1.5;
      let newTemp = parseFloat((27.5 + oscillation + noise).toFixed(1));
      
      if (manualCooling) newTemp -= 10.0;

      setTemperature(newTemp);
      setTempHistory(prev => [...prev.slice(1), newTemp]);
      setPeakTemp(prev => newTemp > prev ? newTemp : prev);
      setIsCritical(newTemp > TEMP_THRESHOLD);
    } catch {
      addLog('Error: Failed to sync with station sensor.', 'CRIT');
    }
  }, [manualCooling]);

  useEffect(() => {
    Promise.resolve().then(() => fetchData());
    const timer = setInterval(fetchData, POLLING_INTERVAL);
    const clock = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => { clearInterval(timer); clearInterval(clock); };
  }, [fetchData]);

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    
    if (isCritical) {
      setTimeout(() => addLog(`CRITICAL OVERHEAT: Rack SVR-RACK-ALPHA-9 exceeds ${TEMP_THRESHOLD}°C!`, 'CRIT'), 0);
      playSiren();
    } else {
      setTimeout(() => addLog(`RECOVERY: Core temperature stabilized in IoT Station Section-04.`, 'INFO'), 0);
    }
  }, [isCritical]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  // --- Handlers ---
  const toggleCooling = () => {
    setManualCooling(!manualCooling);
    addLog(manualCooling ? 'Manual cooling disabled.' : 'Manual cooling enabled.', 'WARN');
  };

  const simulateSurge = () => {
    const surgeTemp = 35.2;
    setTemperature(surgeTemp);
    setTempHistory(prev => [...prev.slice(1), surgeTemp]);
    setPeakTemp(prev => surgeTemp > prev ? surgeTemp : prev);
    setIsCritical(true);
    addLog(`MANUAL OVERRIDE: Thermal surge simulated (${surgeTemp}°C).`, 'CRIT');
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isCritical ? 'bg-[#2a0b0b]' : 'bg-surface'}`}>
      <Navbar 
        isCritical={isCritical} 
        showNotifPanel={showNotifPanel} 
        toggleNotif={() => setShowNotifPanel(!showNotifPanel)}
      />

      <Sidebar />

      <main className="md:ml-20 pt-16 pb-24 md:pb-8 min-h-screen relative overflow-hidden">
        {isCritical && <div className="absolute inset-0 pointer-events-none z-10 bg-error/5 animate-pulse border-4 border-error/20"></div>}

        <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-6 relative z-20">
          <div className="col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-2 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-on-surface uppercase whitespace-nowrap overflow-hidden text-ellipsis">Rack_Exhaust_Temp</h1>
              <p className="text-[9px] sm:text-xs text-on-surface-variant font-medium uppercase tracking-[0.15em]">Node: SVR-RACK-ALPHA-9 // Section-04</p>
            </div>
            <div className="text-left sm:text-right hidden sm:block">
              <p className="text-lg sm:text-xl font-headline font-medium text-on-surface font-mono">{currentTime}</p>
            </div>
          </div>

          <section className="col-span-12 lg:col-span-8 space-y-6">
            <MetricHero temperature={temperature} isCritical={isCritical} peakTemp={peakTemp} />
            
            <div className="bg-surface-container rounded-lg p-6 border border-outline-variant/10 relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-primary w-4 h-4" />
                  <h3 className="text-[11px] font-headline tracking-[0.2em] font-bold text-on-surface uppercase">Temporal Analysis</h3>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-on-surface-variant/60">
                     <span className="w-2 h-2 rounded-full bg-primary/40"></span> Nominal
                   </div>
                   <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-on-surface-variant/60">
                     <span className="w-2 h-2 rounded-full bg-error/40"></span> Critical
                   </div>
                </div>
              </div>
              
              <div className="h-56 relative group">
                {/* Grid Lines */}
                <div className="absolute inset-x-0 top-0 h-full border-b border-outline-variant/5 flex flex-col justify-between pointer-events-none">
                  {[40, 30, 20, 10, 0].map(level => (
                    <div key={level} className="relative w-full border-t border-outline-variant/5">
                      <span className="absolute -left-1 -top-2 text-[8px] font-mono text-on-surface-variant/30">{level}°</span>
                    </div>
                  ))}
                </div>

                {/* Threshold Line */}
                <div className="absolute inset-x-0 border-t border-error/30 border-dashed z-20 pointer-events-none" style={{ top: '25%' }}>
                   <span className="absolute right-0 -top-3 text-[8px] font-bold text-error/60 bg-surface-container px-1 uppercase tracking-tighter">Threshold (30.0°C)</span>
                </div>

                {/* Bars */}
                <div className="absolute inset-x-0 bottom-0 h-full flex items-end gap-1 sm:gap-2 px-6 pb-2">
                  {tempHistory.map((val, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group/bar relative">
                      <span className={`absolute -top-6 text-[9px] font-mono font-bold transition-all opacity-0 group-hover/bar:opacity-100 group-last:opacity-100 ${val > 30 ? 'text-error' : 'text-primary'}`}>
                        {val.toFixed(1)}
                      </span>
                      <div 
                        className={`w-full transition-all duration-700 rounded-t-[2px] relative ${val > 30 ? 'bg-error/40 border-t border-error/50 shadow-[0_0_15px_-5px_rgba(255,180,171,0.3)]' : 'bg-primary/20 border-t border-primary/30'} ${i === tempHistory.length - 1 ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-surface-container animate-pulse' : ''}`} 
                        style={{ height: `${Math.min(100, (val / 40) * 100)}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-between px-6 text-[8px] font-headline tracking-[0.2em] text-on-surface-variant/30 uppercase">
                 <span>T-90s</span>
                 <span>T-60s</span>
                 <span>T-30s</span>
                 <span>Live</span>
              </div>
            </div>
          </section>

          <section className="col-span-12 lg:col-span-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <StatusCard label="Power_Load" value="88.2%" progress={88} icon={<Zap size={14} className="text-primary" />} />
              <StatusCard label="Cooling_RPM" value={manualCooling ? "18,200" : "12,400"} progress={manualCooling ? 95 : 65} icon={<Wind size={14} className="text-primary" />} special={manualCooling ? "BOOST_ACTIVE" : null} />
            </div>

            <SystemLogs logs={logs} scrollRef={scrollRef} isCritical={isCritical} clearLogs={() => setLogs([])} currentTime={currentTime} />
            
            <ControlPanel manualCooling={manualCooling} toggleCooling={toggleCooling} simulateSurge={simulateSurge} resetAlarm={() => setIsCritical(false)} />
          </section>
        </div>

        {showNotifPanel && <NotificationPanel logs={logs} setShowNotifPanel={setShowNotifPanel} />}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container border-t border-outline-variant z-50 grid grid-cols-4 py-4">
        <MobileNavBtn icon={<LayoutDashboard />} label="Dash" active />
        <MobileNavBtn icon={<Activity />} label="Sens" />
        <MobileNavBtn 
          icon={<History size={20} />} 
          label="Logs" 
          onClick={() => setShowNotifPanel(!showNotifPanel)}
        />
        <MobileNavBtn icon={<Settings />} label="Sys" />
      </div>
    </div>
  );
};

const MobileNavBtn = ({ icon, label, active = false, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-on-surface-variant/60'}`}>
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[8px] font-headline uppercase font-bold">{label}</span>
  </button>
);

export default App;
