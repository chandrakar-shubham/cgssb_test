import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  FileText,
  BarChart3,
  Sparkles,
  Smartphone,
  Layers,
  ShieldCheck,
  GraduationCap,
  Zap,
  LogOut,
  LogIn,
  FolderTree,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAndroidModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAndroidModal,
  onOpenAuthModal,
}) => {
  const { user, switchRole, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const studentNav = [
    { id: 'tests', label: 'Mock Tests', icon: BookOpen },
    { id: 'pyp', label: 'PYP Archive', icon: FileText },
    { id: 'analytics', label: 'Analytics Hub', icon: BarChart3 },
  ];

  const adminNav = [
    { id: 'admin-questions', label: 'Question Bank', icon: FolderTree },
    { id: 'admin-pyp', label: 'PYP Manager', icon: FileText },
    { id: 'admin-ai', label: 'AI Mock Creator', icon: Sparkles },
    { id: 'tests', label: 'Live Catalog', icon: Layers },
  ];

  const navItems = user?.role === 'admin' ? adminNav : studentNav;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Identity - Clean & Non-clashing */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0 select-none py-1 group"
            onClick={() => {
              setActiveTab('tests');
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-lg tracking-wider group-hover:scale-105 transition-transform">
              CG
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                  CGSSB <span className="text-emerald-400">Test</span>
                </span>
                <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 mr-1 rounded-full bg-emerald-400 animate-pulse"></span>
                  cgssbtest.com
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:block leading-none mt-0.5">
                Chhattisgarh Exams & PYP Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links based on Role */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Android Connectivity Button */}
            <button
              onClick={onOpenAndroidModal}
              title="Connect Android Mobile App via REST API"
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-750 text-slate-300 border border-slate-700/80 hover:border-emerald-500/40 transition shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Android API</span>
            </button>

            {/* Credits Display (for Student) */}
            {user && user.role === 'student' && (
              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-700/40 text-emerald-300 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                <span>{user.credits} <span className="hidden md:inline font-normal text-slate-400">Pts</span></span>
              </div>
            )}

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => {
                  switchRole('student');
                  setActiveTab('tests');
                }}
                title="Switch to Student view"
                className={`px-2 py-1 rounded-md text-xs font-bold flex items-center space-x-1 transition ${
                  user?.role === 'student'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Student</span>
              </button>
              <button
                onClick={() => {
                  switchRole('admin');
                  setActiveTab('admin-pyp');
                }}
                title="Switch to Admin view"
                className={`px-2 py-1 rounded-md text-xs font-bold flex items-center space-x-1 transition ${
                  user?.role === 'admin'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>

            {/* User Session Action */}
            {user ? (
              <button
                onClick={logout}
                title="Logout session"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-2.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition flex items-center space-x-1 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden transition border border-slate-700/60"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs">
              <button
                onClick={() => {
                  onOpenAndroidModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-1.5 text-slate-400 hover:text-emerald-400 transition py-1"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Android API Configuration</span>
              </button>
              {user && user.role === 'student' && (
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                  <span>{user.credits} Credits</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Horizontal Quick Scroll Bar for tablets and mobile (always available for one-tap access) */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-800/80 space-x-2 text-xs scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold flex items-center space-x-1.5 transition shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
