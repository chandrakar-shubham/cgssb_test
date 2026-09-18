import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, selectedRole, name || (selectedRole === 'admin' ? 'Super Admin' : 'CG Candidate'));
    onClose();
  };

  const handleQuickDemo = (role: UserRole) => {
    if (role === 'student') {
      login('rameshwar@cgssbtest.com', 'student', 'Rameshwar Dewangan');
    } else {
      login('admin@cgssbtest.com', 'admin', 'Exam Authority Admin');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm">
              CG
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">
                CGSSB <span className="text-emerald-400">Test</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                cgssbtest.com Portal Access
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 bg-slate-800 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Role Selection Tabs */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition ${
                selectedRole === 'student'
                  ? 'bg-emerald-500 text-slate-950 shadow font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student / Aspirant</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition ${
                selectedRole === 'admin'
                  ? 'bg-emerald-500 text-slate-950 shadow font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Exam Admin</span>
            </button>
          </div>
        </div>

        {/* Quick 1-Click Demo Buttons */}
        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/60 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Quick 1-Click Sandbox Login
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo('student')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-emerald-500/20 text-emerald-400 border border-slate-600 hover:border-emerald-500/40 text-[11px] font-bold transition text-left truncate"
            >
              Demo Student (350 Cr.)
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-emerald-500/20 text-emerald-400 border border-slate-600 hover:border-emerald-500/40 text-[11px] font-bold transition text-left truncate"
            >
              Demo Admin (CRUD)
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {activeTab === 'signup' && (
            <div>
              <label className="block text-slate-300 font-bold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Rameshwar Dewangan"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5"
            >
              <span>{activeTab === 'login' ? 'Sign In to Portal' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="text-center text-[11px] text-slate-400 pt-1">
          {activeTab === 'login' ? (
            <p>
              New candidate?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className="text-emerald-400 font-bold hover:underline"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-emerald-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
