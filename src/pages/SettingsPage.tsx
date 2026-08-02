import React, { useState } from 'react';
import { Settings, Mail, Bell, Sparkles, Save, RotateCcw, Plus, Trash2, Key, Users, Upload, ShieldCheck, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { dbService } from '../services/DatabaseService';
import { SystemSettingsConfig, SeasonalEvent, UserAccount, UserSession, LanguageCode, CurrencyCode } from '../types';
import { translations } from '../i18n/translations';

interface SettingsPageProps {
  userSession: UserSession;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onUpdateSession: (updatedSession: UserSession) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userSession,
  currentLanguage,
  onLanguageChange,
  currentCurrency,
  onCurrencyChange,
  onUpdateSession
}) => {
  const t = translations[currentLanguage];
  const [settings, setSettings] = useState<SystemSettingsConfig>(dbService.getSettings());
  const [seasonalEvents, setSeasonalEvents] = useState<SeasonalEvent[]>(dbService.getSeasonalEvents());
  const [users, setUsers] = useState<UserAccount[]>(dbService.getUsers());
  const [isSaved, setIsSaved] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Avatar Options
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  ];

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    event: '',
    category: 'Biscuits' as any,
    start_date: '2026-10-01',
    end_date: '2026-10-30',
    demand_multiplier: 1.5
  });

  const isAdmin = userSession.role === 'Administrator';

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveSettings(settings);
    dbService.saveSeasonalEvents(seasonalEvents);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        dbService.updateUserProfile(userSession.username, { avatarUrl: base64 });
        onUpdateSession({ ...userSession, avatarUrl: base64 });
        setUsers(dbService.getUsers());
        setUserMsg({ type: 'success', text: 'Profile picture updated successfully!' });
        setTimeout(() => setUserMsg(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    dbService.updateUserProfile(userSession.username, { avatarUrl: url });
    onUpdateSession({ ...userSession, avatarUrl: url });
    setUsers(dbService.getUsers());
    setUserMsg({ type: 'success', text: 'Profile avatar updated!' });
    setTimeout(() => setUserMsg(null), 3000);
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    setUserMsg(null);
    if (!isAdmin) {
      setUserMsg({ type: 'error', text: 'Access Denied: Only Administrators are permitted to remove registered members.' });
      return;
    }

    if (usernameToDelete.toLowerCase() === userSession.username.toLowerCase()) {
      setUserMsg({ type: 'error', text: 'You cannot delete your own currently active account.' });
      return;
    }

    if (window.confirm(`Are you sure you want to delete member account '@${usernameToDelete}'?`)) {
      const result = dbService.deleteUser(usernameToDelete, userSession.role);
      if (result.success) {
        setUsers(dbService.getUsers());
        setUserMsg({ type: 'success', text: `Member '@${usernameToDelete}' has been deleted.` });
      } else {
        setUserMsg({ type: 'error', text: result.error || 'Failed to delete user.' });
      }
      setTimeout(() => setUserMsg(null), 4000);
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.event) return;
    const newId = seasonalEvents.length > 0 ? Math.max(...seasonalEvents.map(e => e.event_id)) + 1 : 1;
    const added = { ...newEvent, event_id: newId };
    const updated = [...seasonalEvents, added];
    setSeasonalEvents(updated);
    dbService.saveSeasonalEvents(updated);
    setNewEvent({ event: '', category: 'Biscuits', start_date: '2026-10-01', end_date: '2026-10-30', demand_multiplier: 1.5 });
  };

  const handleDeleteEvent = (id: number) => {
    const updated = seasonalEvents.filter(e => e.event_id !== id);
    setSeasonalEvents(updated);
    dbService.saveSeasonalEvents(updated);
  };

  const handleResetDatabase = () => {
    if (window.confirm('Reset database to initial ETS FOFANA CONFISERIE sample data & credentials?')) {
      dbService.resetToSeed();
      setSettings(dbService.getSettings());
      setSeasonalEvents(dbService.getSeasonalEvents());
      setUsers(dbService.getUsers());
      alert('Database reset to default seed!');
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Settings className="h-6 w-6 text-slate-400" />
            <span>{t.settings}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage Gemini API Key, SMTP Credentials, Profile Picture & Member Roles</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleResetDatabase}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-red-400 text-xs font-semibold border border-slate-700 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Seed</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          System settings saved successfully!
        </div>
      )}

      {userMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
            userMsg.type === 'error'
              ? 'bg-red-500/20 border-red-500/30 text-red-300'
              : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {userMsg.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
          <span>{userMsg.text}</span>
        </div>
      )}

      {/* User Profile Picture & Preferences Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-amber-400 font-bold text-sm">
          <Camera className="h-5 w-5" />
          <span>{t.profilePicture} & System Display Preferences</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Current Avatar Display */}
          <div className="flex flex-col items-center space-y-2 shrink-0">
            <div className="h-20 w-20 rounded-full bg-slate-900 border-2 border-amber-500/60 p-1 shadow-gold-glow relative overflow-hidden">
              {userSession.avatarUrl ? (
                <img src={userSession.avatarUrl} alt={userSession.fullName} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400 font-bold text-xl">
                  {userSession.fullName.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-slate-200">{userSession.fullName}</span>
            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {userSession.role}
            </span>
          </div>

          {/* Upload & Presets */}
          <div className="space-y-3 flex-1 text-xs">
            <div>
              <label className="font-bold text-slate-300 uppercase block mb-1">Custom Photo Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 uppercase block mb-1.5">Or Choose an Executive Preset Avatar:</label>
              <div className="flex items-center space-x-3">
                {avatarPresets.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(url)}
                    className="h-10 w-10 rounded-full border-2 border-slate-700 hover:border-amber-400 transition overflow-hidden shrink-0"
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Language & Currency Preferences */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">{t.languageSetting}</label>
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                >
                  <option value="en">{t.english}</option>
                  <option value="fr">{t.french}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">{t.currencySetting}</label>
                <select
                  value={currentCurrency}
                  onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold font-mono"
                >
                  <option value="USD">USD ($)</option>
                  <option value="FCFA">FCFA (XOF)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin-Only Registered Members Management Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm">
            <Users className="h-5 w-5" />
            <span>{t.registeredMembers}</span>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              isAdmin ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isAdmin ? 'Admin Management Active' : 'View Only Mode'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3">Manager</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Assigned Role</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-slate-800 overflow-hidden shrink-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-amber-400">
                          {u.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-slate-100">{u.fullName}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-400">@{u.username}</td>
                  <td className="py-3 px-3 font-bold text-slate-200">{u.role}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono">{u.email}</td>
                  <td className="py-3 px-3 text-right">
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.username)}
                        disabled={u.username === 'admin' || u.username === userSession.username}
                        className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/30 text-red-400 font-bold border border-red-500/20 disabled:opacity-40 transition"
                        title={u.username === 'admin' ? 'Root admin protected' : t.deleteUser}
                      >
                        <div className="flex items-center space-x-1">
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t.deleteUser}</span>
                        </div>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">Restricted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-slate-400 italic pt-1">
          {t.adminOnlyDeleteNote}
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Google Gemini AI Configuration Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-purple-400 font-bold text-sm">
            <Key className="h-5 w-5" />
            <span>Google Gemini AI API Integration (Google AI Studio Key)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-amber-400 uppercase">Google Gemini API Key (GOOGLE_API_KEY)</label>
              <input
                type="text"
                required
                value={settings.ai.googleApiKey}
                onChange={(e) => setSettings({
                  ...settings,
                  ai: { ...settings.ai, googleApiKey: e.target.value }
                })}
                placeholder="AQ.Ab8RNwYApfViNN6-CutkyG6oDW0voXZQ"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase">AI Provider</label>
              <select
                value={settings.ai.provider}
                onChange={(e) => setSettings({
                  ...settings,
                  ai: { ...settings.ai, provider: e.target.value as any }
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
              >
                <option value="Google Gemini AI">Google Gemini AI (Live API)</option>
                <option value="Offline AI Simulation">Offline AI Simulation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase">Gemini Model</label>
              <select
                value={settings.ai.model}
                onChange={(e) => setSettings({
                  ...settings,
                  ai: { ...settings.ai, model: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
              >
                <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Recommended)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (Latest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Credentials Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-amber-400 font-bold text-sm">
            <Mail className="h-5 w-5" />
            <span>SMTP Email Alert System Credentials (FR-08)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase">Sender Email Address (EMAIL_ADDRESS)</label>
              <input
                type="email"
                required
                value={settings.email.senderEmail}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, senderEmail: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase">Sender App Password (EMAIL_PASSWORD)</label>
              <input
                type="password"
                value={settings.email.smtpPassword || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, smtpPassword: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase">Receiver Management Email (RECEIVER_EMAIL)</label>
              <input
                type="email"
                required
                value={settings.email.receiverEmail}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, receiverEmail: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow transition active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Save System Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
