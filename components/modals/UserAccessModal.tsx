'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Check, 
  BadgeCheck,
  GraduationCap,
  HelpCircle,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { supabase } from '../../lib/supabase/client';
import { updateProfileRole } from '../../lib/supabase/services';

interface UserAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserAccessModal({ isOpen, onClose }: UserAccessModalProps) {
  const { 
    userRole, 
    setUserRole, 
    hoverHelpSettings, 
    setHoverHelpSettings, 
    profile, 
    setProfile 
  } = useSimulationStore();

  const [activeTab, setActiveTab] = useState<'role' | 'auth'>('role');
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [org, setOrg] = useState(profile.organization);

  // Supabase Auth State
  const [authUser, setAuthUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Check Supabase session on open
  useEffect(() => {
    if (!isOpen) return;
    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user || null);
      if (data.user?.email) {
        setEmail(data.user.email);
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = async () => {
    setProfile({ name, role, organization: org });
    await updateProfileRole(userRole);
    onClose();
  };

  const handleRoleChange = async (newRole: 'beginner' | 'researcher') => {
    setUserRole(newRole);
    await updateProfileRole(newRole);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (!password.trim() && authMode !== 'reset')) {
      setAuthMessage({ text: 'Please enter all required fields.', isError: true });
      return;
    }

    setAuthLoading(true);
    setAuthMessage(null);

    try {
      if (authMode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthUser(data.user);
        setAuthMessage({ text: 'Successfully authenticated with Supabase!', isError: false });
        if (data.user?.user_metadata?.full_name) {
          setName(data.user.user_metadata.full_name);
        }
      } else if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || 'Aerospace Explorer',
              experience_role: userRole,
              organization: org,
            },
          },
        });
        if (error) throw error;
        setAuthUser(data.user);
        setAuthMessage({
          text: data.session ? 'Account created and signed in!' : 'Verification email sent. Please check your inbox.',
          isError: false,
        });
      } else if (authMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setAuthMessage({ text: 'Password reset link sent to your email.', isError: false });
      }
    } catch (err: any) {
      setAuthMessage({ text: err.message || 'Authentication failed', isError: true });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      await supabase.auth.signOut();
      setAuthUser(null);
      setAuthMessage({ text: 'Signed out successfully.', isError: false });
    } finally {
      setAuthLoading(false);
    }
  };

  const researchers = [
    {
      name: 'Alex Rivera',
      role: 'Beginner Aerospace Student / Explorer',
      org: 'Space Academy Training Facility',
      badge: 'CADET-EDU-1049',
      targetRole: 'beginner' as const,
    },
    {
      name: 'Dr. Elena Vance',
      role: 'Senior Microgravity Combustion Scientist',
      org: 'NASA Glenn Research Center / ZARM',
      badge: 'NASA-GRC-7742-RES',
      targetRole: 'researcher' as const,
    },
    {
      name: 'Prof. Marcus Thorne',
      role: 'Principal Investigator - Droplet Physics',
      org: 'European Space Agency (ESA) ESTEC',
      badge: 'ESA-ESTEC-4190-PI',
      targetRole: 'researcher' as const,
    },
    {
      name: 'Dr. Ayesha Patel',
      role: 'Reacting Flows & CFD Specialist',
      org: 'JAXA / Institute of Space and Astronautical Science',
      badge: 'JAXA-ISAS-9811-RES',
      targetRole: 'researcher' as const,
    },
  ];

  const handleSelectPresetProfile = (r: typeof researchers[0]) => {
    setName(r.name);
    setRole(r.role);
    setOrg(r.org);
    setUserRole(r.targetRole);
    setProfile({
      name: r.name,
      role: r.role,
      organization: r.org,
      badgeId: r.badge,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#0D2554] border border-[#2694EE]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Navigation Tabs */}
        <div className="p-4 bg-[#0A1D44] border-b border-[#1B64DD]/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#2694EE]" />
              <h2 className="text-base font-bold text-[#D9E0EE]">
                Researcher Access & Supabase Authentication
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#164E9E]/40 text-[#A7B1D2] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#070F21]/80 p-1 rounded-lg border border-[#1B64DD]/30 text-xs font-mono">
            <button
              onClick={() => setActiveTab('role')}
              className={`py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'role'
                  ? 'bg-[#1B64DD] text-white shadow-[0_0_10px_rgba(38,148,238,0.5)]'
                  : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Role & Help Controls</span>
            </button>
            <button
              onClick={() => setActiveTab('auth')}
              className={`py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'auth'
                  ? 'bg-[#16A34A] text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]'
                  : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {authUser ? 'Cloud Session (Active)' : 'Supabase Auth'}
              </span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          {activeTab === 'role' ? (
            <>
              {/* Role & Access Tier Switcher */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-[#A7B1D2] uppercase font-bold tracking-wider block">
                    User Role & Experience Mode
                  </label>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#2694EE]/20 text-[#2694EE] border border-[#2694EE]/30 uppercase font-bold">
                    {userRole === 'beginner' ? 'Beginner Mode Active' : 'Researcher Mode Active'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleRoleChange('beginner')}
                    className={`p-3 rounded-xl border text-left transition ${
                      userRole === 'beginner'
                        ? 'bg-[#16A34A]/20 border-[#16A34A] shadow-[0_0_15px_rgba(22,163,74,0.3)]'
                        : 'bg-[#070F21]/60 border-[#1B64DD]/30 text-[#A7B1D2] hover:bg-[#164E9E]/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#D9E0EE] flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-[#16A34A]" />
                        Beginner / Student
                      </span>
                      {userRole === 'beginner' && <Check className="w-3.5 h-3.5 text-[#16A34A]" />}
                    </div>
                    <p className="text-[11px] text-[#A7B1D2] leading-tight">
                      Auto-enables Smart Hover Guide, simplified analogies, step-by-step experiment wizard.
                    </p>
                  </button>

                  <button
                    onClick={() => handleRoleChange('researcher')}
                    className={`p-3 rounded-xl border text-left transition ${
                      userRole === 'researcher'
                        ? 'bg-[#1B64DD]/25 border-[#2694EE] shadow-[0_0_15px_rgba(38,148,238,0.3)]'
                        : 'bg-[#070F21]/60 border-[#1B64DD]/30 text-[#A7B1D2] hover:bg-[#164E9E]/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#D9E0EE] flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-[#2694EE]" />
                        NASA Researcher
                      </span>
                      {userRole === 'researcher' && <Check className="w-3.5 h-3.5 text-[#2694EE]" />}
                    </div>
                    <p className="text-[11px] text-[#A7B1D2] leading-tight">
                      Clean unhindered interface, raw telemetry, no beginner cards, advanced kinetics & CFD.
                    </p>
                  </button>
                </div>
              </div>

              {/* Beginner Help & Hover Guide Configuration */}
              <div className="p-3.5 rounded-xl bg-[#070F21]/80 border border-[#2694EE]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#D9E0EE] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#F79628]" />
                    Smart Hover Guide & Beginner Assistance
                  </span>
                  <span className="text-[9px] font-mono text-[#A7B1D2]">
                    {hoverHelpSettings.smartHoverGuide ? 'ENABLED' : 'MUTED'}
                  </span>
                </div>
                <p className="text-[10px] text-[#A7B1D2] leading-relaxed">
                  When enabled, moving your mouse over any button, slider, nozzle, or metric displays a 4-part explanation card (What is this, How to use it, What happens if changed, Scientific Note).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#0D2554] transition">
                    <input
                      type="checkbox"
                      checked={hoverHelpSettings.smartHoverGuide}
                      onChange={(e) => setHoverHelpSettings({ smartHoverGuide: e.target.checked, enabled: e.target.checked })}
                      className="rounded border-[#1B64DD] text-[#2694EE] focus:ring-0 accent-[#2694EE]"
                    />
                    <span className="text-[#D9E0EE]">Smart Hover Guide</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#0D2554] transition">
                    <input
                      type="checkbox"
                      checked={hoverHelpSettings.detailedExplanations}
                      onChange={(e) => setHoverHelpSettings({ detailedExplanations: e.target.checked })}
                      className="rounded border-[#1B64DD] text-[#2694EE] focus:ring-0 accent-[#2694EE]"
                    />
                    <span className="text-[#D9E0EE]">Detailed Explanations</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#0D2554] transition">
                    <input
                      type="checkbox"
                      checked={hoverHelpSettings.scientificNotes}
                      onChange={(e) => setHoverHelpSettings({ scientificNotes: e.target.checked })}
                      className="rounded border-[#1B64DD] text-[#2694EE] focus:ring-0 accent-[#2694EE]"
                    />
                    <span className="text-[#D9E0EE]">Scientific Notes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#0D2554] transition">
                    <input
                      type="checkbox"
                      checked={hoverHelpSettings.explainMoreEnabled}
                      onChange={(e) => setHoverHelpSettings({ explainMoreEnabled: e.target.checked })}
                      className="rounded border-[#1B64DD] text-[#2694EE] focus:ring-0 accent-[#2694EE]"
                    />
                    <span className="text-[#D9E0EE]">Explain More via AI Bot</span>
                  </label>
                </div>
              </div>

              {/* Quick Select Preset Profiles */}
              <div>
                <label className="text-[10px] text-[#A7B1D2] uppercase font-bold tracking-wider block mb-2">
                  Select Verified Scientist Profile
                </label>
                <div className="space-y-2">
                  {researchers.map((r) => (
                    <button
                      key={r.name}
                      onClick={() => handleSelectPresetProfile(r)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                        profile.name === r.name
                          ? 'bg-[#1B64DD]/20 border-[#2694EE] text-white'
                          : 'bg-[#070F21]/50 border-[#1B64DD]/30 text-[#A7B1D2] hover:bg-[#164E9E]/20'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[#D9E0EE]">{r.name}</div>
                        <div className="text-[11px] text-[#2694EE]">{r.role} • {r.org}</div>
                      </div>
                      <span className="font-mono text-[10px] text-[#A7B1D2]">{r.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Editor */}
              <div className="space-y-3 p-3.5 rounded-xl bg-[#070F21]/70 border border-[#1B64DD]/30">
                <h3 className="font-bold text-[#D9E0EE] text-xs">Edit Researcher Metadata</h3>

                <div>
                  <label className="text-[10px] text-[#A7B1D2] block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0A1B3B] border border-[#1B64DD]/50 rounded px-2.5 py-1.5 text-xs text-[#D9E0EE]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A7B1D2] block mb-1">Academic Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#0A1B3B] border border-[#1B64DD]/50 rounded px-2.5 py-1.5 text-xs text-[#D9E0EE]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A7B1D2] block mb-1">Affiliated Organization / Facility</label>
                  <input
                    type="text"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full bg-[#0A1B3B] border border-[#1B64DD]/50 rounded px-2.5 py-1.5 text-xs text-[#D9E0EE]"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Supabase Cloud Authentication Tab */
            <div className="space-y-4">
              {authUser ? (
                /* Authenticated User Session Card */
                <div className="p-4 rounded-xl bg-[#070F21]/80 border border-[#16A34A]/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1B64DD]/30 pb-2">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-[#16A34A]" />
                      <span className="font-bold text-[#D9E0EE] text-xs">Active Supabase Session</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 font-bold uppercase">
                      Authenticated
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-[#A7B1D2]">
                      <span>Account Email:</span>
                      <strong className="text-[#D9E0EE]">{authUser.email}</strong>
                    </div>
                    <div className="flex justify-between text-[#A7B1D2]">
                      <span>User ID (UUID):</span>
                      <span className="text-[10px] text-[#2694EE] truncate max-w-[200px]">{authUser.id}</span>
                    </div>
                    <div className="flex justify-between text-[#A7B1D2]">
                      <span>Active Role:</span>
                      <strong className="text-[#F79628] uppercase">{userRole}</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    disabled={authLoading}
                    className="w-full mt-3 py-2 rounded-lg bg-[#E8671C]/20 border border-[#E8671C] text-[#E8671C] font-bold text-xs uppercase hover:bg-[#E8671C]/30 transition flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{authLoading ? 'Signing Out...' : 'Sign Out of Cloud Session'}</span>
                  </button>
                </div>
              ) : (
                /* Supabase Authentication Forms */
                <div className="p-4 rounded-xl bg-[#070F21]/80 border border-[#1B64DD]/40 space-y-4">
                  {/* Mode Selector */}
                  <div className="grid grid-cols-3 gap-1 bg-[#0A1B3B] p-1 rounded-lg border border-[#1B64DD]/30 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('signin'); setAuthMessage(null); }}
                      className={`py-1 rounded font-bold transition ${
                        authMode === 'signin' ? 'bg-[#1B64DD] text-white shadow' : 'text-[#A7B1D2] hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('signup'); setAuthMessage(null); }}
                      className={`py-1 rounded font-bold transition ${
                        authMode === 'signup' ? 'bg-[#16A34A] text-white shadow' : 'text-[#A7B1D2] hover:text-white'
                      }`}
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('reset'); setAuthMessage(null); }}
                      className={`py-1 rounded font-bold transition ${
                        authMode === 'reset' ? 'bg-[#E8671C] text-white shadow' : 'text-[#A7B1D2] hover:text-white'
                      }`}
                    >
                      Reset Key
                    </button>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-3">
                    <div>
                      <label className="text-[10px] text-[#A7B1D2] block mb-1">Scientist / Student Email</label>
                      <div className="flex items-center gap-2 bg-[#0A1B3B] border border-[#1B64DD]/50 rounded px-2.5 py-1.5 text-xs text-[#D9E0EE]">
                        <Mail className="w-3.5 h-3.5 text-[#2694EE]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="researcher@nasa.gov"
                          className="bg-transparent border-none outline-none flex-1 text-xs"
                        />
                      </div>
                    </div>

                    {authMode !== 'reset' && (
                      <div>
                        <label className="text-[10px] text-[#A7B1D2] block mb-1">Access Password</label>
                        <div className="flex items-center gap-2 bg-[#0A1B3B] border border-[#1B64DD]/50 rounded px-2.5 py-1.5 text-xs text-[#D9E0EE]">
                          <KeyRound className="w-3.5 h-3.5 text-[#2694EE]" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="bg-transparent border-none outline-none flex-1 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {authMessage && (
                      <div className={`p-2.5 rounded text-xs flex items-center gap-1.5 ${
                        authMessage.isError
                          ? 'bg-[#E8671C]/20 border border-[#E8671C] text-[#E8671C]'
                          : 'bg-[#16A34A]/20 border border-[#16A34A] text-[#16A34A]'
                      }`}>
                        {authMessage.isError ? <ShieldAlert className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        <span>{authMessage.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-[#1B64DD] via-[#2694EE] to-[#16A34A] text-white font-bold text-xs uppercase hover:brightness-110 transition shadow flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>
                        {authLoading 
                          ? 'Processing Request...' 
                          : authMode === 'signin' 
                          ? 'Sign In to Supabase Cloud' 
                          : authMode === 'signup' 
                          ? 'Create Supabase Cloud Account' 
                          : 'Send Password Reset Link'}
                      </span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A1D44] border-t border-[#1B64DD]/30 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#070F21] border border-[#1B64DD]/40 text-[#D9E0EE] hover:bg-[#164E9E] transition text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            className="px-4 py-1.5 rounded-lg bg-[#2694EE] text-white hover:bg-[#1B64DD] transition text-xs font-bold shadow-[0_0_12px_rgba(38,148,238,0.4)]"
          >
            Save Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

