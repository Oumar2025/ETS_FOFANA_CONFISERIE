import React, { useState } from 'react';
import { 
  Settings, Mail, Bell, Sparkles, Save, RotateCcw, Plus, Trash2, Key, Users, Upload, 
  ShieldCheck, CheckCircle2, AlertCircle, Camera, UserPlus, Eye, Edit, Lock, Ban, 
  FileText, History, RefreshCw, Check, XCircle
} from 'lucide-react';
import { dbService } from '../services/DatabaseService';
import { SystemSettingsConfig, SeasonalEvent, UserAccount, UserSession, LanguageCode, CurrencyCode, UserRole, UserStatus, AuditLogEntry } from '../types';
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
  const isFr = currentLanguage === 'fr';

  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'audit' | 'system'>('users');
  const [settings, setSettings] = useState<SystemSettingsConfig>(dbService.getSettings());
  const [seasonalEvents, setSeasonalEvents] = useState<SeasonalEvent[]>(dbService.getSeasonalEvents());
  const [users, setUsers] = useState<UserAccount[]>(dbService.getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(dbService.getAuditLogs());

  const [isSaved, setIsSaved] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [auditSearch, setAuditSearch] = useState('');

  const isAdmin = ['Super Administrator', 'General Manager', 'Administrator'].includes(userSession.role);
  const isSuperAdmin = userSession.role === 'Super Administrator' || (userSession.role as string) === 'Administrator';

  // Avatar Options
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  ];

  // Modal State: Create Employee Account
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Sales Manager');
  const [newTempPassword, setNewTempPassword] = useState('Fofana@2026!');
  const [mustChangePassOnFirstLogin, setMustChangePassOnFirstLogin] = useState(true);

  // Modal State: Reset User Password
  const [resetModalUser, setResetModalUser] = useState<UserAccount | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('Fofana@2026!');
  const [resetMustChange, setResetMustChange] = useState(true);

  // Modal State: Edit User Profile / Role
  const [editModalUser, setEditModalUser] = useState<UserAccount | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Sales Manager');
  const [editStatus, setEditStatus] = useState<UserStatus>('Active');

  const newPassPolicy = dbService.validatePasswordPolicy(newTempPassword);
  const resetPassPolicy = dbService.validatePasswordPolicy(resetPasswordVal);

  const refreshUserData = () => {
    setUsers(dbService.getUsers());
    setAuditLogs(dbService.getAuditLogs());
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveSettings(settings);
    dbService.saveSeasonalEvents(seasonalEvents);
    dbService.addAuditLog(userSession.fullName, userSession.role, 'Updated System Settings', 'Modified core system configuration & thresholds', 'System');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg(null);

    if (!newPassPolicy.valid) {
      setUserMsg({ type: 'error', text: newPassPolicy.message || 'Password does not meet strength policy.' });
      return;
    }

    const res = dbService.saveUser(
      {
        username: newUsername.trim(),
        passwordHash: newTempPassword,
        role: newRole,
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        status: 'Active',
        mustChangePassword: mustChangePassOnFirstLogin
      },
      userSession.fullName
    );

    if (res.success) {
      setUserMsg({ type: 'success', text: `Employee account '@${newUsername}' created successfully!` });
      setShowAddUserModal(false);
      setNewFullName('');
      setNewUsername('');
      setNewEmail('');
      setNewPhone('');
      refreshUserData();
    } else {
      setUserMsg({ type: 'error', text: res.error || 'Failed to create user account.' });
    }
  };

  const handleToggleStatus = (u: UserAccount) => {
    const nextStatus: UserStatus = u.status === 'Active' ? 'Disabled' : 'Active';
    const res = dbService.updateUserStatus(u.username, nextStatus, userSession.fullName);
    if (res.success) {
      setUserMsg({ type: 'success', text: `Account '@${u.username}' status changed to ${nextStatus}.` });
      refreshUserData();
    } else {
      setUserMsg({ type: 'error', text: res.error || 'Failed to update user status.' });
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;

    if (!resetPassPolicy.valid) {
      setUserMsg({ type: 'error', text: resetPassPolicy.message || 'Password does not meet strength policy.' });
      return;
    }

    const res = dbService.resetUserPassword(
      resetModalUser.username,
      resetPasswordVal,
      resetMustChange,
      userSession.fullName
    );

    if (res.success) {
      setUserMsg({ type: 'success', text: `Password for '@${resetModalUser.username}' reset successfully!` });
      setResetModalUser(null);
      refreshUserData();
    } else {
      setUserMsg({ type: 'error', text: res.error || 'Failed to reset password.' });
    }
  };

  const handleOpenEditUser = (u: UserAccount) => {
    setEditModalUser(u);
    setEditFullName(u.fullName);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditStatus(u.status);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;

    dbService.updateUserProfile(editModalUser.username, {
      fullName: editFullName,
      email: editEmail,
      role: editRole,
      status: editStatus
    });

    setUserMsg({ type: 'success', text: `User '@${editModalUser.username}' updated successfully.` });
    setEditModalUser(null);
    refreshUserData();
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    setUserMsg(null);
    if (!isSuperAdmin) {
      setUserMsg({ type: 'error', text: 'Access Denied: Only Super Administrators have permission to delete employee accounts.' });
      return;
    }

    if (usernameToDelete.toLowerCase() === userSession.username.toLowerCase()) {
      setUserMsg({ type: 'error', text: 'You cannot delete your own active account.' });
      return;
    }

    if (window.confirm(`Are you sure you want to delete employee account '@${usernameToDelete}'?`)) {
      const result = dbService.deleteUser(usernameToDelete, userSession.role, userSession.fullName);
      if (result.success) {
        setUserMsg({ type: 'success', text: `Employee account '@${usernameToDelete}' deleted.` });
        refreshUserData();
      } else {
        setUserMsg({ type: 'error', text: result.error || 'Deletion failed.' });
      }
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        dbService.updateUserProfile(userSession.username, { avatarUrl: base64 });
        onUpdateSession({ ...userSession, avatarUrl: base64 });
        refreshUserData();
        setUserMsg({ type: 'success', text: 'Profile picture updated successfully!' });
        setTimeout(() => setUserMsg(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    dbService.updateUserProfile(userSession.username, { avatarUrl: url });
    onUpdateSession({ ...userSession, avatarUrl: url });
    refreshUserData();
    setUserMsg({ type: 'success', text: 'Profile avatar updated!' });
    setTimeout(() => setUserMsg(null), 3000);
  };

  const filteredLogs = auditLogs.filter(l =>
    (l.actorName || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
    (l.action || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
    (l.details || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
    (l.module || '').toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Settings className="h-7 w-7 text-amber-400" />
            <span>{t.settings}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise RBAC User Management, Role Navigation, Audit Trail & System Configuration
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>User Management ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'audit' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Audit Trail</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'profile' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>My Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'system' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>System Config</span>
          </button>
        </div>
      </div>

      {userMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center space-x-3 shadow-lg ${
          userMsg.type === 'error' ? 'bg-red-500/15 border border-red-500/30 text-red-300' : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
        }`}>
          {userMsg.type === 'error' ? <AlertCircle className="h-5 w-5 shrink-0 text-red-400" /> : <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />}
          <span>{userMsg.text}</span>
        </div>
      )}

      {/* TAB 1: USER MANAGEMENT & RBAC */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <span>Enterprise User Accounts & Role-Based Access Control (RBAC)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Super Administrator creates employee accounts with temporary passwords & forces password updates on first login.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-gold-glow transition shrink-0"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Add Employee User Account</span>
              </button>
            )}
          </div>

          {/* User Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {users.map(u => {
                  const isRootAdmin = u.username.toLowerCase() === 'admin';
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={u.fullName}
                            className="h-8 w-8 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-slate-100">{u.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">
                        @{u.username}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${
                          u.role === 'Super Administrator' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          u.role === 'General Manager' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          u.role === 'Inventory Manager' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          u.role === 'Sales Manager' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          u.role === 'Finance Manager' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          u.status === 'Disabled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {u.status || 'Active'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {u.lastLogin || 'Never logged in'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Edit Role & Details */}
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800"
                            title="Edit User Role & Details"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => setResetModalUser(u)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800"
                            title="Reset Temporary Password"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </button>

                          {/* Disable / Enable Toggle */}
                          {!isRootAdmin && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg border ${
                                u.status === 'Active' ? 'bg-slate-900 text-slate-400 hover:text-amber-400 border-slate-800' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              }`}
                              title={u.status === 'Active' ? 'Disable Employee Account' : 'Enable Employee Account'}
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Delete Account (Super Admin only, root admin protected) */}
                          {isSuperAdmin && !isRootAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u.username)}
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-500 hover:text-red-400 border border-slate-800"
                              title="Delete Account Permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL LOG VIEWER */}
      {activeTab === 'audit' && (
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                <History className="h-5 w-5 text-amber-400" />
                <span>Enterprise Audit Trail System Logs</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every critical operational action (stock edits, invoice generation, user creation) is permanently logged with actor timestamps.
              </p>
            </div>

            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Search audit trail..."
              className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs w-full sm:w-64 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium font-mono text-[11px]">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-4 text-amber-400 font-bold font-sans">{log.actorName}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{log.actorRole}</td>
                    <td className="py-3 px-4 text-slate-400 font-sans">{log.module || 'System'}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold font-sans">{log.action}</td>
                    <td className="py-3 px-4 text-slate-200 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MY PROFILE & AVATAR */}
      {activeTab === 'profile' && (
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-6 max-w-xl">
          <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Camera className="h-5 w-5 text-amber-400" />
            <span>Profile Avatar & Manager Details</span>
          </h2>

          <div className="flex items-center space-x-4">
            <img
              src={userSession.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={userSession.fullName}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-amber-500 shadow-gold-glow"
            />
            <div>
              <h3 className="font-extrabold text-white text-base">{userSession.fullName}</h3>
              <p className="text-xs text-amber-400 font-mono">@{userSession.username} ({userSession.role})</p>
              <p className="text-xs text-slate-400">{userSession.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase block">Choose Preset Avatar</label>
            <div className="flex space-x-3">
              {avatarPresets.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Preset"
                  onClick={() => handleSelectPresetAvatar(url)}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-700 cursor-pointer hover:border-amber-500 transition"
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase block">Or Upload Custom Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM CONFIG */}
      {activeTab === 'system' && (
        <form onSubmit={handleSaveSettings} className="glass-card rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-6 max-w-2xl">
          <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Settings className="h-5 w-5 text-amber-400" />
            <span>System Localization & Currency Configuration</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase block">{t.languageSetting}</label>
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
              >
                <option value="en">🇬🇧 {t.english}</option>
                <option value="fr">🇫🇷 {t.french}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase block">{t.currencySetting}</label>
              <select
                value={currentCurrency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
              >
                <option value="USD">USD ($)</option>
                <option value="FCFA">FCFA (XOF)</option>
                <option value="EUR">EUR (€)</option>
                <option value="TRY">TRY (₺)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-gold-glow flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* MODAL 1: ADD EMPLOYEE ACCOUNT */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-amber-400" />
              <span>Create Employee Account (Step 2 User Management)</span>
            </h3>

            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Ahmed Traoré"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">Username</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. ahmed_t"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">User Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="Super Administrator">Super Administrator</option>
                    <option value="General Manager">General Manager</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Warehouse Manager">Warehouse Manager</option>
                    <option value="Procurement Officer">Procurement Officer</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Finance Manager">Finance Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="employee@fofana.ml"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+223 70 00 00 00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={newTempPassword}
                  onChange={(e) => setNewTempPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                />
              </div>

              {/* Password Strength Requirements Checklist */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] space-y-1 font-mono">
                <p className="font-bold text-slate-400 uppercase text-[9px]">Password Strength Requirements:</p>
                <div className="grid grid-cols-2 gap-1">
                  <span className={newPassPolicy.length ? 'text-emerald-400 font-bold' : 'text-slate-500'}>✓ Min 10 chars</span>
                  <span className={newPassPolicy.uppercase ? 'text-emerald-400 font-bold' : 'text-slate-500'}>✓ 1 Uppercase</span>
                  <span className={newPassPolicy.lowercase ? 'text-emerald-400 font-bold' : 'text-slate-500'}>✓ 1 Lowercase</span>
                  <span className={newPassPolicy.number ? 'text-emerald-400 font-bold' : 'text-slate-500'}>✓ 1 Number</span>
                  <span className={`${newPassPolicy.special ? 'text-emerald-400 font-bold' : 'text-slate-500'} col-span-2`}>✓ 1 Special (!@#$)</span>
                </div>
              </div>

              <label className="flex items-center space-x-2 text-xs text-amber-300 font-semibold cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={mustChangePassOnFirstLogin}
                  onChange={(e) => setMustChangePassOnFirstLogin(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Force user to change password on first login</span>
              </label>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPassPolicy.valid}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-gold-glow disabled:opacity-40"
                >
                  Create Employee Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET PASSWORD */}
      {resetModalUser && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
              <Key className="h-5 w-5 text-amber-400" />
              <span>Reset Password for @{resetModalUser.username}</span>
            </h3>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">New Password</label>
                <input
                  type="text"
                  required
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                />
              </div>

              <label className="flex items-center space-x-2 text-xs text-amber-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetMustChange}
                  onChange={(e) => setResetMustChange(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Require password change on next login</span>
              </label>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!resetPassPolicy.valid}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-gold-glow disabled:opacity-40"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT USER DETAILS */}
      {editModalUser && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
              <Edit className="h-5 w-5 text-amber-400" />
              <span>Edit User Profile & Role (@{editModalUser.username})</span>
            </h3>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="Super Administrator">Super Administrator</option>
                    <option value="General Manager">General Manager</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Warehouse Manager">Warehouse Manager</option>
                    <option value="Procurement Officer">Procurement Officer</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Finance Manager">Finance Manager</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-gold-glow"
                >
                  Update User Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
