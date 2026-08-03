import { Product, SalesHistory, ExpiryAlert, SeasonalEvent, SystemSettingsConfig, UserAccount, Invoice, Customer, Supplier } from '../types';

const PRODUCTS_KEY = 'fof_ai_products';
const SALES_KEY = 'fof_ai_sales';
const INVOICES_KEY = 'fof_ai_invoices';
const CUSTOMERS_KEY = 'fof_ai_customers';
const SUPPLIERS_KEY = 'fof_ai_suppliers';
const EVENTS_KEY = 'fof_ai_events';
const ALERTS_KEY = 'fof_ai_alerts';
const SETTINGS_KEY = 'fof_ai_settings';
const USERS_KEY = 'fof_ai_users';

// Global Permanent Centralized Multi-Device Cloud Database (CORS-enabled for Netlify & Mobile Phones)
const CLOUD_SYNC_ENDPOINT = 'https://jsonblob.com/api/jsonBlob/019fc2e8-db7e-7666-bc54-b6a61a0c25d8';

export const INITIAL_PRODUCTS: Product[] = [
  {
    product_id: 1,
    product_name: 'Oreo Original Chocolate Biscuits 154g',
    category: 'Biscuits',
    brand: 'Mondelez Turkey',
    supplier_country: 'Turkey',
    destination_country: 'Mali',
    quantity: 750,
    unit: 'Cartons',
    cost_price: 18.50,
    selling_price: 26.00,
    manufacture_date: '2025-08-17',
    expiry_date: '2026-08-17',
    warehouse: 'Warehouse A (Bamako Central)',
    status: 'Approaching Expiry',
    notes: 'High demand item in Bamako retail markets'
  },
  {
    product_id: 2,
    product_name: 'Sultan Premium Deglet Noor Dates 500g',
    category: 'Dates',
    brand: 'Sultan Food Tunisia',
    supplier_country: 'Tunisia',
    destination_country: 'Mali',
    quantity: 1200,
    unit: 'Boxes',
    cost_price: 32.00,
    selling_price: 48.00,
    manufacture_date: '2026-01-10',
    expiry_date: '2027-01-10',
    warehouse: 'Warehouse A (Bamako Central)',
    status: 'In Stock',
    notes: 'Key product for upcoming Ramadan sales surge'
  },
  {
    product_id: 3,
    product_name: 'Atlas Wafer Deluxe Hazelnut 45g',
    category: 'Biscuits',
    brand: 'Atlas Confectionery Morocco',
    supplier_country: 'Morocco',
    destination_country: 'Burkina Faso',
    quantity: 80,
    unit: 'Cartons',
    cost_price: 12.00,
    selling_price: 17.50,
    manufacture_date: '2025-08-05',
    expiry_date: '2026-08-05',
    warehouse: 'Warehouse B (Kayes Depot)',
    status: 'Critical Stock',
    notes: 'Approaching expiration date in 3 days!'
  },
  {
    product_id: 4,
    product_name: 'Garoto Milk Chocolate Bonbons 1kg',
    category: 'Chocolates',
    brand: 'Garoto Brazil',
    supplier_country: 'Brazil',
    destination_country: "Côte d'Ivoire",
    quantity: 650,
    unit: 'Cartons',
    cost_price: 24.50,
    selling_price: 35.00,
    manufacture_date: '2025-09-01',
    expiry_date: '2026-09-01',
    warehouse: 'Warehouse C (Sikasso Hub)',
    status: 'Approaching Expiry',
    notes: 'Popular in Abidjan wholesale distribution'
  },
  {
    product_id: 5,
    product_name: 'Ülker Chocolate Halley Sandwich Cake',
    category: 'Chocolates',
    brand: 'Ülker Turkey',
    supplier_country: 'Turkey',
    destination_country: 'Mali',
    quantity: 890,
    unit: 'Cartons',
    cost_price: 20.00,
    selling_price: 29.50,
    manufacture_date: '2026-04-10',
    expiry_date: '2027-04-10',
    warehouse: 'Warehouse D (Bobo Central)',
    status: 'In Stock',
    notes: 'Consistent year-round sales'
  },
  {
    product_id: 6,
    product_name: 'Bambino Fruity Gummy Candies 250g',
    category: 'Candy',
    brand: 'Bambino Sweets Turkey',
    supplier_country: 'Turkey',
    destination_country: 'Angola',
    quantity: 35,
    unit: 'Cartons',
    cost_price: 8.50,
    selling_price: 13.00,
    manufacture_date: '2025-08-03',
    expiry_date: '2026-08-03',
    warehouse: 'Warehouse E (Ango Depot)',
    status: 'Critical Stock',
    notes: 'Requires immediate clearance sale'
  },
  {
    product_id: 7,
    product_name: 'Maghreb Honey Almond Chebakia 400g',
    category: 'Packaged Confectionery',
    brand: 'Maghreb Delights Morocco',
    supplier_country: 'Morocco',
    destination_country: 'Mali',
    quantity: 320,
    unit: 'Boxes',
    cost_price: 15.00,
    selling_price: 23.00,
    manufacture_date: '2025-08-25',
    expiry_date: '2026-08-25',
    warehouse: 'Warehouse A (Bamako Central)',
    status: 'Approaching Expiry',
    notes: 'Traditional confectionery item'
  },
  {
    product_id: 8,
    product_name: 'Lacta Sonho de Valsa Bonbons 1kg',
    category: 'Chocolates',
    brand: 'Lacta Mondelez Brazil',
    supplier_country: 'Brazil',
    destination_country: "Côte d'Ivoire",
    quantity: 1100,
    unit: 'Cartons',
    cost_price: 28.00,
    selling_price: 42.00,
    manufacture_date: '2026-05-01',
    expiry_date: '2027-05-01',
    warehouse: 'Warehouse F (Abidjan Hub)',
    status: 'In Stock',
    notes: 'Premium Brazilian chocolate gift boxes'
  },
  {
    product_id: 9,
    product_name: 'Ibon Fruity Sweets 200g',
    category: 'Candy',
    brand: 'Ibon Sweets Turkey',
    supplier_country: 'Turkey',
    destination_country: 'Burkina Faso',
    quantity: 300,
    unit: 'Cartons',
    cost_price: 20.00,
    selling_price: 30.00,
    manufacture_date: '2026-03-01',
    expiry_date: '2027-03-01',
    warehouse: 'Warehouse D (Bobo Central)',
    status: 'In Stock',
    notes: 'Imported for Burkina Faso regional network'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    customer_id: 1,
    name: 'ABC Trading SARL',
    company_name: 'ABC Trading Mali',
    country: 'Mali',
    email: 'contact@abctrading-mali.com',
    phone: '+223 76 12 34 56',
    total_orders: 14,
    total_spent: 38500.00,
    credit_limit: 50000.00,
    status: 'VIP'
  },
  {
    customer_id: 2,
    name: 'XYZ Distribution Market',
    company_name: 'XYZ Market Burkina Faso',
    country: 'Burkina Faso',
    email: 'procurement@xyzmarket-bf.com',
    phone: '+226 70 88 99 00',
    total_orders: 8,
    total_spent: 19400.00,
    credit_limit: 25000.00,
    status: 'Active'
  },
  {
    customer_id: 3,
    name: 'Bamako Central Retail Group',
    company_name: 'Retail Shop Mali',
    country: 'Mali',
    email: 'orders@bamakoretail.ml',
    phone: '+223 66 55 44 33',
    total_orders: 19,
    total_spent: 42100.00,
    credit_limit: 60000.00,
    status: 'VIP'
  },
  {
    customer_id: 4,
    name: 'Abidjan Grand Wholesale',
    company_name: 'Abidjan Confectionery Depot',
    country: "Côte d'Ivoire",
    email: 'sales@abidjanwholesale.ci',
    phone: '+225 07 44 33 22',
    total_orders: 6,
    total_spent: 22750.00,
    credit_limit: 30000.00,
    status: 'Active'
  },
  {
    customer_id: 5,
    name: 'Luanda Sweet Importers',
    company_name: 'Luanda Imports Angola',
    country: 'Angola',
    email: 'info@luandaimports.ao',
    phone: '+244 92 11 22 33',
    total_orders: 3,
    total_spent: 9800.00,
    credit_limit: 15000.00,
    status: 'Active'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    supplier_id: 1,
    supplier_name: 'Mondelez Gida Turkey',
    country: 'Turkey',
    contact_person: 'Ahmet Yilmaz',
    email: 'export@mondelez.tr',
    phone: '+90 212 555 0199',
    rating: 4.9,
    lead_time_days: 14,
    products_supplied: ['Oreo Original Chocolate Biscuits', 'Lacta Sonho de Valsa Bonbons']
  },
  {
    supplier_id: 2,
    supplier_name: 'Sultan Food & Dates Industries',
    country: 'Tunisia',
    contact_person: 'Tarek Ben Ali',
    email: 'sales@sultanfood.tn',
    phone: '+216 71 888 222',
    rating: 4.8,
    lead_time_days: 10,
    products_supplied: ['Sultan Premium Deglet Noor Dates']
  },
  {
    supplier_id: 3,
    supplier_name: 'Atlas Confectionery Morocco SA',
    country: 'Morocco',
    contact_person: 'Karim El Mansouri',
    email: 'contact@atlasconf.ma',
    phone: '+212 522 334455',
    rating: 4.7,
    lead_time_days: 12,
    products_supplied: ['Atlas Wafer Deluxe Hazelnut', 'Maghreb Honey Almond Chebakia']
  },
  {
    supplier_id: 4,
    supplier_name: 'Chocolates Garoto Brazil',
    country: 'Brazil',
    contact_person: 'Fernanda Silva',
    email: 'export@garoto.com.br',
    phone: '+55 27 3321 8000',
    rating: 4.6,
    lead_time_days: 22,
    products_supplied: ['Garoto Milk Chocolate Bonbons', 'Lacta Sonho de Valsa Bonbons']
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    invoice_id: 1,
    invoice_number: 'INV-2026-001',
    customer_id: 1,
    customer_name: 'ABC Trading SARL',
    customer_email: 'contact@abctrading-mali.com',
    customer_phone: '+223 76 12 34 56',
    destination_country: 'Mali',
    invoice_date: '2026-08-01',
    payment_method: 'Bank Transfer',
    items: [
      { product_id: 1, product_name: 'Oreo Original Chocolate Biscuits 154g', quantity: 250, unit_price: 26.00, total_price: 6500.00 },
      { product_id: 2, product_name: 'Sultan Premium Deglet Noor Dates 500g', quantity: 100, unit_price: 48.00, total_price: 4800.00 }
    ],
    subtotal: 11300.00,
    tax: 0,
    total_amount: 11300.00,
    status: 'Paid',
    notes: 'Delivered to Bamako Central Depot'
  },
  {
    invoice_id: 2,
    invoice_number: 'INV-2026-002',
    customer_id: 2,
    customer_name: 'XYZ Distribution Market',
    customer_email: 'procurement@xyzmarket-bf.com',
    customer_phone: '+226 70 88 99 00',
    destination_country: 'Burkina Faso',
    invoice_date: '2026-08-02',
    payment_method: 'Cash',
    items: [
      { product_id: 3, product_name: 'Atlas Wafer Deluxe Hazelnut 45g', quantity: 100, unit_price: 17.50, total_price: 1750.00 },
      { product_id: 9, product_name: 'Ibon Fruity Sweets 200g', quantity: 50, unit_price: 30.00, total_price: 1500.00 }
    ],
    subtotal: 3250.00,
    tax: 0,
    total_amount: 3250.00,
    status: 'Paid',
    notes: 'Shipped to Bobo Dioulasso Wholesale Network'
  },
  {
    invoice_id: 3,
    invoice_number: 'INV-2026-003',
    customer_id: 3,
    customer_name: 'Bamako Central Retail Group',
    customer_email: 'orders@bamakoretail.ml',
    customer_phone: '+223 66 55 44 33',
    destination_country: 'Mali',
    invoice_date: '2026-08-03',
    payment_method: 'Credit / Account',
    items: [
      { product_id: 7, product_name: 'Maghreb Honey Almond Chebakia 400g', quantity: 50, unit_price: 23.00, total_price: 1150.00 }
    ],
    subtotal: 1150.00,
    tax: 0,
    total_amount: 1150.00,
    status: 'Pending',
    notes: '15-day payment term'
  }
];

export const INITIAL_SALES_HISTORY: SalesHistory[] = [
  {
    sale_id: 1,
    invoice_number: 'INV-2026-001',
    product_id: 1,
    product_name: 'Oreo Original Chocolate Biscuits 154g',
    customer_name: 'ABC Trading SARL',
    destination_country: 'Mali',
    date: '2026-08-01',
    quantity_sold: 250,
    unit_price: 26.00,
    total_revenue: 6500.00
  },
  {
    sale_id: 2,
    invoice_number: 'INV-2026-001',
    product_id: 2,
    product_name: 'Sultan Premium Deglet Noor Dates 500g',
    customer_name: 'ABC Trading SARL',
    destination_country: 'Mali',
    date: '2026-08-01',
    quantity_sold: 100,
    unit_price: 48.00,
    total_revenue: 4800.00
  },
  {
    sale_id: 3,
    invoice_number: 'INV-2026-002',
    product_id: 3,
    product_name: 'Atlas Wafer Deluxe Hazelnut 45g',
    customer_name: 'XYZ Distribution Market',
    destination_country: 'Burkina Faso',
    date: '2026-08-02',
    quantity_sold: 100,
    unit_price: 17.50,
    total_revenue: 1750.00
  },
  {
    sale_id: 4,
    invoice_number: 'INV-2026-002',
    product_id: 9,
    product_name: 'Ibon Fruity Sweets 200g',
    customer_name: 'XYZ Distribution Market',
    destination_country: 'Burkina Faso',
    date: '2026-08-02',
    quantity_sold: 50,
    unit_price: 30.00,
    total_revenue: 1500.00
  },
  {
    sale_id: 5,
    invoice_number: 'INV-2026-003',
    product_id: 7,
    product_name: 'Maghreb Honey Almond Chebakia 400g',
    customer_name: 'Bamako Central Retail Group',
    destination_country: 'Mali',
    date: '2026-08-03',
    quantity_sold: 50,
    unit_price: 23.00,
    total_revenue: 1150.00
  }
];

export const INITIAL_SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    event_id: 1,
    event: 'Ramadan Season Preparation',
    category: 'Dates',
    start_date: '2027-02-01',
    end_date: '2027-03-22',
    demand_multiplier: 2.8,
    description: 'Surge in demand for dates and sweet confectionery across Mali and West Africa.'
  },
  {
    event_id: 2,
    event: 'Eid al-Fitr Celebration',
    category: 'Chocolates',
    start_date: '2027-03-23',
    end_date: '2027-04-05',
    demand_multiplier: 2.2,
    description: 'High festive demand for premium chocolate boxes and gift candy.'
  },
  {
    event_id: 3,
    event: 'Back-to-School Season',
    category: 'Biscuits',
    start_date: '2026-09-01',
    end_date: '2026-10-15',
    demand_multiplier: 1.5,
    description: 'Increased snack consumption among students and retail shops.'
  },
  {
    event_id: 4,
    event: 'New Year & End of Year Holidays',
    category: 'Candy',
    start_date: '2026-12-15',
    end_date: '2027-01-05',
    demand_multiplier: 1.75,
    description: 'Year-end holiday demand for assorted candies and wafers.'
  }
];

export const DEFAULT_SETTINGS: SystemSettingsConfig = {
  ai: {
    googleApiKey: 'AQ.Ab8RNwYApfViNN6-CutkyG6oDW0voXZQ',
    provider: 'Google Gemini AI',
    model: 'gemini-1.5-flash',
    creativity: 0.7,
    maxTokens: 1024
  },
  email: {
    senderEmail: 'hp.oumaroulife2023@gmail.com',
    smtpPassword: 'usnlfnwdlutaj',
    receiverEmail: 'f.oumarou78@gmail.com',
    alertRulesEnabled: true,
    checkIntervalMinutes: 60
  },
  thresholds: {
    lowStockThreshold: 300,
    criticalExpiryDays: 30,
    defaultMarginTargetPercent: 35
  },
  general: {
    companyName: 'ETS FOFANA CONFISERIE',
    currency: 'USD',
    language: 'en'
  }
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 1,
    username: 'admin',
    passwordHash: 'fofana2026',
    role: 'Administrator',
    fullName: 'FOFANA OUMAROU',
    email: 'hp.oumaroulife2023@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01'
  },
  {
    id: 2,
    username: 'gm_fofana',
    passwordHash: 'Fofana@2026!',
    role: 'General Manager',
    fullName: 'Oumarou Fofana',
    email: 'f.oumarou78@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-05'
  }
];

export class DatabaseService {
  private isSyncing = false;

  constructor() {
    this.initDatabase();
    this.startCloudDatabaseSync();
  }

  private initDatabase() {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(INVOICES_KEY)) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(INITIAL_INVOICES));
    }
    if (!localStorage.getItem(SALES_KEY)) {
      localStorage.setItem(SALES_KEY, JSON.stringify(INITIAL_SALES_HISTORY));
    }
    if (!localStorage.getItem(CUSTOMERS_KEY)) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(SUPPLIERS_KEY)) {
      localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(INITIAL_SUPPLIERS));
    }
    if (!localStorage.getItem(EVENTS_KEY)) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_SEASONAL_EVENTS));
    }
    if (!localStorage.getItem(SETTINGS_KEY)) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
  }

  // --- Real-time Centralized Cloud Database Sync across all Phones, Tablets & Laptops ---
  private async startCloudDatabaseSync() {
    await this.fetchFromCloudDatabase();

    setInterval(() => {
      this.fetchFromCloudDatabase();
    }, 5000);

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.fetchFromCloudDatabase();
      });
    }
  }

  public async fetchFromCloudDatabase(): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;
    try {
      const res = await fetch(CLOUD_SYNC_ENDPOINT, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const cloudState = await res.json();
        if (cloudState && typeof cloudState === 'object') {
          let hasUpdated = false;

          if (cloudState.products && Array.isArray(cloudState.products) && cloudState.products.length > 0) {
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(cloudState.products));
            hasUpdated = true;
          }
          if (cloudState.invoices && Array.isArray(cloudState.invoices)) {
            localStorage.setItem(INVOICES_KEY, JSON.stringify(cloudState.invoices));
            hasUpdated = true;
          }
          if (cloudState.sales && Array.isArray(cloudState.sales)) {
            localStorage.setItem(SALES_KEY, JSON.stringify(cloudState.sales));
            hasUpdated = true;
          }
          if (cloudState.customers && Array.isArray(cloudState.customers)) {
            localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(cloudState.customers));
            hasUpdated = true;
          }
          if (cloudState.suppliers && Array.isArray(cloudState.suppliers)) {
            localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(cloudState.suppliers));
            hasUpdated = true;
          }
          if (cloudState.users && Array.isArray(cloudState.users) && cloudState.users.length > 0) {
            localStorage.setItem(USERS_KEY, JSON.stringify(cloudState.users));
            hasUpdated = true;
          }
          if (cloudState.events && Array.isArray(cloudState.events) && cloudState.events.length > 0) {
            localStorage.setItem(EVENTS_KEY, JSON.stringify(cloudState.events));
            hasUpdated = true;
          }
          if (cloudState.alerts && Array.isArray(cloudState.alerts)) {
            localStorage.setItem(ALERTS_KEY, JSON.stringify(cloudState.alerts));
            hasUpdated = true;
          }
          if (cloudState.settings && typeof cloudState.settings === 'object') {
            const merged = {
              ...DEFAULT_SETTINGS,
              ...cloudState.settings,
              general: { ...DEFAULT_SETTINGS.general, ...(cloudState.settings.general || {}) },
              ai: { ...DEFAULT_SETTINGS.ai, ...(cloudState.settings.ai || {}) },
              email: { ...DEFAULT_SETTINGS.email, ...(cloudState.settings.email || {}) }
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
            hasUpdated = true;
          }

          this.isSyncing = false;
          return hasUpdated;
        } else {
          await this.pushToCloudDatabase();
        }
      }
    } catch (err) {
      console.warn('[DatabaseService] Cloud fetch fallback:', err);
    }
    this.isSyncing = false;
    return false;
  }

  public async pushToCloudDatabase(): Promise<boolean> {
    try {
      const cloudState = {
        products: this.getProducts(),
        invoices: this.getInvoices(),
        sales: this.getSalesHistory(),
        customers: this.getCustomers(),
        suppliers: this.getSuppliers(),
        users: this.getUsers(),
        events: this.getSeasonalEvents(),
        alerts: this.getAlertHistory(),
        settings: this.getSettings(),
        lastUpdated: new Date().toISOString()
      };

      await fetch(CLOUD_SYNC_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cloudState)
      });
      return true;
    } catch (err) {
      console.warn('[DatabaseService] Cloud push error:', err);
      return false;
    }
  }

  // --- Products CRUD ---
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public saveProducts(products: Product[]) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    this.pushToCloudDatabase();
  }

  public addProduct(product: Omit<Product, 'product_id' | 'status'>): Product {
    const products = this.getProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.product_id)) + 1 : 1;

    const now = new Date();
    const exp = new Date(product.expiry_date);
    const daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: Product['status'] = 'In Stock';
    if (daysRemaining <= 0) status = 'Expired';
    else if (daysRemaining <= 7) status = 'Approaching Expiry';
    else if (daysRemaining <= 30) status = 'Approaching Expiry';
    else if (product.quantity < 100) status = 'Critical Stock';
    else if (product.quantity < 300) status = 'Low Stock';

    const newProduct: Product = {
      ...product,
      product_id: newId,
      status
    };

    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  public updateProduct(id: number, updated: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.product_id === id);
    if (index === -1) return null;

    const current = products[index];
    const merged = { ...current, ...updated };

    if (updated.expiry_date || updated.quantity !== undefined) {
      const now = new Date();
      const exp = new Date(merged.expiry_date);
      const daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) merged.status = 'Expired';
      else if (daysRemaining <= 7) merged.status = 'Approaching Expiry';
      else if (daysRemaining <= 30) merged.status = 'Approaching Expiry';
      else if (merged.quantity < 100) merged.status = 'Critical Stock';
      else if (merged.quantity < 300) merged.status = 'Low Stock';
      else merged.status = 'In Stock';
    }

    products[index] = merged;
    this.saveProducts(products);
    return merged;
  }

  public deleteProduct(id: number): boolean {
    let products = this.getProducts();
    const len = products.length;
    products = products.filter(p => p.product_id !== id);
    if (products.length < len) {
      this.saveProducts(products);
      return true;
    }
    return false;
  }

  // --- Invoices & Sales History Engine (AUTOMATIC INVENTORY DEDUCTION) ---
  public getInvoices(): Invoice[] {
    try {
      const data = localStorage.getItem(INVOICES_KEY);
      return data ? JSON.parse(data) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  }

  public getSalesHistory(): SalesHistory[] {
    try {
      const data = localStorage.getItem(SALES_KEY);
      return data ? JSON.parse(data) : INITIAL_SALES_HISTORY;
    } catch {
      return INITIAL_SALES_HISTORY;
    }
  }

  public saveInvoices(invoices: Invoice[]) {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    this.pushToCloudDatabase();
  }

  public saveSalesHistory(sales: SalesHistory[]) {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
    this.pushToCloudDatabase();
  }

  // CORE BUSINESS ENGINE: Generate Invoice + Automatic Stock Deduction + Sales History + CRM update
  public createInvoice(invoiceData: Omit<Invoice, 'invoice_id' | 'invoice_number'>): Invoice {
    const invoices = this.getInvoices();
    const salesHistory = this.getSalesHistory();
    const products = this.getProducts();
    const customers = this.getCustomers();

    const newInvoiceId = invoices.length > 0 ? Math.max(...invoices.map(i => i.invoice_id)) + 1 : 1;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(newInvoiceId).padStart(3, '0')}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      invoice_id: newInvoiceId,
      invoice_number: invoiceNumber
    };

    invoices.unshift(newInvoice);
    this.saveInvoices(invoices);

    // 1. AUTOMATIC STOCK DEDUCTION (e.g. 1000 - 250 = 750 Cartons)
    newInvoice.items.forEach(item => {
      const product = products.find(p => p.product_id === item.product_id);
      if (product) {
        product.quantity = Math.max(0, product.quantity - item.quantity);
        // Recalculate status
        const now = new Date();
        const exp = new Date(product.expiry_date);
        const daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 0) product.status = 'Expired';
        else if (daysRemaining <= 7 || daysRemaining <= 30) product.status = 'Approaching Expiry';
        else if (product.quantity < 100) product.status = 'Critical Stock';
        else if (product.quantity < 300) product.status = 'Low Stock';
        else product.status = 'In Stock';

        // 2. AUTOMATIC SALES HISTORY RECORDING
        const newSaleId = salesHistory.length > 0 ? Math.max(...salesHistory.map(s => s.sale_id)) + 1 : 1;
        salesHistory.unshift({
          sale_id: newSaleId,
          invoice_number: invoiceNumber,
          product_id: item.product_id,
          product_name: item.product_name,
          customer_name: newInvoice.customer_name,
          destination_country: newInvoice.destination_country,
          date: newInvoice.invoice_date,
          quantity_sold: item.quantity,
          unit_price: item.unit_price,
          total_revenue: item.total_price
        });
      }
    });

    this.saveProducts(products);
    this.saveSalesHistory(salesHistory);

    // 3. AUTOMATIC CUSTOMER CRM SPENDING UPDATE
    const customer = customers.find(c => c.customer_id === newInvoice.customer_id || c.name.toLowerCase() === newInvoice.customer_name.toLowerCase());
    if (customer) {
      customer.total_orders += 1;
      customer.total_spent += newInvoice.total_amount;
      if (customer.total_spent > 30000) customer.status = 'VIP';
      this.saveCustomers(customers);
    }

    this.pushToCloudDatabase();
    return newInvoice;
  }

  // --- Customers (CRM) ---
  public getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  public saveCustomers(customers: Customer[]) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    this.pushToCloudDatabase();
  }

  public addCustomer(customer: Omit<Customer, 'customer_id' | 'total_orders' | 'total_spent'>): Customer {
    const customers = this.getCustomers();
    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.customer_id)) + 1 : 1;
    const newCust: Customer = {
      ...customer,
      customer_id: newId,
      total_orders: 0,
      total_spent: 0
    };
    customers.push(newCust);
    this.saveCustomers(customers);
    return newCust;
  }

  // --- Suppliers ---
  public getSuppliers(): Supplier[] {
    try {
      const data = localStorage.getItem(SUPPLIERS_KEY);
      return data ? JSON.parse(data) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  }

  public saveSuppliers(suppliers: Supplier[]) {
    localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
    this.pushToCloudDatabase();
  }

  // --- Users & RBAC ---
  public getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  public saveUsers(users: UserAccount[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.pushToCloudDatabase();
  }

  public authenticateUser(username: string, passwordPlain: string): UserAccount | null {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase().trim() === username.toLowerCase().trim());
    if (user && user.passwordHash === passwordPlain) {
      return user;
    }
    return null;
  }

  public saveUser(user: Omit<UserAccount, 'id' | 'createdAt'>): { success: boolean; error?: string } {
    const users = this.getUsers();
    if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase())) {
      return { success: false, error: 'Username is already taken.' };
    }
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return { success: false, error: 'Email address is already registered.' };
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => Number(u.id) || 0)) + 1 : 1;
    const newUser: UserAccount = {
      ...user,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true };
  }

  public deleteUser(usernameToDelete: string, requestingUserRole: string): { success: boolean; error?: string } {
    if (requestingUserRole !== 'Administrator') {
      return { success: false, error: 'Access Denied: Only Administrators can delete registered user accounts.' };
    }
    if (usernameToDelete.toLowerCase() === 'admin') {
      return { success: false, error: 'Root admin account cannot be deleted.' };
    }

    let users = this.getUsers();
    const initialLen = users.length;
    users = users.filter(u => u.username.toLowerCase() !== usernameToDelete.toLowerCase());
    
    if (users.length < initialLen) {
      this.saveUsers(users);
      return { success: true };
    }
    return { success: false, error: 'User not found.' };
  }

  public updateUserProfile(username: string, updates: Partial<UserAccount>): { success: boolean } {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      Object.assign(user, updates);
      this.saveUsers(users);
      return { success: true };
    }
    return { success: false };
  }

  public validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long.' };
    }
    return { valid: true };
  }

  // --- Seasonal Events ---
  public getSeasonalEvents(): SeasonalEvent[] {
    try {
      const data = localStorage.getItem(EVENTS_KEY);
      return data ? JSON.parse(data) : INITIAL_SEASONAL_EVENTS;
    } catch {
      return INITIAL_SEASONAL_EVENTS;
    }
  }

  public saveSeasonalEvents(events: SeasonalEvent[]) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    this.pushToCloudDatabase();
  }

  // --- Alert History ---
  public getAlertHistory(): ExpiryAlert[] {
    try {
      const data = localStorage.getItem(ALERTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveAlertHistory(alerts: ExpiryAlert[]) {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    this.pushToCloudDatabase();
  }

  // --- System Settings ---
  public getSettings(): SystemSettingsConfig {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      const parsed = data ? JSON.parse(data) : DEFAULT_SETTINGS;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        general: { ...DEFAULT_SETTINGS.general, ...(parsed.general || {}) },
        ai: { ...DEFAULT_SETTINGS.ai, ...(parsed.ai || {}) },
        email: { ...DEFAULT_SETTINGS.email, ...(parsed.email || {}) }
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: SystemSettingsConfig) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    this.pushToCloudDatabase();
  }

  public resetToSeed() {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(INVOICES_KEY, JSON.stringify(INITIAL_INVOICES));
    localStorage.setItem(SALES_KEY, JSON.stringify(INITIAL_SALES_HISTORY));
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(INITIAL_SUPPLIERS));
    localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_SEASONAL_EVENTS));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(ALERTS_KEY, JSON.stringify([]));
    this.pushToCloudDatabase();
  }
}

export const dbService = new DatabaseService();
