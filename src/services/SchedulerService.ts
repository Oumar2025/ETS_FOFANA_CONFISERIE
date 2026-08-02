import { alertService } from './AlertService';
import { notificationService } from './NotificationService';
import { productService } from './ProductService';
import { dbService } from './DatabaseService';

export class SchedulerService {
  private timer: any = null;

  public startScheduler(intervalMinutes: number = 60) {
    if (this.timer) clearInterval(this.timer);
    
    // Initial check
    this.runScheduledJob();

    this.timer = setInterval(() => {
      this.runScheduledJob();
    }, intervalMinutes * 60 * 1000);
  }

  public stopScheduler() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public runSchedulerCheck() {
    return this.runScheduledJob();
  }

  public triggerManualAlertScan() {
    return this.runScheduledJob();
  }

  public runScheduledJob(): { newAlertsCount: number; emailsSentCount: number } {
    console.log('[SchedulerService] Running periodic inventory alert verification...');
    
    const result = alertService.scanAndGenerateAlerts();
    const alerts = alertService.getAllAlerts();
    const products = productService.getAllProducts();

    let emailsSentCount = 0;

    alerts.forEach(alert => {
      if (alert.status === 'Active' && !alert.email_sent) {
        const product = products.find(p => p.product_id === alert.product_id);
        if (product) {
          notificationService.generateEmailPayload(product, alert);
          emailsSentCount++;
        }
      }
    });

    return {
      newAlertsCount: result.newAlertsCount,
      emailsSentCount
    };
  }
}

export const schedulerService = new SchedulerService();
