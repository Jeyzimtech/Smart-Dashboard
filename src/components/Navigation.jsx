import React from 'react';
import { LayoutDashboard, Bell, Settings, Zap, Cpu, History } from 'lucide-react';

export const Navbar = ({ isCritical, showNotifPanel, toggleNotif }) => (
  <nav className="fixed top-0 w-full z-50 bg-[#0d131f]/60 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-outline-variant/10">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="text-primary w-5 h-5" />
        <span className="text-lg font-bold tracking-tighter text-primary font-headline uppercase whitespace-nowrap">IoT Temperature Ops Center</span>
      </div>
      <div className="hidden md:flex gap-6 items-center text-[10px] tracking-widest font-headline uppercase">
        <a className="text-primary font-bold border-b-2 border-primary py-5" href="#">RACK ANALYSIS</a>
        <a className="text-on-surface/60 hover:text-on-surface transition-colors px-3 py-1 rounded-sm" href="#">INFRASTRUCTURE</a>
      </div>
    </div>
    <div className="flex items-center gap-4 text-primary relative">
      <button 
        onClick={toggleNotif}
        className={`p-2 hover:bg-surface-variant rounded-full transition-all relative ${showNotifPanel ? 'bg-surface-variant' : ''}`}
      >
        <Bell size={20} />
        {isCritical && <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-ping"></span>}
      </button>
      <button className="p-2 hover:bg-surface-variant rounded-full transition-all">
        <Settings size={20} />
      </button>
      <div className="h-8 w-8 rounded-full bg-surface-container border border-outline-variant overflow-hidden">
        <img className="w-full h-full object-cover" src="/jefter pic.jpeg" alt="Operator" />
      </div>
    </div>
  </nav>
);

const SidebarBtn = ({ icon, label, active = false }) => (
  <button className={`w-full py-4 flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-primary border-r-2 border-primary bg-surface-container' : 'text-on-surface/40 hover:text-primary hover:bg-surface-container'}`}>
    {icon}
    <span className="font-headline uppercase text-[8px] tracking-widest">{label}</span>
  </button>
);

export const Sidebar = () => (
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
      </div>
    </div>
  </aside>
);
