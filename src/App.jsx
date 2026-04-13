import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart3, Zap, Wind, LayoutDashboard, Activity, Settings } from 'lucide-react';

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

      <main className="md:ml-20 pt-16 min-h-screen relative overflow-hidden">
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
            
            <div className="bg-surface-container rounded-lg p-6 border border-outline-variant/10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-primary w-4 h-4" />
                  <h3 className="text-[11px] font-headline tracking-[0.2em] font-bold text-on-surface uppercase">Temporal Analysis</h3>
                </div>
              </div>
              <div className="h-48 flex items-end gap-1.5 relative px-2">
                {tempHistory.map((val, i) => (
                  <div key={i} className={`flex-1 transition-all rounded-t-[2px] ${val > 30 ? 'bg-error/40' : val > 28 ? 'bg-tertiary/40' : 'bg-primary/20'}`} style={{ height: `${Math.min(100, (val / 40) * 100)}%` }}></div>
                ))}
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

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container border-t border-outline-variant z-50 flex justify-around py-4">
        <MobileNavBtn icon={<LayoutDashboard />} label="Dash" active />
        <MobileNavBtn icon={<Activity />} label="Sens" />
        <MobileNavBtn icon={<Settings />} label="Sys" />
      </div>
    </div>
  );
};

const MobileNavBtn = ({ icon, label, active = false }) => (
  <button className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-on-surface-variant/60'}`}>
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[8px] font-headline uppercase font-bold">{label}</span>
  </button>
);

export default App;
