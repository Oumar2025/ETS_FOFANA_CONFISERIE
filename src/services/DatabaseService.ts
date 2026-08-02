import { Product, SalesHistory, ExpiryAlert, SeasonalEvent, SystemSettingsConfig, UserAccount } from '../types';

const PRODUCTS_KEY = 'fof_ai_products';
const SALES_KEY = 'fof_ai_sales';
const EVENTS_KEY = 'fof_ai_events';
const ALERTS_KEY = 'fof_ai_alerts';
const SETTINGS_KEY = 'fof_ai_settings';
const USERS_KEY = 'fof_ai_users';

// Free Centralized Real-time Cloud Storage API Endpoint for multi-device live sync
const CLOUD_SYNC_ENDPOINT = 'https://fofana-confiserie-default-rtdb.firebaseio.com/db_state.json';

export const INITIAL_PRODUCTS: Product[] = [
  {
    product_id: 1,
    product_name: 'Oreo Original Chocolate Biscuits 154g',
    category: 'Biscuits',
    brand: 'Mondelez Turkey',
    supplier_country: 'Turkey',
    destination_country: 'Mali',
    quantity: 450,
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
    warehouse: 'Warehouse A (Bamako Central)',
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
    warehouse: 'Warehouse B (Kayes Depot)',
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
    destination_country: 'Mali',
    quantity: 1100,
    unit: 'Cartons',
    cost_price: 28.00,
    selling_price: 42.00,
    manufacture_date: '2026-05-01',
    expiry_date: '2027-05-01',
    warehouse: 'Warehouse A (Bamako Central)',
    status: 'In Stock',
    notes: 'Premium Brazilian chocolate gift boxes'
  },
  {
    product_id: 9,
    product_name: 'Ibon',
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
    warehouse: 'Warehouse B (Kayes Depot)',
    status: 'In Stock',
    notes: 'Imported for Burkina Faso regional network'
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
  constructor() {
    this.initDatabase();
    this.startCloudDatabaseSync();
  }

  private initDatabase() {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
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
    // Initial fetch from Cloud DB
    await this.fetchFromCloudDatabase();

    // Periodically sync live every 10 seconds
    setInterval(() => {
      this.fetchFromCloudDatabase();
    }, 10000);

    // Sync immediately when user switches tabs or focuses device screen
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.fetchFromCloudDatabase();
      });
    }
  }

  public async fetchFromCloudDatabase(): Promise<boolean> {
    try {
      const res = await fetch(CLOUD_SYNC_ENDPOINT, { method: 'GET' });
      if (res.ok) {
        const cloudState = await res.json();
        if (cloudState && typeof cloudState === 'object') {
          if (cloudState.products && Array.isArray(cloudState.products)) {
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(cloudState.products));
          }
          if (cloudState.users && Array.isArray(cloudState.users)) {
            localStorage.setItem(USERS_KEY, JSON.stringify(cloudState.users));
          }
          if (cloudState.events && Array.isArray(cloudState.events)) {
            localStorage.setItem(EVENTS_KEY, JSON.stringify(cloudState.events));
          }
          if (cloudState.alerts && Array.isArray(cloudState.alerts)) {
            localStorage.setItem(ALERTS_KEY, JSON.stringify(cloudState.alerts));
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
          }
          return true;
        }
      }
    } catch (err) {
      console.warn('[DatabaseService] Cloud fetch offline fallback:', err);
    }
    return false;
  }

  public async pushToCloudDatabase(): Promise<boolean> {
    try {
      const cloudState = {
        products: this.getProducts(),
        users: this.getUsers(),
        events: this.getSeasonalEvents(),
        alerts: this.getAlertHistory(),
        settings: this.getSettings(),
        lastUpdated: new Date().toISOString()
      };

      await fetch(CLOUD_SYNC_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_SEASONAL_EVENTS));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(ALERTS_KEY, JSON.stringify([]));
    this.pushToCloudDatabase();
  }
}

export const dbService = new DatabaseService();
