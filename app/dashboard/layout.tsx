'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { 
  Home, FileText, ClipboardList, MessageSquare, Settings, 
  Bell, LogOut, ChevronDown, User, Sparkles, SwitchCamera, ListOrdered, PlusCircle,
  Menu, X, ChevronRight
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, logout, switchRole, notifications, markNotificationRead } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.is_read);

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
    setShowNotifications(false);
  }, [pathname]);

  // Close notifications on click outside
  useEffect(() => {
    if (!showNotifications) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notification-panel]')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showNotifications]);

  // Redirect if guest (in mock mode we simulate session)
  // Serta proteksi rute RBAC untuk admin dan pelanggan biasa
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      router.push('/dashboard/user');
    }
    if (pathname.startsWith('/dashboard/user') && role === 'admin') {
      router.push('/dashboard/admin');
    }
  }, [user, role, pathname, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg animate-pulse-glow">
            F
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const userMenu = [
    { label: 'Overview', href: '/dashboard/user', icon: Home },
    { label: 'Buat Order', href: '/dashboard/user/order', icon: PlusCircle },
    { label: 'Pesanan Saya', href: '/dashboard/user/order/list', icon: ClipboardList },
    { label: 'Forum Komunitas', href: '/forum', icon: MessageSquare },
  ];

  const adminMenu = [
    { label: 'Overview', href: '/dashboard/admin', icon: Home },
    { label: 'Antrean Kerja', href: '/dashboard/admin/queue', icon: ListOrdered },
    { label: 'Forum Moderasi', href: '/forum', icon: MessageSquare },
  ];

  const menuItems = role === 'admin' ? adminMenu : userMenu;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-full md:h-screen w-72 md:w-64 
        bg-white border-r border-slate-200/80 
        flex flex-col justify-between shrink-0 z-50
        transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Logo */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="group">
              <Logo size="sm" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-bold border border-blue-100">
                {role === 'admin' ? 'Admin' : 'Pelanggan'}
              </span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
                  {item.label}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Card */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold uppercase shrink-0 text-sm">
                {user.full_name.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <h6 className="text-xs font-bold text-slate-800 truncate leading-none mb-1">
                  {user.full_name}
                </h6>
                <span className="text-[10px] text-slate-400 font-medium truncate block">
                  {user.phone || 'No Phone'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="text-slate-400 hover:text-red-500 shrink-0 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {role === 'admin' ? 'Dashboard Admin' : 'Dashboard Pelanggan'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Notification Bell Dropdown */}
            <div className="relative" data-notification-panel>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white text-white text-[8px] font-bold flex items-center justify-center badge-bounce">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-scale-in">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Notifikasi</span>
                    {unreadNotifs.length > 0 && (
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {unreadNotifs.length} Baru
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-medium">Tidak ada notifikasi.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notif, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.link_url) router.push(notif.link_url);
                            setShowNotifications(false);
                          }}
                          className={`p-3 text-left cursor-pointer transition-colors hover:bg-slate-50 ${
                            !notif.is_read ? 'bg-blue-50/35' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!notif.is_read && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                            )}
                            <div className="min-w-0 flex-1">
                              <h6 className="text-xs font-bold text-slate-800 mb-0.5">{notif.title}</h6>
                              <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">{notif.message}</p>
                              <span className="text-[8px] text-slate-400 block mt-1.5">
                                {new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase border border-blue-200">
              {user.full_name.substring(0, 2)}
            </div>

          </div>
        </header>

        {/* Child Views */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto flex flex-col justify-between">
          <div className="animate-fade-in">
            {children}
          </div>

          {/* Footer Dashboard */}
          <footer className="mt-12 border-t border-slate-200/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-semibold">
            <span>© {new Date().getFullYear()} FlashWork. Hak Cipta Dilindungi.</span>
            <div className="flex items-center gap-4">
              <Link href="/forum" className="hover:text-blue-600 transition-colors">Forum Komunitas</Link>

            </div>
          </footer>
        </main>
      </div>

    </div>
  );
}
