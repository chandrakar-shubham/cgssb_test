import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  RefreshCw,
  Terminal,
  Download,
  Wifi,
  Database,
  ExternalLink
} from 'lucide-react';

interface AndroidConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidConnectModal: React.FC<AndroidConnectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentHost = window.location.origin;
  const apiBaseUrl = `${currentHost}/api`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const runLivePingTest = async () => {
    setPingStatus('testing');
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const end = performance.now();
      if (res.ok) {
        setPingStatus('success');
        setPingLatency(Math.round(end - start));
      } else {
        setPingStatus('failed');
      }
    } catch {
      setPingStatus('failed');
    }
  };

  const retrofitCode = `package com.cgssbtest.app.network

import retrofit2.Response
import retrofit2.http.*

interface CGSSBApiService {

    // 1. Candidate Authentication
    @POST("auth/login")
    suspend fun login(
        @Body credentials: LoginRequest
    ): Response<AuthResponse>

    // 2. Mock Test Catalog (filtered by category)
    @GET("tests")
    suspend fun getMockTests(
        @Query("category") category: String? = null
    ): Response<List<MockTestDto>>

    // 3. Complete Test with Questions for offline practice
    @GET("tests/{id}")
    suspend fun getTestDetails(
        @Path("id") testId: String
    ): Response<TestDetailResponse>

    // 4. Submit Candidate Responses & Negative Marking Calculation
    @POST("tests/{id}/submit")
    suspend fun submitTest(
        @Path("id") testId: String,
        @Body submission: TestSubmissionDto
    ): Response<TestAttemptResultDto>

    // 5. Previous Year Papers (PYP) Repository
    @GET("pyp")
    suspend fun getPreviousYearPapers(
        @Query("category") category: String? = null
    ): Response<List<PreviousYearPaperDto>>

    // 6. Full Offline Mobile DB Synchronization (Room DB / SQLite)
    @GET("android/sync")
    suspend fun syncAllMobileData(): Response<AndroidSyncPayload>
}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl my-8 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Android App Mobile Integration & REST API Hub
              </h2>
              <p className="text-xs text-slate-400">
                Connect Kotlin / Jetpack Compose Android client apps to the CGSSB Test backend.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1.5 bg-slate-800 rounded-xl"
          >
            ✕ Close
          </button>
        </div>

        {/* Live Connectivity Status Box */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Mobile REST API Base URL
            </span>
            <span className="font-mono text-emerald-400 font-bold text-sm block mt-0.5 select-all">
              {apiBaseUrl}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={runLivePingTest}
              disabled={pingStatus === 'testing'}
              className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold transition flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pingStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>Ping Server</span>
            </button>

            {pingStatus === 'success' && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Online ({pingLatency}ms)</span>
              </span>
            )}

            {pingStatus === 'failed' && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Mobile Endpoints Catalog Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exposed Mobile REST Endpoints for Android</span>
          </span>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-emerald-400 font-bold">GET /api/android/sync</span>
              <span className="text-slate-400 font-sans text-[11px]">Room DB / SQLite Full Cache</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-teal-400 font-bold">GET /api/tests?category=CGSSB</span>
              <span className="text-slate-400 font-sans text-[11px]">Mock Test Catalog Feed</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-teal-400 font-bold">GET /api/tests/:id</span>
              <span className="text-slate-400 font-sans text-[11px]">Exam Paper + Questions Bundle</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-amber-400 font-bold">POST /api/tests/:id/submit</span>
              <span className="text-slate-400 font-sans text-[11px]">Evaluate & Score Computation</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-teal-400 font-bold">GET /api/pyp</span>
              <span className="text-slate-400 font-sans text-[11px]">Previous Year Papers Repository</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-bold">POST /api/auth/login</span>
              <span className="text-slate-400 font-sans text-[11px]">Student JWT Token Acquisition</span>
            </div>
          </div>
        </div>

        {/* Android Kotlin Retrofit Code Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kotlin Retrofit Service Interface (Ready for Android Studio)</span>
            </span>

            <button
              onClick={() => copyToClipboard(retrofitCode, 'retrofit')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1 transition"
            >
              {copiedSection === 'retrofit' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Kotlin Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-48 scrollbar-none leading-relaxed">
            {retrofitCode}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
