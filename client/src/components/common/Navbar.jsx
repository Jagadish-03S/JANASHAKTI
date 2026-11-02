import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import RoleBadge from './RoleBadge';
import {
  Shield,
  Menu,
  X,
  User,
  LogOut,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Info,
  MapPin,
  Bell,
  Map,
} from 'lucide-react';
import { ROLES } from '../../utils/constants';

export default function Navbar({ currentView, setCurrentView }) {
  const { user, logout, switchDemoRole, demoAccounts, toast, setToast } = useAuth();
  const { socket } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load and listen for notifications
  useEffect(() => {
    if (user) {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('janashakti_token')}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(data.data);
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {});
    }

    if (socket) {
      socket.on('notification:proximity_alert', (alert) => {
        setNotifications(prev => [
          {
            id: `notif-${Date.now()}`,
            title: alert.title,
            message: alert.message,
            createdAt: new Date(),
            isRead: false,
          },
          ...prev,
        ]);
        setUnreadCount(c => c + 1);
      });
    }

    return () => {
      if (socket) {
        socket.off('notification:proximity_alert');
      }
    };
  }, [user, socket]);

  const handleNav = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' :
          toast.type === 'error' ? 'bg-rose-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {toast.type === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
          {toast.type === 'info' && <Info className="w-3.5 h-3.5" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">JANASHAKTI</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold font-mono">
                  ಜನಶಕ್ತಿ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Davanagere Civic Safety Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNav('landing')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'landing' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Public Feed
            </button>
            <button
              onClick={() => handleNav('citizen')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'citizen' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Citizen Portal
            </button>
            <button
              onClick={() => handleNav('map')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'map' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-teal-600" />
              Live Ward Map
            </button>
            <button
              onClick={() => handleNav('authority')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'authority' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Authority Command
            </button>
            <button
              onClick={() => handleNav('architecture')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'architecture' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Blueprint
            </button>
          </nav>

          {/* Right Area: Notification Bell, RBAC Switcher & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Bell (Phase 9) */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                title="Civic & Proximity Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 space-y-2">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Davanagere Civic Alerts</span>
                    <span className="text-[10px] text-teal-600 font-semibold font-mono">FCM Live Adapter</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No active proximity alerts in your ward.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 hover:bg-slate-50 text-xs space-y-1">
                          <span className="font-bold text-slate-900 block">{n.title}</span>
                          <p className="text-[11px] text-slate-600">{n.message}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-400">Role:</span>
                {user ? <RoleBadge role={user.role} /> : <span className="text-slate-600 font-bold">Guest</span>}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 space-y-1">
                  <div className="px-3.5 py-1.5 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Quick RBAC Switcher
                    </span>
                  </div>
                  {demoAccounts.map((account) => {
                    const isActive = user?.role === account.role;
                    return (
                      <button
                        key={account.role}
                        onClick={() => {
                          switchDemoRole(account.role);
                          setRoleDropdownOpen(false);
                          if (account.role === ROLES.AUTHORITY || account.role === ROLES.ADMIN) {
                            setCurrentView('authority');
                          } else {
                            setCurrentView('citizen');
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isActive ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="pr-2">
                          <div className="flex items-center gap-1.5">
                            <RoleBadge role={account.role} />
                            <span className="text-slate-800 font-semibold">{account.name.split(' ')[0]}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{account.description}</p>
                        </div>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profile or Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{user.fullName}</span>
                  <span className="text-[10px] text-slate-400">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center gap-2">
            {user && <RoleBadge role={user.role} />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <div className="space-y-1">
            <button
              onClick={() => handleNav('landing')}
              className="block w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Public Feed
            </button>
            <button
              onClick={() => handleNav('citizen')}
              className="block w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Citizen Portal
            </button>
            <button
              onClick={() => handleNav('map')}
              className="block w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Live Ward Map
            </button>
            <button
              onClick={() => handleNav('authority')}
              className="block w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Authority Command Center
            </button>
            <button
              onClick={() => handleNav('architecture')}
              className="block w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Blueprint & 10 Phases
            </button>
          </div>

          {user ? (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{user.fullName}</span>
                <span className="text-[10px] text-slate-400">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('login')}
              className="w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
}
