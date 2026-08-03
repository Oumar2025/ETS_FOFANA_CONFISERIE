import React, { useState, useEffect } from 'react';
import { UserSession, LanguageCode, CurrencyCode } from './types';
import { dbService } from './services/DatabaseService';
import { schedulerService } from './services/SchedulerService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesInvoicePage } from './pages/SalesInvoicePage';
import { ForecastPage } from './pages/ForecastPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AlertCenterPage } from './pages/AlertCenterPage';
import { ExecutiveReportPage } from './pages/ExecutiveReportPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('fof_ai_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [alertCount, setAlertCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global i18n & Currency State with safe fallback defaults
  const initialSettings = dbService.getSettings();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(
    initialSettings?.general?.language || 'en'
  );
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(
    initialSettings?.general?.currency || 'USD'
  );

  const refreshAlertCount = () => {
    try {
      const alerts = dbService.getAlertHistory().filter(a => a.status === 'Active');
      setAlertCount(alerts.length);
    } catch {
      setAlertCount(0);
    }
  };

  useEffect(() => {
    refreshAlertCount();
    schedulerService.runSchedulerCheck();

    // Periodic check to update UI state if Cloud Database changes on another device
    const interval = setInterval(() => {
      refreshAlertCount();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    localStorage.setItem('fof_ai_user_session', JSON.stringify(session));
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('fof_ai_user_session');
  };

  const handleCheckAlerts = () => {
    schedulerService.triggerManualAlertScan();
    refreshAlertCount();
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    const settings = dbService.getSettings();
    if (!settings.general) {
      settings.general = { companyName: 'ETS FOFANA CONFISERIE', currency: 'USD', language: lang };
    } else {
      settings.general.language = lang;
    }
    dbService.saveSettings(settings);
  };

  const handleCurrencyChange = (curr: CurrencyCode) => {
    setCurrentCurrency(curr);
    const settings = dbService.getSettings();
    if (!settings.general) {
      settings.general = { companyName: 'ETS FOFANA CONFISERIE', currency: curr, language: 'en' };
    } else {
      settings.general.currency = curr;
    }
    dbService.saveSettings(settings);
  };

  if (!userSession) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        alertCount={alertCount}
        currentLanguage={currentLanguage}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userSession={userSession}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          onLogout={handleLogout}
          onCheckAlerts={handleCheckAlerts}
          unreadAlertCount={alertCount}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          currentCurrency={currentCurrency}
          onCurrencyChange={handleCurrencyChange}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {activeModule === 'home' && <HomePage setActiveModule={setActiveModule} currentLanguage={currentLanguage} />}
          {activeModule === 'dashboard' && <DashboardPage setActiveModule={setActiveModule} currentLanguage={currentLanguage} currentCurrency={currentCurrency} />}
          {activeModule === 'inventory' && <InventoryPage userSession={userSession} currentLanguage={currentLanguage} currentCurrency={currentCurrency} />}
          {activeModule === 'salesInvoice' && <SalesInvoicePage currentLanguage={currentLanguage} currentCurrency={currentCurrency} />}
          {activeModule === 'forecast' && <ForecastPage currentLanguage={currentLanguage} currentCurrency={currentCurrency} />}
          {activeModule === 'assistant' && <AIAssistantPage />}
          {activeModule === 'alerts' && <AlertCenterPage onAlertsUpdated={refreshAlertCount} />}
          {activeModule === 'reports' && <ExecutiveReportPage userSession={userSession} currentLanguage={currentLanguage} currentCurrency={currentCurrency} />}
          {activeModule === 'settings' && (
            <SettingsPage
              userSession={userSession}
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              currentCurrency={currentCurrency}
              onCurrencyChange={handleCurrencyChange}
              onUpdateSession={(updated) => {
                setUserSession(updated);
                localStorage.setItem('fof_ai_user_session', JSON.stringify(updated));
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
