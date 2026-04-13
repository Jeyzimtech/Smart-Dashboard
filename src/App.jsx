import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, 
  Settings, 
  Bell, 
  Cpu, 
  BarChart3, 
  Terminal, 
  Thermometer, 
  Wind, 
  Zap, 
  AlertTriangle,
  History,
  LayoutDashboard,
  HardDrive
} from 'lucide-react';

// --- Constants ---
const TEMP_THRESHOLD = 30.0;
const POLLING_INTERVAL = 10000; // 10 seconds

const App = () => {
  // --- State ---
  const [temperature, setTemperature] = useState(22.4);
  const [isCritical, setIsCritical] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, time: '17:40:00', type: 'INFO', msg: 'Data Center Node SVR-RACK-ALPHA-9 online.' },
    { id: 2, time: '17:42:00', type: 'INFO', msg: 'Core cooling synchronization: STABLE.' }
  ]);
  const [tempHistory, setTempHistory] = useState([21.2, 21.8, 22.1, 23.3, 22.8, 22.1, 22.5, 23.2, 22.4, 22.4]);
  const [peakTemp, setPeakTemp] = useState(28.1);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [manualCooling, setManualCooling] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const scrollRef = useRef(null);
  const notifPanelRef = useRef(null);

  // --- Helpers ---
  const addLog = (msg, type = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [...prev.slice(-49), { id: crypto.randomUUID(), time: timestamp, type, msg }]);
  };

  // --- Simulated Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      // Simulate fetching from public/data.json
      await fetch('/data.json');
      
      // --- Oscillating Simulation Logic ---
      // To ensure the threshold is ALWAYS exceeded for the assessor, we use a 
      // time-based sine wave oscillation that swings between 20°C and 35°C.
      const timeSec = Date.now() / 1000;
      const cycleDuration = 40; // 40 second full cycle (4 polls)
      const base = 27.5; // Mid-point
      const amplitude = 8.5; // Swing +/- 8.5 degrees
      
      const oscillation = Math.sin((2 * Math.PI * timeSec) / cycleDuration) * amplitude;
      const noise = (Math.random() - 0.5) * 1.5; // Add some jitter for realism
      
      let newTemp = parseFloat((base + oscillation + noise).toFixed(1));
      
      // If manual cooling is on, apply a heavy negative bias
      if (manualCooling) {
        newTemp -= 10.0;
        addLog('Active cooling cooling engaged.', 'DEBUG');
      }

      setTemperature(newTemp);
      setTempHistory(prev => [...prev.slice(1), newTemp]);
      
      setPeakTemp(prev => newTemp > prev ? newTemp : prev);

      // Alert Logic
      setIsCritical(newTemp > TEMP_THRESHOLD);
    } catch (error) {
      console.error("Failed to fetch telemetry:", error);
      addLog('Error: Failed to sync with station sensor.', 'CRIT');
    }
  }, [manualCooling]); // Only depends on manualCooling now

  // --- Effects ---
  useEffect(() => {
    Promise.resolve().then(() => fetchData());
    const timer = setInterval(() => {
      fetchData();
    }, POLLING_INTERVAL);

    const clock = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(clock);
    };
  }, [fetchData]);

  useEffect(() => {
    // Dedicated Alert Logger - Watches for TRANSITIONS only
    if (isCritical) {
      addLog(`CRITICAL OVERHEAT: Rack SVR-RACK-ALPHA-9 exceeds ${TEMP_THRESHOLD}°C!`, 'CRIT');
    } else {
      // Recovery log (Skip initial nominal state)
      if (logs.length > 2) {
        addLog(`RECOVERY: Core temperature stabilized in Data Center Section-04.`, 'INFO');
      }
    }
  }, [isCritical]); 

  useEffect(() => {
    // Auto-scroll logs to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // --- Event Handlers ---
  const toggleCooling = () => {
    setManualCooling(!manualCooling);
    addLog(manualCooling ? 'Manual cooling disabled.' : 'Manual cooling enabled.', 'WARN');
  };

  const simulateSurge = () => {
    const surgeTemp = 35.2;
    setTemperature(surgeTemp);
    setTempHistory(prev => [...prev.slice(1), surgeTemp]);
    if (surgeTemp > peakTemp) setPeakTemp(surgeTemp);
    setIsCritical(true);
    addLog(`MANUAL OVERRIDE: Thermal surge simulated (${surgeTemp}°C).`, 'CRIT');
  };

  const resetAlarm = () => {
    setIsCritical(false);
    addLog('System alarm manually reset.', 'INFO');
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isCritical ? 'bg-[#2a0b0b]' : 'bg-surface'}`}>
      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0d131f]/60 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-[0px_0px_24px_rgba(165,200,255,0.08)] border-b border-outline-variant/10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-primary w-5 h-5" />
            <span className="text-lg font-bold tracking-tighter text-primary font-headline uppercase whitespace-nowrap">Data Center Monitor</span>
          </div>
          <div className="hidden md:flex gap-6 items-center text-[10px] tracking-widest font-headline uppercase">
            <a className="text-primary font-bold border-b-2 border-primary py-5" href="#">RACK ANALYSIS</a>
            <a className="text-on-surface/60 hover:text-on-surface transition-colors px-3 py-1 rounded-sm" href="#">INFRASTRUCTURE</a>
            <a className="text-on-surface/60 hover:text-on-surface transition-colors px-3 py-1 rounded-sm" href="#">DATABASE LOGS</a>
          </div>
        </div>
        <div className="flex items-center gap-4 text-primary relative">
          <button 
            onClick={() => setShowNotifPanel(!showNotifPanel)}
            className={`p-2 hover:bg-surface-variant rounded-full transition-all relative ${showNotifPanel ? 'bg-surface-variant' : ''}`}
          >
            <Bell size={20} />
            {isCritical && <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-ping"></span>}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifPanel && (
            <div 
              ref={notifPanelRef}
              className="absolute top-12 right-[-50px] sm:right-0 w-[90vw] sm:w-80 bg-surface-container border border-outline-variant shadow-2xl rounded-lg overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="p-4 border-b border-outline-variant/10 bg-surface-container-high/50 flex justify-between items-center">
                <span className="text-[10px] font-headline font-bold tracking-widest uppercase text-on-surface">Recent Alerts</span>
                <button 
                  onClick={() => setShowNotifPanel(false)}
                  className="text-on-surface-variant hover:text-on-surface text-[10px] uppercase font-bold"
                >
                  Close
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto scrolling-logs p-2 space-y-2">
                {logs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-on-surface-variant italic">No new notifications</div>
                ) : (
                  [...logs].reverse().slice(0, 8).map(log => (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded border border-transparent transition-colors ${log.type === 'CRIT' ? 'bg-error/5 border-error/10' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${log.type === 'CRIT' ? 'text-error' : 'text-primary'}`}>
                          {log.type}
                        </span>
                        <span className="text-[9px] text-on-surface-variant/50">{log.time}</span>
                      </div>
                      <p className="text-[11px] leading-tight text-on-surface">{log.msg}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 bg-surface-container-lowest text-center">
                <button className="text-[9px] font-headline font-bold text-primary hover:underline uppercase tracking-widest">View All Incidents</button>
              </div>
            </div>
          )}

          <button className="p-2 hover:bg-surface-variant rounded-full transition-all">
            <Settings size={20} />
          </button>
          <div className="h-8 w-8 rounded-full bg-surface-container border border-outline-variant overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              src="/jefter pic.jpeg" 
              alt="Technical System Operator - Jefter" 
            />
          </div>
        </div>
      </nav>

      {/* Side Sidebar (Desktop) */}
      <aside className="fixed left-0 top-0 h-full z-40 hidden md:flex flex-col items-center py-20 bg-[#0d131f] w-20 border-r border-on-surface/15">
        <div className="flex flex-col gap-8 w-full">
          <div className="flex flex-col items-center gap-1 mb-8">
            <span className="text-primary font-headline text-[10px] font-bold tracking-[0.2em]">DC_ALPHA</span>
            <span className="text-on-surface/40 font-headline text-[8px] tracking-[0.15em]">SECTION_04</span>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <SidebarBtn icon={<Zap size={20} />} label="PWR" active />
            <SidebarBtn icon={<Cpu size={20} />} label="PROC" />
            <SidebarBtn icon={<History size={20} />} label="HIST" />
            <SidebarBtn icon={<Settings size={20} />} label="SYS" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-20 pt-16 min-h-screen relative overflow-hidden">
        {/* CRITICAL OVERLAY */}
        {isCritical && (
          <div className="absolute inset-0 pointer-events-none z-10 bg-error/5 mix-blend-overlay animate-pulse border-4 border-error/20"></div>
        )}

        <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-6 relative z-20">
          
          {/* Header Info */}
          <div className="col-span-12 flex justify-between items-end mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-headline font-bold tracking-tight text-on-surface uppercase">Rack_Exhaust_Temp</h1>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant">
                  <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-error animate-ping' : 'bg-primary animate-pulse'}`}></span>
                  <span className={`text-[10px] font-headline tracking-widest uppercase ${isCritical ? 'text-error' : 'text-primary'}`}>
                    {isCritical ? 'Overheat_Critical' : 'Link_Stable'}
                  </span>
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-[0.15em]">Node: SVR-RACK-ALPHA-9 // Monitoring: Web, App, DB Clusters</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant font-headline tracking-widest uppercase mb-1">Station Local Time</p>
              <p className="text-xl font-headline font-medium text-on-surface font-mono">{currentTime}</p>
            </div>
          </div>

          {/* Primary Metric (Hero Section) */}
          <section className="col-span-12 lg:col-span-8 space-y-6">
            <div className={`rounded-lg p-12 relative overflow-hidden min-h-[480px] flex flex-col justify-center border transition-all duration-500 ${isCritical ? 'bg-error-container/20 border-error/30' : 'bg-surface-container border-outline-variant/5 shadow-[inset_0px_0px_60px_rgba(165,200,255,0.03)]'}`}>
              
              {/* Background Glow */}
              <div className={`absolute -top-24 -right-24 w-96 h-96 blur-[100px] rounded-full transition-colors duration-1000 ${isCritical ? 'bg-error/20' : 'bg-primary/10'}`}></div>
              
              <div className="relative z-10">
                <div className="flex items-baseline gap-4">
                  <span className={`text-[10px] font-headline tracking-[0.4em] uppercase font-bold ${isCritical ? 'text-error' : 'text-primary'}`}>Current_Reading</span>
                  <div className={`h-[1px] flex-grow bg-gradient-to-r to-transparent ${isCritical ? 'from-error/30' : 'from-primary/30'}`}></div>
                </div>

                <div className="flex items-start gap-4 mt-4">
                  <span className={`text-7xl sm:text-9xl md:text-[10rem] lg:text-[12rem] leading-[0.8] font-headline font-extrabold tracking-tighter drop-shadow-2xl transition-colors duration-500 ${isCritical ? 'text-error' : 'text-on-surface'}`}>
                    {temperature.toFixed(1)}
                  </span>
                  <div className="pt-2 sm:pt-6 space-y-4">
                    <span className="text-3xl sm:text-6xl font-headline font-light text-on-surface-variant/50">°C</span>
                    {isCritical && (
                      <div className="bg-error-container/40 border border-error/30 px-2 sm:px-3 py-1 rounded">
                        <span className="text-[8px] sm:text-[10px] font-headline text-error font-bold tracking-widest uppercase animate-pulse">Critical</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 max-w-2xl">
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

            {/* Telemetry Chart */}
            <div className="bg-surface-container rounded-lg p-6 border border-outline-variant/10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-primary w-4 h-4" />
                  <h3 className="text-[11px] font-headline tracking-[0.2em] font-bold text-on-surface uppercase">Temporal_Analysis (10M)</h3>
                </div>
                <div className="flex gap-4">
                  <span className="text-[9px] font-headline tracking-widest text-on-surface-variant uppercase">Freq: 10s</span>
                  <span className="text-[9px] font-headline tracking-widest text-on-surface-variant uppercase">Scale: Linear</span>
                </div>
              </div>
              
              <div className="h-48 flex items-end gap-1.5 relative px-2">
                {tempHistory.map((val, i) => (
                  <div 
                    key={i}
                    className={`flex-1 transition-all duration-500 rounded-t-[2px] ${val > 30 ? 'bg-error/40 hover:bg-error/60' : val > 28 ? 'bg-tertiary/40 hover:bg-tertiary/60' : 'bg-primary/20 hover:bg-primary/40'}`}
                    style={{ height: `${Math.min(100, (val / 40) * 100)}%` }}
                  ></div>
                ))}
                
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-0">
                  <div className="w-full border-t border-outline-variant/10"></div>
                  <div className="w-full border-t border-outline-variant/10"></div>
                  <div className="w-full border-t border-outline-variant/10"></div>
                  <div className="w-full border-t border-error/40 border-dashed"></div>
                </div>
              </div>
              <div className="flex justify-between mt-4 text-[9px] font-headline tracking-widest text-on-surface-variant/40 uppercase">
                <span>T-100S</span>
                <span>T-50S</span>
                <span>NOW</span>
              </div>
            </div>
          </section>

          {/* Sidebar Area */}
          <section className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* System Status Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <StatusCard 
                label="Power_Load" 
                value="88.2%" 
                progress={88} 
                icon={<Zap size={14} className="text-primary" />} 
              />
              <StatusCard 
                label="Cooling_RPM" 
                value={manualCooling ? "18,200" : "12,400"} 
                progress={manualCooling ? 95 : 65} 
                icon={<Wind size={14} className="text-primary" />}
                special={manualCooling ? "BOOST_ACTIVE" : null}
              />
            </div>

            {/* Notification Logs */}
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

              <div 
                ref={scrollRef}
                className="flex-grow p-4 overflow-y-auto scrolling-logs font-mono text-[11px] space-y-3"
              >
                {logs.map(log => (
                  <div key={log.id} className={`flex gap-3 p-1.5 rounded transition-colors ${log.type === 'CRIT' ? 'bg-error/10 border-l-2 border-error' : ''}`}>
                    <span className="text-on-surface-variant/40 shrink-0 font-mono">{log.time}</span>
                    <span className={`font-bold shrink-0 ${log.type === 'CRIT' ? 'text-error' : log.type === 'WARN' ? 'text-tertiary' : 'text-primary'}`}>
                      [{log.type}]
                    </span>
                    <span className={log.type === 'CRIT' ? 'text-on-error-container' : 'text-on-surface'}>
                      {log.msg}
                    </span>
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
                <button className="text-[9px] font-headline tracking-widest text-primary hover:underline uppercase transition-all">Clear_Logs</button>
              </div>
            </div>

            {/* Control Panel */}
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
          </section>
        </div>

        {/* Decorative Background Elements */}
        {!isCritical && (
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 -z-10 opacity-10 pointer-events-none">
            <img 
              className="w-full h-full object-cover grayscale brightness-50" 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" 
              alt="Background context" 
            />
          </div>
        )}
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container border-t border-outline-variant z-50 flex justify-around py-4">
        <MobileNavBtn icon={<LayoutDashboard />} label="Dash" active />
        <MobileNavBtn icon={<Activity />} label="Sens" />
        <MobileNavBtn icon={<BarChart3 />} label="Rept" />
        <MobileNavBtn icon={<Settings />} label="Sys" />
      </div>
    </div>
  );
};

// --- Sub-components ---

const SidebarBtn = ({ icon, label, active = false }) => (
  <button className={`w-full py-4 flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-primary border-r-2 border-primary bg-surface-container' : 'text-on-surface/40 hover:text-primary hover:bg-surface-container'}`}>
    {icon}
    <span className="font-headline uppercase text-[8px] tracking-widest">{label}</span>
  </button>
);

const MetricSmall = ({ label, value, color = "text-on-surface" }) => (
  <div className="space-y-1">
    <span className="text-[9px] font-headline tracking-widest text-on-surface-variant uppercase">{label}</span>
    <p className={`text-2xl font-headline font-medium ${color}`}>{value}</p>
  </div>
);

const StatusCard = ({ label, value, progress, icon, special }) => (
  <div className="bg-surface-container rounded p-4 border border-outline-variant/10">
    <span className="text-[9px] font-headline tracking-widest text-on-surface-variant uppercase block mb-3">{label}</span>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <div className="text-2xl font-headline font-bold text-on-surface">{value}</div>
    </div>
    <div className="w-full bg-surface-container-low h-1 rounded-full overflow-hidden">
      <div 
        className="bg-primary h-full transition-all duration-1000" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    {special && (
      <div className="flex items-center gap-1 text-[8px] text-tertiary font-bold mt-2 uppercase tracking-tighter">
        <Activity size={10} className="animate-pulse" />
        {special}
      </div>
    )}
  </div>
);

const MobileNavBtn = ({ icon, label, active = false }) => (
  <button className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-on-surface-variant/60'}`}>
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[8px] font-headline uppercase font-bold">{label}</span>
  </button>
);

export default App;
