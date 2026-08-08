import { ExpiryAlert } from '../types';
import { dbService } from './DatabaseService';

export class AlertService {
  public getAllAlerts(): ExpiryAlert[] {
    const products = dbService.getProducts();
    const validProductIds = new Set(products.map(p => p.product_id));
    
    // Clean up orphaned alerts for products that were deleted or missing names
    let alerts = dbService.getAlertHistory();
    alerts = alerts.filter(a => a && a.product_name && validProductIds.has(a.product_id));

    if (alerts.length === 0 && products.length > 0) {
      // Auto-scan current products if no alerts exist for active products
      this.scanAndGenerateAlerts();
      alerts = dbService.getAlertHistory().filter(a => a && a.product_name && validProductIds.has(a.product_id));
    }

    dbService.saveAlertHistory(alerts);
    return alerts;
  }

  public getActiveAlerts(): ExpiryAlert[] {
    return this.getAllAlerts().filter(a => a.status === 'Active');
  }

  public checkAndGenerateAlerts(): ExpiryAlert[] {
    this.scanAndGenerateAlerts();
    return this.getAllAlerts();
  }

  public scanAndGenerateAlerts(): { newAlertsCount: number; duplicateSkippedCount: number } {
    const products = dbService.getProducts();
    const validProductIds = new Set(products.map(p => p.product_id));
    let existingAlerts = dbService.getAlertHistory().filter(a => a && a.product_name && validProductIds.has(a.product_id));
    let newAlertsCount = 0;
    let duplicateSkippedCount = 0;
    const now = new Date();

    products.forEach(product => {
      const expDate = new Date(product.expiry_date);
      const diffTime = expDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 30 && daysRemaining >= -30) {
        let hitMilestone: ExpiryAlert['alert_level'] | null = null;
        if (daysRemaining <= 1) hitMilestone = '1_DAY';
        else if (daysRemaining <= 3) hitMilestone = '3_DAYS';
        else if (daysRemaining <= 7) hitMilestone = '7_DAYS';
        else if (daysRemaining <= 15) hitMilestone = '15_DAYS';
        else if (daysRemaining <= 30) hitMilestone = '30_DAYS';

        if (hitMilestone) {
          const alreadyExists = existingAlerts.some(
            a => a.product_id === product.product_id && a.alert_level === hitMilestone
          );

          if (!alreadyExists) {
            const newAlertId = existingAlerts.length > 0 ? Math.max(...existingAlerts.map(a => a.alert_id)) + 1 : 1;
            const newAlert: ExpiryAlert = {
              alert_id: newAlertId,
              product_id: product.product_id,
              product_name: product.product_name,
              expiry_date: product.expiry_date,
              days_until_expiry: daysRemaining,
              quantity_affected: product.quantity,
              alert_level: hitMilestone,
              status: 'Active',
              email_sent: true,
              email_sent_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              ai_recommendation: daysRemaining <= 3
                ? `Urgent clearance sale required for ${product.product_name} in ${product.warehouse}.`
                : `Launch 15% promotional discount campaign before ${product.expiry_date}.`
            };

            existingAlerts.unshift(newAlert);
            newAlertsCount++;
          } else {
            duplicateSkippedCount++;
          }
        }
      }
    });

    dbService.saveAlertHistory(existingAlerts);

    return {
      newAlertsCount,
      duplicateSkippedCount
    };
  }

  public resolveAlert(alertId: number): void {
    const alerts = this.getAllAlerts();
    const alert = alerts.find(a => a.alert_id === alertId);
    if (alert) {
      alert.status = 'Resolved';
      dbService.saveAlertHistory(alerts);
    }
  }

  public markResolved(alertId: number): void {
    this.resolveAlert(alertId);
  }

  public markPromoted(alertId: number): void {
    this.promoteAlert(alertId);
  }

  public promoteAlert(alertId: number): void {
    const alerts = this.getAllAlerts();
    const alert = alerts.find(a => a.alert_id === alertId);
    if (alert) {
      alert.status = 'Promoted';
      dbService.saveAlertHistory(alerts);
    }
  }
}

export const alertService = new AlertService();
