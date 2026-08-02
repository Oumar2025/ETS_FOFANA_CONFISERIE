import { ExpiryAlert } from '../types';
import { dbService } from './DatabaseService';

export class AlertService {
  public getAllAlerts(): ExpiryAlert[] {
    const alerts = dbService.getAlertHistory();
    if (alerts.length === 0) {
      // Seed default alerts if empty
      const initialAlerts: ExpiryAlert[] = [
        {
          alert_id: 1,
          product_id: 3,
          product_name: 'Atlas Wafer Deluxe Hazelnut 45g',
          expiry_date: '2026-08-05',
          days_until_expiry: 3,
          quantity_affected: 80,
          alert_level: '3_DAYS',
          status: 'Active',
          email_sent: true,
          email_sent_timestamp: '2026-08-01 08:30:00',
          ai_recommendation: 'Launch 35% clearance sale immediately before expiry in 3 days.'
        },
        {
          alert_id: 2,
          product_id: 6,
          product_name: 'Bambino Fruity Gummy Candies 250g',
          expiry_date: '2026-08-03',
          days_until_expiry: 1,
          quantity_affected: 35,
          alert_level: '1_DAY',
          status: 'Active',
          email_sent: true,
          email_sent_timestamp: '2026-08-01 09:00:00',
          ai_recommendation: 'Product expires tomorrow! Liquidate remaining stock in Kayes Depot.'
        },
        {
          alert_id: 3,
          product_id: 1,
          product_name: 'Oreo Original Chocolate Biscuits 154g',
          expiry_date: '2026-08-17',
          days_until_expiry: 15,
          quantity_affected: 450,
          alert_level: '15_DAYS',
          status: 'Active',
          email_sent: true,
          email_sent_timestamp: '2026-08-01 10:15:00',
          ai_recommendation: 'Launch 15% discount campaign across Mali retail networks.'
        }
      ];
      dbService.saveAlertHistory(initialAlerts);
      return initialAlerts;
    }
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
    const existingAlerts = this.getAllAlerts();
    let newAlertsCount = 0;
    let duplicateSkippedCount = 0;
    const now = new Date();

    products.forEach(product => {
      const expDate = new Date(product.expiry_date);
      const diffTime = expDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 30 && daysRemaining > 0) {
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
              ai_recommendation: `Product '${product.product_name}' expires in ${daysRemaining} day(s). Immediate promotional markdown or inventory reallocation recommended.`
            };

            existingAlerts.push(newAlert);
            newAlertsCount++;
          } else {
            duplicateSkippedCount++;
          }
        }
      }
    });

    if (newAlertsCount > 0) {
      dbService.saveAlertHistory(existingAlerts);
    }

    return { newAlertsCount, duplicateSkippedCount };
  }

  public resolveAlert(alertId: number): boolean {
    const alerts = this.getAllAlerts();
    const alert = alerts.find(a => a.alert_id === alertId);
    if (!alert) return false;

    alert.status = 'Resolved';
    dbService.saveAlertHistory(alerts);
    return true;
  }

  public markPromoted(alertId: number): boolean {
    const alerts = this.getAllAlerts();
    const alert = alerts.find(a => a.alert_id === alertId);
    if (!alert) return false;

    alert.status = 'Promoted';
    dbService.saveAlertHistory(alerts);
    return true;
  }
}

export const alertService = new AlertService();
