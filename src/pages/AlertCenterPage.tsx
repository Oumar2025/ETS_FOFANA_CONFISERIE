import React, { useState } from 'react';
import {
  BellRing,
  RefreshCw,
  CheckCircle2,
  VolumeX,
  CheckCheck,
  Mail,
  Clock,
  Sparkles,
  Eye,
  X,
  AlertTriangle,
  Send,
  Loader2
} from 'lucide-react';
import { ExpiryAlert } from '../types';
import { alertService } from '../services/AlertService';
import { productService } from '../services/ProductService';
import { notificationService, EmailNotificationPayload } from '../services/NotificationService';
import { dbService } from '../services/DatabaseService';

interface AlertCenterPageProps {
  onCheckAlerts?: () => void;
  onAlertsUpdated?: () => void;
}

export const AlertCenterPage: React.FC<AlertCenterPageProps> = ({ onCheckAlerts, onAlertsUpdated }) => {
  const [alerts, setAlerts] = useState<ExpiryAlert[]>(alertService.getAllAlerts());
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('All');
  const [isScanning, setIsScanning] = useState(false);
  const [sendStatusMessage, setSendStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email Inspector Modal
  const [previewEmail, setPreviewEmail] = useState<EmailNotificationPayload | null>(null);

  const notifyChange = () => {
    if (onAlertsUpdated) onAlertsUpdated();
    if (onCheckAlerts) onCheckAlerts();
  };

  const handleManualScan = async () => {
    setIsScanning(true);
    setSendStatusMessage(null);

    const newAlerts = alertService.checkAndGenerateAlerts();
    setAlerts(newAlerts);

    // Send emails for all active alerts to f.oumarou78@gmail.com
    const settings = dbService.getSettings();
    const products = productService.getAllProducts();

    let sentCount = 0;
    let failCount = 0;
    let lastError = '';

    for (const alert of newAlerts) {
      if (alert.status === 'Active') {
        const product = products.find(p => p.product_id === alert.product_id);
        if (product) {
          const payload = notificationService.generateEmailPayload(product, alert);
          const res = await notificationService.sendRealEmailAlert(payload);
          if (res.success) {
            alert.email_sent = true;
            alert.email_sent_timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
            sentCount++;
          } else {
            failCount++;
            lastError = res.error || 'SMTP Authentication failed';
          }
        }
      }
    }

    dbService.saveAlertHistory(newAlerts);
    setAlerts([...alertService.getAllAlerts()]);
    notifyChange();
    setIsScanning(false);

    if (sentCount > 0) {
      setSendStatusMessage({
        type: 'success',
        text: `Successfully dispatched ${sentCount} live email alert(s) to ${settings.email.receiverEmail || 'f.oumarou78@gmail.com'}!`
      });
    } else if (failCount > 0) {
      setSendStatusMessage({
        type: 'error',
        text: `SMTP Email Dispatch Error: ${lastError}. Please verify Gmail App Password in Settings.`
      });
    }
  };

  const handleSendSingleEmail = async (alert: ExpiryAlert) => {
    const product = productService.getProductById(alert.product_id);
    if (!product) return;

    setSendStatusMessage(null);
    const payload = notificationService.generateEmailPayload(product, alert);
    const res = await notificationService.sendRealEmailAlert(payload);

    if (res.success) {
      alert.email_sent = true;
      alert.email_sent_timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      dbService.saveAlertHistory(alerts);
      setAlerts([...alerts]);
      setSendStatusMessage({
        type: 'success',
        text: `Email alert for '${alert.product_name}' delivered directly to ${payload.to}!`
      });
    } else {
      setSendStatusMessage({
        type: 'error',
        text: `Failed to send email to ${payload.to}: ${res.error}`
      });
    }
  };

  const handleResolveAlert = (id: number) => {
    alertService.resolveAlert(id);
    setAlerts(alertService.getAllAlerts());
    notifyChange();
  };

  const handlePromoteProduct = (alert: ExpiryAlert) => {
    alertService.markPromoted(alert.alert_id);
    setAlerts(alertService.getAllAlerts());
    notifyChange();
  };

  const handleInspectEmail = (alert: ExpiryAlert) => {
    const product = productService.getProductById(alert.product_id);
    if (!product) return;

    const payload = notificationService.formatEmailPayload(alert, product);
    setPreviewEmail(payload);
  };

  const filteredAlerts = alerts.filter(a => {
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    if (milestoneFilter !== 'All' && a.alert_level !== milestoneFilter) return false;
    return true;
  });

  const receiverEmail = dbService.getSettings().email.receiverEmail || 'f.oumarou78@gmail.com';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <BellRing className="h-6 w-6 text-red-400" />
            <span>Smart Expiry Alert Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Milestone rules (30/15/7/3/1 days), live SMTP dispatch to <strong className="text-amber-400">{receiverEmail}</strong> & alert logs
          </p>
        </div>

        <button
          onClick={handleManualScan}
          disabled={isScanning}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-gold-glow transition active:scale-95 shrink-0 disabled:opacity-50"
        >
          {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span>{isScanning ? 'Sending Emails via SMTP...' : 'Run Scan & Send Email Alerts'}</span>
        </button>
      </div>

      {sendStatusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
            sendStatusMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {sendStatusMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{sendStatusMessage.text}</span>
          </div>
          <button onClick={() => setSendStatusMessage(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Alert Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs">
          <label className="font-bold text-slate-400 uppercase">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Alerts</option>
            <option value="Resolved">Resolved</option>
            <option value="Promoted">Promoted</option>
          </select>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <label className="font-bold text-slate-400 uppercase">Milestone:</label>
          <select
            value={milestoneFilter}
            onChange={(e) => setMilestoneFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"
          >
            <option value="All">All Milestones</option>
            <option value="30_DAYS">30 Days Remaining</option>
            <option value="15_DAYS">15 Days Remaining</option>
            <option value="7_DAYS">7 Days Remaining</option>
            <option value="3_DAYS">3 Days Remaining</option>
            <option value="1_DAY">1 Day (Critical Expiry)</option>
          </select>
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-base">No Expiry Alerts Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">All product inventory items are fresh and within safe operational parameters.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className={`glass-card rounded-2xl p-5 border transition-all space-y-3 ${
                alert.status === 'Active'
                  ? 'border-red-500/40 bg-red-950/10'
                  : 'border-slate-800/80 bg-slate-900/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/60 pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${
                    alert.days_until_expiry <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{alert.product_name}</h3>
                    <p className="text-[11px] text-slate-400">
                      Quantity: <strong className="text-slate-200">{alert.quantity_affected} units</strong> &bull; Expiry Date: <span className="font-mono text-amber-300">{alert.expiry_date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    alert.days_until_expiry <= 3 ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {alert.days_until_expiry} DAYS REMAINING
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    alert.status === 'Active' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>

              {/* Recommendation & Email Dispatch Log */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="md:col-span-2 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Recommendation</span>
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed">{alert.ai_recommendation}</p>
                </div>

                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Notification Log</span>
                    <p className={`text-xs font-semibold flex items-center space-x-1 mt-1 ${
                      alert.email_sent ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      <Mail className="h-3.5 w-3.5" />
                      <span>{alert.email_sent ? `Delivered to ${receiverEmail}` : 'Pending Dispatch'}</span>
                    </p>
                    {alert.email_sent_timestamp && (
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{alert.email_sent_timestamp}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => handleInspectEmail(alert)}
                      className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] font-bold flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleSendSingleEmail(alert)}
                      className="py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center justify-center space-x-1 border border-emerald-500/30"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Now</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {alert.status === 'Active' && (
                <div className="flex justify-end space-x-2 pt-1 border-t border-slate-800/40">
                  <button
                    onClick={() => handlePromoteProduct(alert)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition"
                  >
                    Launch Promo Discount
                  </button>
                  <button
                    onClick={() => handleResolveAlert(alert.alert_id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Email Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>SMTP Email Notification Inspector</span>
              </h3>
              <button onClick={() => setPreviewEmail(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p><strong className="text-slate-400">From:</strong> {previewEmail.from}</p>
              <p><strong className="text-slate-400">To:</strong> {previewEmail.to}</p>
              <p><strong className="text-slate-400">Subject:</strong> {previewEmail.subject}</p>
            </div>

            <div className="bg-white text-slate-900 p-4 rounded-xl text-xs max-h-60 overflow-y-auto font-sans leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: previewEmail.bodyHtml }} />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={async () => {
                  const res = await notificationService.sendRealEmailAlert(previewEmail);
                  if (res.success) {
                    setSendStatusMessage({ type: 'success', text: `Test email successfully dispatched to ${previewEmail.to}!` });
                  } else {
                    setSendStatusMessage({ type: 'error', text: `Email failed to send: ${res.error}` });
                  }
                  setPreviewEmail(null);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition"
              >
                <Send className="h-4 w-4" />
                <span>Send Live Test Email to {previewEmail.to}</span>
              </button>

              <button
                onClick={() => setPreviewEmail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
