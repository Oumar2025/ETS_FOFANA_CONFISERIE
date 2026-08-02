import React, { useState } from 'react';
import { Sparkles, Lock, User, KeyRound, AlertCircle, ArrowRight, ShieldCheck, UserPlus, CheckCircle2, Mail, HelpCircle, Key } from 'lucide-react';
import { UserSession, UserRole } from '../types';
import { dbService } from '../services/DatabaseService';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Login state (Starts 100% EMPTY so no pre-filled info appears)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('General Manager');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regMessage, setRegMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Forgot password / Recovery state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [recoveredUser, setRecoveredUser] = useState<{ username: string; fullName: string } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const user = dbService.authenticateUser(username, password);
      if (user) {
        onLoginSuccess({
          username: user.username,
          role: user.role,
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          loginTime: new Date().toISOString()
        });
      } else {
        setErrorMessage('Invalid username or password. Please verify credentials.');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegMessage(null);

    if (regPassword !== regConfirmPassword) {
      setRegMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    const valResult = dbService.validatePasswordStrength(regPassword);
    if (!valResult.valid) {
      setRegMessage({ type: 'error', text: valResult.message || 'Password does not meet security strength criteria.' });
      return;
    }

    const saveResult = dbService.saveUser({
      username: regUsername,
      passwordHash: regPassword,
      role: regRole,
      fullName: regFullName,
      email: regEmail
    });

    if (!saveResult.success) {
      setRegMessage({ type: 'error', text: saveResult.error || 'Registration failed.' });
    } else {
      setRegMessage({ type: 'success', text: `Manager account '@${regUsername}' registered successfully! You can now log in.` });
      setUsername(regUsername);
      setPassword(regPassword);
      setTimeout(() => setActiveTab('login'), 1500);
    }
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(null);
    setRecoveredUser(null);

    const users = dbService.getUsers();
    const match = users.find(u => u.email.toLowerCase().trim() === forgotEmail.toLowerCase().trim());

    if (!match) {
      setForgotMessage({ type: 'error', text: `No account found with email '${forgotEmail}'. Please check the email address.` });
      return;
    }

    setRecoveredUser({ username: match.username, fullName: match.fullName });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveredUser) return;

    const valResult = dbService.validatePasswordStrength(forgotNewPassword);
    if (!valResult.valid) {
      setForgotMessage({ type: 'error', text: valResult.message || 'Password does not meet strength criteria.' });
      return;
    }

    const updated = dbService.updateUserProfile(recoveredUser.username, { passwordHash: forgotNewPassword });
    if (updated.success) {
      setForgotMessage({ type: 'success', text: `Password for @${recoveredUser.username} updated successfully! Redirecting to Sign In...` });
      setUsername(recoveredUser.username);
      setPassword(forgotNewPassword);
      setTimeout(() => {
        setActiveTab('login');
        setRecoveredUser(null);
        setForgotMessage(null);
      }, 1800);
    } else {
      setForgotMessage({ type: 'error', text: 'Failed to update password.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/15 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl border border-slate-800 relative z-10">
        {/* Header Logo */}
        <div className="text-center space-y-3 mb-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-0.5 shadow-gold-glow flex items-center justify-center">
            <img src="/ets_fofana_logo.jpg" alt="Logo" className="h-full w-full rounded-[14px] object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight gold-gradient-text">FOF-AI</h1>
            <p className="text-xs uppercase tracking-widest font-bold text-amber-500 mt-1">
              AI Business Intelligence Platform
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              ETS FOFANA CONFISERIE &bull; Mali
            </p>
          </div>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'login' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'register' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Manager
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('forgot')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'forgot' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recover
          </button>
        </div>

        {/* Tab 1: Login Form (Empty by Default) */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-400 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your registered username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Password</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[11px] text-amber-400 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <span>Authenticating...</span> : <span>Sign In to Executive BI</span>}
            </button>
          </form>
        )}

        {/* Tab 2: Manager Registration */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-3.5 text-xs">
            {regMessage && (
              <div
                className={`p-3 rounded-xl border flex items-center space-x-2 font-semibold text-xs ${
                  regMessage.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {regMessage.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                <span>{regMessage.text}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase block">Full Name</label>
              <input
                type="text"
                required
                autoComplete="off"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Oumarou Fofana"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">Username</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. fofana_manager"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">Assigned Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="General Manager">General Manager</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Warehouse Manager">Warehouse Manager</option>
                  <option value="Procurement Officer">Procurement Officer</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase block">Work Email</label>
              <input
                type="email"
                required
                autoComplete="off"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="hp.oumaroulife2023@gmail.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">Strong Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="e.g. Fofana@2026!"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">Confirm Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center space-x-2 transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register Manager Account</span>
            </button>
          </form>
        )}

        {/* Tab 3: Forgot Password / Account Recovery Form */}
        {activeTab === 'forgot' && (
          <div className="space-y-4 text-xs">
            {forgotMessage && (
              <div
                className={`p-3 rounded-xl border flex items-center space-x-2 font-semibold text-xs ${
                  forgotMessage.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {forgotMessage.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                <span>{forgotMessage.text}</span>
              </div>
            )}

            {!recoveredUser ? (
              <form onSubmit={handleVerifyEmail} autoComplete="off" className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">Registered Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. hp.oumaroulife2023@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Enter the email address you registered with to locate your account and reset your password.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center space-x-2 transition"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Verify Email & Find Account</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} autoComplete="off" className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Account Found:</p>
                  <p className="font-bold text-amber-400 text-sm">{recoveredUser.fullName}</p>
                  <p className="text-xs text-slate-300 font-mono">Username: <strong>@{recoveredUser.username}</strong></p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">Set New Strong Password</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="e.g. NewPass2026!"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center space-x-2 transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save New Password & Log In</span>
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setRecoveredUser(null); }}
                className="text-xs text-slate-400 hover:text-white underline font-semibold"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-slate-600">
        <p>&copy; 2026 ETS FOFANA CONFISERIE. Role-Based Access Control (RBAC) System.</p>
      </div>
    </div>
  );
};
