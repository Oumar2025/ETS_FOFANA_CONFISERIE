import { ExpiryAlert, Product, Invoice } from '../types';
import { dbService } from './DatabaseService';

export interface EmailNotificationPayload {
  to: string;
  from: string;
  subject: string;
  htmlBody: string;
  bodyHtml: string;
  timestamp: string;
  status?: 'Sent' | 'Failed' | 'Pending';
  errorDetails?: string;
}

export class NotificationService {
  private emailLogs: EmailNotificationPayload[] = [];

  public async sendRealEmailAlert(payload: EmailNotificationPayload): Promise<{ success: boolean; error?: string }> {
    const settings = dbService.getSettings();
    const receiverEmail = payload.to || settings.email.receiverEmail || 'f.oumarou78@gmail.com';

    // Strategy 1: Direct Client-Side HTTPS Web Email API (Bypasses ISP port blocks)
    try {
      console.log(`[NotificationService] Dispatching email to ${receiverEmail} via HTTPS Web API...`);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: 'ee50a1cf-b7a4-4df1-8e01-0814bb657159', // High-delivery HTTPS Key
          subject: payload.subject,
          from_name: 'ETS FOFANA CONFISERIE (FOF-AI)',
          email: receiverEmail,
          message: payload.htmlBody
        })
      });

      const data = await response.json();
      if (data.success) {
        payload.status = 'Sent';
        console.log('[NotificationService] Email delivered successfully to:', receiverEmail);
        return { success: true };
      }
    } catch (webApiErr: any) {
      console.warn('[NotificationService] HTTPS Web API primary dispatch fallback:', webApiErr.message);
    }

    // Strategy 2: Local SMTP Server Relay (/api/send-email)
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: receiverEmail,
          from: settings.email.senderEmail || 'hp.oumaroulife2023@gmail.com',
          subject: payload.subject,
          htmlBody: payload.htmlBody,
          smtpUser: settings.email.senderEmail || 'hp.oumaroulife2023@gmail.com',
          smtpPass: settings.email.smtpPassword || 'usnlfnwdlutaj'
        })
      });

      const result = await response.json();
      if (result.success) {
        payload.status = 'Sent';
        return { success: true };
      } else {
        payload.status = 'Failed';
        payload.errorDetails = result.error;
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      payload.status = 'Failed';
      payload.errorDetails = err.message;
      return { success: false, error: err.message };
    }
  }

  public async sendInvoiceEmail(invoice: Invoice, targetEmail?: string): Promise<{ success: boolean; error?: string }> {
    const settings = dbService.getSettings();
    const receiverEmail = targetEmail || invoice.customer_email || settings.email.receiverEmail || 'f.oumarou78@gmail.com';

    const subject = `[ETS FOFANA CONFISERIE] Official Sales Invoice ${invoice.invoice_number}`;
    
    const itemsHtml = invoice.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #334155; color: #f8fafc;">${item.product_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #334155; color: #fbbf24; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #334155; color: #cbd5e1; text-align: right;">$${(item.unit_price || 0).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #334155; color: #34d399; font-weight: bold; text-align: right;">$${(item.total_price || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 650px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #fbbf24; margin: 0; font-size: 22px;">ETS FOFANA CONFISERIE</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Official Sales Invoice & Dispatch Note</p>
        </div>

        <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%; font-size: 13px; color: #cbd5e1;">
            <tr>
              <td><strong>Invoice Number:</strong> <span style="color: #fbbf24;">${invoice.invoice_number}</span></td>
              <td style="text-align: right;"><strong>Date:</strong> ${invoice.invoice_date}</td>
            </tr>
            <tr>
              <td><strong>Customer / Client:</strong> ${invoice.customer_name}</td>
              <td style="text-align: right;"><strong>Destination:</strong> ${invoice.destination_country}</td>
            </tr>
            <tr>
              <td><strong>Payment Method:</strong> ${invoice.payment_method}</td>
              <td style="text-align: right;"><strong>Status:</strong> <span style="color: #34d399;">${invoice.status}</span></td>
            </tr>
          </table>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #334155; color: #94a3b8; text-transform: uppercase; font-size: 11px;">
              <th style="padding: 10px; text-align: left;">Item Description</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Unit Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; font-size: 18px; font-weight: bold; color: #fbbf24; padding-top: 10px; border-top: 1px solid #334155;">
          Total Amount: $${(invoice.total_amount || 0).toFixed(2)}
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center; border-top: 1px solid #1e293b; padding-top: 12px;">
          Thank you for doing business with ETS FOFANA CONFISERIE.
        </p>
      </div>
    `;

    return this.sendRealEmailAlert({
      to: receiverEmail,
      from: settings.email.senderEmail || 'hp.oumaroulife2023@gmail.com',
      subject,
      htmlBody,
      bodyHtml: htmlBody,
      timestamp: new Date().toISOString()
    });
  }

  public formatEmailPayload(alert: ExpiryAlert, product: Product): EmailNotificationPayload {
    return this.generateEmailPayload(product, alert);
  }

  public generateEmailPayload(product: Product, alert: ExpiryAlert): EmailNotificationPayload {
    const settings = dbService.getSettings();

    const now = new Date();
    const expDate = new Date(product.expiry_date);
    const daysRemaining = Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const subject = `[FOF-AI URGENT ALERT] ${product.product_name} - Expiry Milestone (${alert.alert_level})`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
        <div style="border-bottom: 2px solid #d97706; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #fbbf24; margin: 0;">FOF-AI Business Intelligence Alert</h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">ETS FOFANA CONFISERIE - Internal Decision Support System</p>
        </div>
        <p style="color: #cbd5e1;">Dear Manager,</p>
        <p style="color: #cbd5e1;">The system has flagged an expiry milestone alert for <strong>${product.product_name}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; color: #e2e8f0; font-size: 14px;">
          <tr style="background-color: #1e293b;"><td style="padding: 8px; font-weight: bold;">Product:</td><td style="padding: 8px;">${product.product_name} (${product.category})</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Warehouse Location:</td><td style="padding: 8px;">${product.warehouse}</td></tr>
          <tr style="background-color: #1e293b;"><td style="padding: 8px; font-weight: bold;">Quantity Affected:</td><td style="padding: 8px;">${product.quantity} ${product.unit}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Expiration Date:</td><td style="padding: 8px;">${product.expiry_date} (${daysRemaining} days remaining)</td></tr>
          <tr style="background-color: #1e293b;"><td style="padding: 8px; font-weight: bold;">Milestone Rule:</td><td style="padding: 8px; color: #ef4444; font-weight: bold;">${alert.alert_level}</td></tr>
        </table>

        <div style="background-color: #1e293b; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 16px;">
          <strong style="color: #f59e0b;">AI Executive Recommendation:</strong>
          <p style="margin: 4px 0 0 0; color: #e2e8f0;">${alert.ai_recommendation}</p>
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
          This email was dispatched automatically by FOF-AI System Scheduler.
        </p>
      </div>
    `;

    return {
      to: settings.email.receiverEmail || 'f.oumarou78@gmail.com',
      from: settings.email.senderEmail || 'hp.oumaroulife2023@gmail.com',
      subject,
      htmlBody,
      bodyHtml: htmlBody,
      timestamp: new Date().toISOString()
    };
  }
}

export const notificationService = new NotificationService();
