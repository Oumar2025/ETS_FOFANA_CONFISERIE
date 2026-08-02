import { ExpiryAlert, Product } from '../types';
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

    // Strategy 1: Direct Client-Side HTTPS Web Email API (Bypasses all ISP SMTP port 587/465 blocks)
    try {
      console.log(`[NotificationService] Dispatching alert email to ${receiverEmail} via HTTPS Web API...`);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: 'ee50a1cf-b7a4-4df1-8e01-0814bb657159', // High-delivery HTTPS Key
          subject: payload.subject,
          from_name: 'FOF-AI BI Assistant (ETS FOFANA)',
          email: receiverEmail,
          message: payload.htmlBody
        })
      });

      const data = await response.json();
      if (data.success) {
        payload.status = 'Sent';
        console.log('[NotificationService] Email delivered successfully via HTTPS Web API to:', receiverEmail);
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
        
        <p style="font-size: 16px;">Dear Executive Management,</p>
        <p>FOF-AI has detected an upcoming expiry milestone for an active inventory item requiring operational attention:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #1e293b; border-radius: 6px; overflow: hidden;">
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 16px; color: #94a3b8; font-weight: bold;">Product Name:</td>
            <td style="padding: 10px 16px; color: #ffffff; font-weight: bold;">${product.product_name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 16px; color: #94a3b8; font-weight: bold;">Category:</td>
            <td style="padding: 10px 16px; color: #ffffff;">${product.category} (${product.brand})</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 16px; color: #94a3b8; font-weight: bold;">Warehouse:</td>
            <td style="padding: 10px 16px; color: #ffffff;">${product.warehouse}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 16px; color: #94a3b8; font-weight: bold;">Current Stock:</td>
            <td style="padding: 10px 16px; color: #38bdf8; font-weight: bold;">${product.quantity} ${product.unit}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 16px; color: #94a3b8; font-weight: bold;">Expiry Date:</td>
            <td style="padding: 10px 16px; color: #ef4444; font-weight: bold;">${product.expiry_date} (${daysRemaining} Days Remaining)</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 16px; color: #94a3b8; font-weight: bold;">Alert Level:</td>
            <td style="padding: 10px 16px; color: #f59e0b; font-weight: bold;">${alert.alert_level} Milestone</td>
          </tr>
        </table>

        <div style="background-color: rgba(217, 119, 6, 0.15); border-left: 4px solid #f59e0b; padding: 14px; margin: 20px 0; border-radius: 4px;">
          <h4 style="color: #fbbf24; margin: 0 0 6px 0;">AI Strategic Recommendation:</h4>
          <p style="margin: 0; color: #e2e8f0; font-size: 14px; line-height: 1.5;">${alert.ai_recommendation || 'Initiate promotional discounts or reallocate stock to high-demand destinations.'}</p>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #334155; padding-top: 12px;">
          Generated automatically by FOF-AI Business Intelligence Assistant &bull; ETS FOFANA CONFISERIE &bull; Bamako, Mali
        </p>
      </div>
    `;

    const payload: EmailNotificationPayload = {
      to: settings.email.receiverEmail || 'f.oumarou78@gmail.com',
      from: settings.email.senderEmail || 'hp.oumaroulife2023@gmail.com',
      subject,
      htmlBody,
      bodyHtml: htmlBody,
      timestamp: new Date().toISOString(),
      status: 'Pending'
    };

    // Dispatch real email via HTTPS Web API
    this.sendRealEmailAlert(payload);

    this.emailLogs.push(payload);
    return payload;
  }

  public getEmailLogs(): EmailNotificationPayload[] {
    return this.emailLogs;
  }
}

export const notificationService = new NotificationService();
