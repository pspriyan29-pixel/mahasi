import React from 'react';
import type { Route } from "../App";
import { 
  Gamepad2, Zap, GraduationCap, Megaphone, Briefcase, 
  Paintbrush, Home, Accessibility, Heart, Leaf, 
  LayoutDashboard, MessageSquare, CreditCard, Search
} from 'lucide-react';

interface SidebarProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  onCmdK: () => void;
}

const MAIN_NAV: { icon: any; label: string; route: Route; badge?: string }[] = [
  { icon: <LayoutDashboard size={18} />, label: "Console Dashboard", route: "dashboard" },
  { icon: <MessageSquare size={18} />, label: "AI Playground", route: "chat" },
  { icon: <CreditCard size={18} />, label: "Billing & Plans", route: "pricing", badge: "PRO" },
];

const PILLARS_NAV: { icon: any; label: string; route: Route }[] = [
  { icon: <Gamepad2 size={16} />, label: "Game", route: "game" },
  { icon: <Zap size={16} />, label: "Produktivitas", route: "produktivitas" },
  { icon: <GraduationCap size={16} />, label: "Edukasi", route: "edukasi" },
  { icon: <Megaphone size={16} />, label: "Pemasaran", route: "pemasaran" },
  { icon: <Briefcase size={16} />, label: "Operasional", route: "operasional" },
  { icon: <Paintbrush size={16} />, label: "Hobi", route: "hobi" },
  { icon: <Home size={16} />, label: "Kehidupan", route: "kehidupan" },
  { icon: <Accessibility size={16} />, label: "Akses", route: "akses" },
  { icon: <Heart size={16} />, label: "Kesejahteraan", route: "kesejahteraan" },
  { icon: <Leaf size={16} />, label: "Keberlanjutan", route: "keberlanjutan" }
];

export default function Sidebar({ currentRoute, onNavigate, onCmdK }: SidebarProps) {
  return (
    <aside style={{
      position: "fixed",
      top: 0, left: 0,
      width: "260px", height: "100vh",
      background: "var(--bp-light-bg)",
      borderRight: "1px solid var(--bp-border-gray)",
      display: "flex", flexDirection: "column",
      zIndex: 50,
      overflowY: "auto",
    }} className="no-scrollbar">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => onNavigate('landing')}>
          <img src="/logo.png" alt="Neurova Logo" className="w-8 h-8 rounded-lg object-contain shadow-[0_0_15px_rgba(51,112,255,0.3)]" />
          <div>
            <div className="font-bold text-bp-deep-black leading-tight text-lg tracking-tight">Neurova</div>
            <div className="text-[10px] text-bp-medium-gray font-bold uppercase tracking-widest">Enterprise AI OS</div>
          </div>
        </div>

        {/* Search / Cmd+K */}
        <button
          onClick={onCmdK}
          className="w-full flex items-center gap-2 p-2 px-3 bg-white border border-bp-border-gray rounded-md hover:border-bp-electric-blue transition-colors text-bp-medium-gray text-sm text-left shadow-sm"
        >
          <Search size={16} />
          <span className="flex-1 font-medium">Quick Search...</span>
          <div className="flex gap-1">
            <kbd className="text-[10px] bg-bp-light-bg px-1.5 py-0.5 rounded border border-bp-border-gray font-mono font-bold">⌘</kbd>
            <kbd className="text-[10px] bg-bp-light-bg px-1.5 py-0.5 rounded border border-bp-border-gray font-mono font-bold">K</kbd>
          </div>
        </button>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-6">
        {/* Main Nav */}
        <div>
          <div className="text-[11px] font-bold text-bp-medium-gray uppercase tracking-widest mb-3 px-2">Core</div>
          <div className="flex flex-col gap-1">
            {MAIN_NAV.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm text-left ${isActive ? 'bg-blue-50 text-bp-electric-blue font-bold' : 'text-bp-deep-black hover:bg-white hover:text-bp-electric-blue font-medium'}`}
                >
                  <div className={isActive ? 'text-bp-electric-blue' : 'text-bp-medium-gray'}>{item.icon}</div>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-bp-electric-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pillars Nav */}
        <div>
          <div className="text-[11px] font-bold text-bp-medium-gray uppercase tracking-widest mb-3 px-2">10 Pilar Fungsional</div>
          <div className="flex flex-col gap-1">
            {PILLARS_NAV.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm text-left ${isActive ? 'bg-blue-50 text-bp-electric-blue font-bold' : 'text-bp-deep-black hover:bg-white hover:text-bp-electric-blue font-medium'}`}
                >
                  <div className={isActive ? 'text-bp-electric-blue' : 'text-bp-medium-gray'}>{item.icon}</div>
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 mt-4">
        <div className="flex items-center gap-3 p-3 bg-white border border-bp-border-gray rounded-xl shadow-sm cursor-pointer hover:border-bp-electric-blue transition-colors">
          <div className="w-10 h-10 rounded-lg bg-bp-light-bg flex items-center justify-center font-bold text-bp-electric-blue shrink-0">
            US
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-bp-deep-black truncate">User Enterprise</div>
            <div className="text-xs text-bp-medium-gray">Free Tier</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
