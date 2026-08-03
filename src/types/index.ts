export type ProductCategory = 'Biscuits' | 'Chocolates' | 'Candy' | 'Dates' | 'Packaged Confectionery';

export type SupplierCountry = 'Turkey' | 'Morocco' | 'Tunisia' | 'Brazil';

export type DestinationCountry = 'Mali' | 'Burkina Faso' | "Côte d'Ivoire" | 'Angola';

export type WarehouseLocation = 
  | 'Warehouse A (Bamako Central)' 
  | 'Warehouse B (Kayes Depot)' 
  | 'Warehouse C (Sikasso Hub)'
  | 'Warehouse D (Bobo Central)'
  | 'Warehouse E (Ango Depot)'
  | 'Warehouse F (Abidjan Hub)';

export type ProductStatus = 'In Stock' | 'Low Stock' | 'Critical Stock' | 'Approaching Expiry' | 'Expired';

export type ProductUnit = 'Cartons' | 'Boxes' | 'Pallets';

export type UserRole = 
  | 'Super Administrator' 
  | 'General Manager' 
  | 'Inventory Manager' 
  | 'Warehouse Manager' 
  | 'Procurement Officer'
  | 'Sales Manager'
  | 'Finance Manager';

export type UserStatus = 'Active' | 'Inactive' | 'Suspended' | 'Disabled';

export type LanguageCode = 'en' | 'fr';

export type CurrencyCode = 'USD' | 'FCFA' | 'EUR' | 'TRY';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Check' | 'Credit / Account';

export interface UserAccount {
  id: number | string;
  username: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  status: UserStatus;
  mustChangePassword?: boolean;
  lastLogin?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
}

export interface UserSession {
  username: string;
  role: UserRole;
  fullName: string;
  email: string;
  avatarUrl?: string;
  loginTime: string;
  mustChangePassword?: boolean;
  lastLogin?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  module?: string;
}

export interface Product {
  product_id: number;
  product_name: string;
  category: ProductCategory;
  brand: string;
  supplier_country: SupplierCountry;
  destination_country: DestinationCountry;
  quantity: number;
  unit: ProductUnit;
  cost_price: number;
  selling_price: number;
  manufacture_date: string;
  expiry_date: string;
  warehouse: WarehouseLocation;
  status: ProductStatus;
  notes?: string;
}

export interface SalesHistory {
  sale_id: number;
  invoice_number: string;
  product_id: number;
  product_name: string;
  customer_name: string;
  destination_country: DestinationCountry;
  date: string;
  quantity_sold: number;
  unit_price: number;
  total_revenue: number;
}

export interface InvoiceItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  invoice_id: number;
  invoice_number: string;
  customer_id: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  destination_country: DestinationCountry;
  invoice_date: string;
  payment_method: PaymentMethod;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total_amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  notes?: string;
}

export interface Customer {
  customer_id: number;
  name: string;
  company_name: string;
  country: DestinationCountry;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  credit_limit: number;
  status: 'Active' | 'VIP' | 'On Hold';
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  country: SupplierCountry;
  contact_person: string;
  email: string;
  phone: string;
  rating: number; // 1-5
  lead_time_days: number;
  products_supplied: string[];
}

export interface ExpiryAlert {
  alert_id: number;
  product_id: number;
  product_name: string;
  expiry_date: string;
  days_until_expiry: number;
  quantity_affected: number;
  alert_level: '30_DAYS' | '15_DAYS' | '7_DAYS' | '3_DAYS' | '1_DAY';
  status: 'Active' | 'Resolved' | 'Promoted';
  email_sent: boolean;
  email_sent_timestamp?: string;
  ai_recommendation: string;
}

export interface DemandForecast {
  product_id: number;
  product_name: string;
  category: ProductCategory;
  current_stock: number;
  historical_monthly_avg: number;
  active_seasonal_event?: string;
  demand_multiplier: number;
  expected_demand: number;
  import_recommendation_qty: number;
  ai_interpretation: 'Optimal Stock' | 'Inventory Shortage' | 'Overstock Risk';
  confidence_score: number;
  trend: 'Increasing' | 'Stable' | 'Surging';
}

export interface SeasonalEvent {
  event_id: number;
  event: string;
  category: ProductCategory;
  start_date: string;
  end_date: string;
  demand_multiplier: number;
  description?: string;
}

export interface AIProductAnalysis {
  healthStatus: 'Healthy' | 'Low' | 'Critical';
  expiryRisk: 'Safe' | 'Warning' | 'Critical' | 'Expired';
  daysRemaining: number;
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Immediate';
  costPrice: number;
  sellingPrice: number;
  profitMargin: number;
  profitMarginPercent: number;
  recommendation: string;
  explanation: {
    inventoryCondition: string;
    expirySituation: string;
    profitability: string;
    demandConsiderations: string;
    businessRisks: string;
    recommendedActions: string[];
  };
}

export interface AIPromotionAdvice {
  suggestedDiscount: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
  campaignDurationDays: number;
  expectedSalesBoostPercent: number;
}

export interface AIImportAdvice {
  recommendedImportQty: number;
  preferredSupplierCountry: SupplierCountry;
  importPriority: 'Low' | 'Medium' | 'High';
  recommendedPurchaseTiming: string;
  procurementStrategy: string;
}

export interface DecisionSimulationResult {
  plannedImportQty: number;
  newInventoryLevel: number;
  projectedStockAvailabilityDays: number;
  projectedProfitMargin: number;
  overstockRisk: 'Low' | 'Moderate' | 'High';
  shortageRisk: 'Low' | 'Moderate' | 'High';
  expiryRisk: 'Low' | 'Moderate' | 'High';
  aiVerdict: string;
}

export interface WeeklyActionPlanDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  action: string;
  actionFr?: string;
  productId?: number;
  productName?: string;
  priority: 'Low' | 'Medium' | 'High';
  rationale?: string;     // Explicit "Why AI Decided This" rationale in English
  rationaleFr?: string;   // Explicit "Why AI Decided This" rationale in French
}

export interface SystemSettingsConfig {
  email: {
    senderEmail: string;
    receiverEmail: string;
    smtpServer?: string;
    smtpPort?: number;
    smtpPassword?: string;
    alertRulesEnabled?: boolean;
    checkIntervalMinutes?: number;
  };
  ai: {
    provider?: 'Google Gemini AI' | 'Offline AI Simulation';
    model?: string;
    googleApiKey?: string;
    creativity?: number;
    maxTokens?: number;
  };
  alerts?: {
    lowStockThreshold: number;
    autoCheckIntervalMinutes: number;
    enableEmailNotifications: boolean;
  };
  thresholds?: {
    lowStockThreshold: number;
    criticalExpiryDays: number;
    defaultMarginTargetPercent: number;
  };
  general: {
    companyName: string;
    currency: CurrencyCode;
    language: LanguageCode;
  };
}
