import React, { useState } from 'react';
import { Sparkles, Lock, User, KeyRound, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Eye, EyeOff, XCircle, Check, HelpCircle, Key, ShieldAlert } from 'lucide-react';
import { UserSession, UserRole, UserAccount } from '../types';
import { dbService } from '../services/DatabaseService';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'info' | 'forgot'>('login');

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Force Password Change Modal (First Login)
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Password Policy live check
  const passPolicy = dbService.validatePasswordPolicy(newPassword);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = dbService.authenticateUser(username, password);
      if (result.success && result.user) {
        if (result.user.mustChangePassword) {
          setPendingUser(result.user);
          setIsLoading(false);
          return;
        }

        onLoginSuccess({
          username: result.user.username,
          role: result.user.role,
          fullName: result.user.fullName,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl,
          loginTime: new Date().toISOString(),
          lastLogin: result.user.lastLogin
        });
      } else {
        setErrorMessage(result.error || 'Invalid username or password.');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleForcePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }

    if (!passPolicy.valid) {
      setPasswordChangeError(passPolicy.message || 'Password does not meet enterprise security requirements.');
      return;
    }

    if (pendingUser) {
      dbService.resetUserPassword(pendingUser.username, newPassword, false, pendingUser.fullName);
      
      onLoginSuccess({
        username: pendingUser.username,
        role: pendingUser.role,
        fullName: pendingUser.fullName,
        email: pendingUser.email,
        avatarUrl: pendingUser.avatarUrl,
        loginTime: new Date().toISOString(),
        lastLogin: pendingUser.lastLogin
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-[0_20px_70px_rgba(0,0,0,0.8)] relative z-10 space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-1 shadow-gold-glow items-center justify-center">
            <img
              src="/ets_fofana_logo.jpg"
              alt="ETS FOFANA Logo"
              className="h-full w-full rounded-[14px] object-cover"
            />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white gold-gradient-text">
              ETS FOFANA CONFISERIE
            </h1>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              FOF-AI BI v2.0 Enterprise Portal
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2 rounded-lg transition ${
              activeTab === 'login' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-2 rounded-lg transition ${
              activeTab === 'info' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Account Access Policy
          </button>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-start space-x-2.5 shadow-md">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username (e.g. admin)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Super Admin Quick Credentials Reference Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center text-amber-400 font-extrabold">
                <span>🔑 Super Administrator Credentials:</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">RBAC Enabled</span>
              </div>
              <p className="text-slate-300 font-mono">Username: <strong className="text-white">admin</strong></p>
              <p className="text-slate-300 font-mono">Password: <strong className="text-white">Fofana@2026!</strong></p>
            </div>
          </form>
        )}

        {/* TAB 2: ACCOUNT ACCESS POLICY (No Public Registration) */}
        {activeTab === 'info' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <ShieldCheck className="h-5 w-5" />
                <span>Enterprise User Management Policy</span>
              </div>
              <p className="text-[11px] text-slate-300">
                To guarantee maximum security and data integrity, <strong>public self-registration is disabled</strong>. Employee accounts are created exclusively by the <strong>Super Administrator</strong> under <em className="text-amber-300 font-bold">System Settings &rarr; User Management</em>.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <p className="font-extrabold text-white text-xs uppercase tracking-wider">How employee onboarding works:</p>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 text-[11px]">
                <li>Super Administrator creates employee account and assigns a role.</li>
                <li>Employee receives temporary password.</li>
                <li>On first login, the employee is required to set a new strong password.</li>
                <li>Navigation menu automatically adapts based on assigned user role.</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>

      {/* FORCE PASSWORD CHANGE MODAL ON FIRST LOGIN */}
      {pendingUser && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
              <ShieldAlert className="h-6 w-6 text-amber-400" />
              <div>
                <h3 className="font-black text-white text-sm">First Login Security Password Reset</h3>
                <p className="text-[11px] text-slate-400">Please change your temporary password before continuing.</p>
              </div>
            </div>

            {passwordChangeError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold">
                {passwordChangeError}
              </div>
            )}

            <form onSubmit={handleForcePasswordChangeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-500"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Live Password Policy Feedback Checklist */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <p className="font-bold text-slate-400 uppercase text-[10px]">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-1 font-mono">
                  <div className={`flex items-center space-x-1.5 ${passPolicy.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {passPolicy.length ? <Check className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span>Min 10 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${passPolicy.uppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {passPolicy.uppercase ? <Check className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span>1 Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${passPolicy.lowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {passPolicy.lowercase ? <Check className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span>1 Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${passPolicy.number ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {passPolicy.number ? <Check className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span>1 Number (0-9)</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${passPolicy.special ? 'text-emerald-400' : 'text-slate-500'} col-span-2`}>
                    {passPolicy.special ? <Check className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span>1 Special Character (!@#$) (e.g. Fofana@2026!)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={!passPolicy.valid}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-gold-glow transition disabled:opacity-40"
              >
                Save New Password & Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
