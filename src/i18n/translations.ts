import { LanguageCode, CurrencyCode } from '../types';

export const countryFlags: Record<string, string> = {
  'Turkey': '🇹🇷',
  'Morocco': '🇲🇦',
  'Tunisia': '🇹🇳',
  'Brazil': '🇧🇷',
  'Mali': '🇲🇱',
  'Burkina Faso': '🇧🇫',
  "Côte d'Ivoire": '🇨🇮',
  'Angola': '🇦🇴'
};

export function getCountryFlag(countryName: string): string {
  return countryFlags[countryName] || '🌐';
}

export function formatCountryWithFlag(countryName: string): string {
  const flag = getCountryFlag(countryName);
  return `${flag} ${countryName}`;
}

export const currencyRates: Record<CurrencyCode, { symbol: string; rateFromUSD: number; name: string }> = {
  USD: { symbol: '$', rateFromUSD: 1, name: 'US Dollar' },
  FCFA: { symbol: 'FCFA ', rateFromUSD: 600, name: 'Franc CFA (XOF)' },
  EUR: { symbol: '€', rateFromUSD: 0.92, name: 'Euro' },
  TRY: { symbol: '₺', rateFromUSD: 33.0, name: 'Turkish Lira' }
};

export function formatPrice(amountInUSD: number, currency: CurrencyCode): string {
  const info = currencyRates[currency] || currencyRates.USD;
  const converted = amountInUSD * info.rateFromUSD;

  if (currency === 'FCFA') {
    return `${Math.round(converted).toLocaleString()} FCFA`;
  }
  if (currency === 'EUR') {
    return `€${converted.toFixed(2)}`;
  }
  if (currency === 'TRY') {
    return `₺${converted.toFixed(2)}`;
  }
  return `$${converted.toFixed(2)}`;
}

export const translations = {
  en: {
    // Navigation
    home: 'Home Page',
    dashboard: 'Dashboard',
    inventory: 'Inventory Management',
    salesInvoice: 'Sales & Invoice Management',
    customers: 'Customer CRM',
    suppliers: 'Supplier Directory',
    forecast: 'Demand Forecasting',
    assistant: 'AI Business Assistant',
    alerts: 'Alert Center',
    reports: 'Executive Reports',
    settings: 'System Settings',
    signOut: 'Sign Out',
    
    // Header & User
    welcome: 'Welcome,',
    administrator: 'Administrator',
    generalManager: 'General Manager',
    checkAlerts: 'Check & Send Alerts',

    // Home Page
    heroTitle: 'FOF-AI — Artificial Intelligence Business Intelligence Assistant',
    heroDesc: 'Welcome to the internal decision support platform for ETS FOFANA CONFISERIE. FOF-AI provides executive management with real-time inventory monitoring, sales invoicing, demand forecasting, seasonal multiplier analysis, automated milestone email alerts, and interactive AI consultation.',
    supplierCountries: 'Supplier Countries',
    destinationCountries: 'Destination Countries',
    enterpriseModules: 'Enterprise System Modules',

    // Dashboard & CEO KPIs
    dashTitle: 'Executive Dashboard (CEO View)',
    dashSubtitle: 'Real-time sales, inventory intelligence & demand forecasts for ETS FOFANA CONFISERIE',
    totalManagedProducts: 'Total Managed Products',
    totalInventoryValue: 'Total Inventory Valuation',
    expiringAlerts: 'Active Expiry Alerts',
    overallStockHealth: 'Overall Stock Health',
    todaysSales: "Today's Sales",
    weeklyRevenue: 'Weekly Revenue',
    monthlyRevenue: 'Monthly Revenue',
    bestSelling: 'Best Selling Product',
    worstSelling: 'Worst Selling Product',
    netProfit: 'Net Profit Margin',
    unitsSold: 'Total Units Sold',
    invoicesToday: 'Invoices Issued Today',
    topCustomer: 'Top VIP Customer',
    stockRemaining: 'Remaining Stock',
    productsSoldToday: 'Products Sold Today',
    healthy: 'Healthy',
    needsAttention: 'Needs Attention',
    critical: 'Critical',
    stockDistribution: 'Category Volume Distribution',
    supplierShare: 'Stock Share by Supplier Country',
    expiringSoon: 'Products Expiring Within 30 Days',
    actionPlan: 'AI Weekly Business Action Plan',
    whyAiDecidedThis: 'Why AI Decided This (Business Rationale):',

    // Sales & Invoice Page
    salesInvoiceTitle: 'Sales & Invoice Management',
    salesInvoiceSubtitle: 'Issue sales invoices with automatic inventory stock deduction, sales history tracking & customer CRM',
    createInvoiceTab: 'Create Sales Invoice',
    salesHistoryTab: 'Sales History',
    customerCrmTab: 'Customer CRM Directory',
    customerName: 'Customer Name',
    invoiceNumber: 'Invoice Number',
    invoiceDate: 'Invoice Date',
    paymentMethod: 'Payment Method',
    selectProduct: 'Select Product to Sell',
    qtyToSell: 'Quantity to Sell',
    unitPrice: 'Unit Price',
    subtotal: 'Subtotal',
    addItem: 'Add Item to Invoice',
    generateInvoice: 'Generate Invoice & Deduct Stock',
    printPdf: 'Print PDF Document',
    sendEmail: 'Send Invoice Email',
    saveDraft: 'Save Invoice Record',
    automaticDeductionNotice: 'Note: Generating an invoice automatically subtracts sold items from warehouse stock and records entries in Sales History.',

    // Inventory Page
    addNewProduct: 'Add New Product',
    editProduct: 'Edit Product',
    searchPlaceholder: 'Search product, brand, origin, destination...',
    allCategories: 'All Categories',
    allSuppliers: 'All Suppliers',
    allDestinations: 'All Destinations',
    productName: 'Product Name',
    category: 'Category',
    originMarket: 'Origin → Market',
    qtyUnit: 'Qty & Unit',
    price: 'Price',
    expiryDate: 'Expiry Date',
    status: 'Status',
    actions: 'Actions',
    aiAnalysisPanel: 'AI Product Analysis',
    healthTab: 'Health',
    explainerTab: 'Explainer',
    promoTab: 'Promo',
    importTab: 'Import',
    simulateTab: 'Simulate',
    
    // Forecast Page
    forecastTitle: 'Demand Forecasting',
    forecastSubtitle: 'Predictive AI algorithms evaluating historical sales averages & seasonal multipliers',
    activeMultipliers: 'Active Seasonal Demand Multipliers (Ramadan & Holidays)',
    forecastTableTitle: 'Product Demand Predictions & Import Recommendations',
    currentStock: 'Current Stock',
    histMonthlyAvg: 'Hist. Monthly Avg',
    seasonalEvent: 'Seasonal Event',
    expectedDemand: 'Expected Demand',
    recImportQty: 'Rec. Import Qty',
    aiInterpretation: 'AI Interpretation',

    // Alert Center Page
    alertCenterTitle: 'Smart Expiry Alert Center',
    alertCenterSubtitle: 'Milestone rules (30/15/7/3/1 days), duplicate email suppression & alert logs',
    scanAlertsBtn: 'Run Scan & Send Email Alerts',
    statusFilter: 'Status:',
    milestoneFilter: 'Milestone:',
    noAlerts: 'No Expiry Alerts Found',
    daysRemaining: 'DAYS REMAINING',
    emailLog: 'Email Notification Log',
    previewEmail: 'Preview Email',
    launchPromo: 'Launch Promo Discount',
    markResolved: 'Mark Resolved',

    // Executive Reports Page
    reportTitle: 'Executive Business Intelligence Report',
    reportSubtitle: 'ETS FOFANA CONFISERIE • Official Managerial Audit Document',
    exportCsv: 'Export CSV',
    costValue: 'Inventory Cost Value',
    revenueValue: 'Projected Revenue Value',
    grossProfit: 'Projected Gross Profit',
    managedLines: 'Total Managed Lines',
    masterAuditTitle: 'Master Inventory Audit Sheet',

    // Modal Form
    registerNewItem: 'Register New Inventory Item',
    editInventoryItem: 'Edit Inventory Item',
    unit: 'Unit',
    cartons: 'Cartons',
    boxes: 'Boxes',
    pallets: 'Pallets',
    costPrice: 'Cost Price',
    sellingPrice: 'Selling Price',
    manufactureDate: 'Manufacture Date',
    warehouse: 'Warehouse',
    saveProduct: 'Save Product',
    cancel: 'Cancel',

    // Member Management & Settings
    registeredMembers: 'Registered Manager Accounts & Roles (RBAC)',
    deleteUser: 'Delete Account',
    adminOnlyDeleteNote: '* Only Administrators have permission to revoke or delete registered manager accounts.',
    profilePicture: 'Profile Picture / Avatar',
    uploadAvatar: 'Upload Profile Image',
    languageSetting: 'System Language',
    currencySetting: 'Display Currency',
    english: 'English (EN)',
    french: 'French (FR - Français)',

    // Auth & Password Recovery
    signIn: 'Sign In',
    registerManager: 'Register Manager',
    forgotPassword: 'Forgot Password / Username?',
    recoverTitle: 'Recover Account Credentials',
    enterWorkEmail: 'Enter your registered work email address to reset your password:',
    resetPasswordBtn: 'Reset & Set New Password',
    newPasswordLabel: 'New Strong Password:',
    backToLogin: 'Back to Sign In'
  },
  fr: {
    // Navigation
    home: 'Page d\'Accueil',
    dashboard: 'Tableau de Bord Exécutif',
    inventory: 'Gestion des Stocks',
    salesInvoice: 'Gestion des Ventes & Factures',
    customers: 'Répertoire Clients CRM',
    suppliers: 'Répertoire Fournisseurs',
    forecast: 'Prévision de la Demande',
    assistant: 'Assistant IA d\'Affaires',
    alerts: 'Centre d\'Alertes',
    reports: 'Rapports Exécutifs',
    settings: 'Paramètres Système',
    signOut: 'Déconnexion',

    // Header & User
    welcome: 'Bienvenue,',
    administrator: 'Administrateur',
    generalManager: 'Directeur Général',
    checkAlerts: 'Vérifier & Envoyer les Alertes',

    // Home Page
    heroTitle: 'FOF-AI — Assistant d\'Intelligence d\'Affaires par IA',
    heroDesc: 'Bienvenue sur la plateforme d\'aide à la décision pour ETS FOFANA CONFISERIE. FOF-AI offre à la direction générale une gestion des ventes, factures avec déduction automatique des stocks, prévisions de demande et recommandations IA.',
    supplierCountries: 'Pays Fournisseurs',
    destinationCountries: 'Pays de Destination',
    enterpriseModules: 'Modules Système Entreprise',

    // Dashboard & CEO KPIs
    dashTitle: 'Tableau de Bord Exécutif (Vue PDG)',
    dashSubtitle: 'Ventes en temps réel, intelligence des stocks & prévisions de demande pour ETS FOFANA CONFISERIE',
    totalManagedProducts: 'Produits Gérés au Total',
    totalInventoryValue: 'Valeur Totale du Stock',
    expiringAlerts: 'Alertes de Péremption Actives',
    overallStockHealth: 'Santé Globale des Stocks',
    todaysSales: 'Ventes d\'Aujourd\'hui',
    weeklyRevenue: 'Chiffre d\'Affaires Hebdomadaire',
    monthlyRevenue: 'Chiffre d\'Affaires Mensuel',
    bestSelling: 'Produit le Plus Vendu',
    worstSelling: 'Produit le Moins Vendu',
    netProfit: 'Marge Bénéficiaire Nette',
    unitsSold: 'Total Unités Vendues',
    invoicesToday: 'Factures Émises Aujourd\'hui',
    topCustomer: 'Meilleur Client VIP',
    stockRemaining: 'Stock Restant',
    productsSoldToday: 'Produits Vendus Aujourd\'hui',
    healthy: 'En Bonne Santé',
    needsAttention: 'Attention Requise',
    critical: 'Critique',
    stockDistribution: 'Répartition du Volume par Catégorie',
    supplierShare: 'Part de Stock par Pays Fournisseur',
    expiringSoon: 'Produits Expirant sous 30 Jours',
    actionPlan: 'Plan d\'Action Hebdomadaire IA',
    whyAiDecidedThis: 'Pourquoi l\'IA a décidé cela (Justification Décisionnelle) :',

    // Sales & Invoice Page
    salesInvoiceTitle: 'Gestion des Ventes & Facturation',
    salesInvoiceSubtitle: 'Émission de factures de vente avec déduction automatique des stocks, suivi de l\'historique et CRM clients',
    createInvoiceTab: 'Créer une Facture de Vente',
    salesHistoryTab: 'Historique des Ventes',
    customerCrmTab: 'Répertoire Clients CRM',
    customerName: 'Nom du Client',
    invoiceNumber: 'Numéro de Facture',
    invoiceDate: 'Date de la Facture',
    paymentMethod: 'Mode de Paiement',
    selectProduct: 'Sélectionner le Produit à Vendre',
    qtyToSell: 'Quantité à Vendre',
    unitPrice: 'Prix Unitaire',
    subtotal: 'Sous-total',
    addItem: 'Ajouter l\'Article à la Facture',
    generateInvoice: 'Générer Facture & Déduire le Stock',
    printPdf: 'Imprimer en Document PDF',
    sendEmail: 'Envoyer Facture par Email',
    saveDraft: 'Enregistrer la Facture',
    automaticDeductionNotice: 'Note : La génération d\'une facture déduit automatiquement les quantités vendues du stock en entrepôt et met à jour l\'historique des ventes.',

    // Inventory Page
    addNewProduct: 'Ajouter un Produit',
    editProduct: 'Modifier le Produit',
    searchPlaceholder: 'Rechercher produit, marque, origine, destination...',
    allCategories: 'Toutes les Catégories',
    allSuppliers: 'Tous les Fournisseurs',
    allDestinations: 'Toutes les Destinations',
    productName: 'Nom du Produit',
    category: 'Catégorie',
    originMarket: 'Origine → Marché',
    qtyUnit: 'Qté & Unité',
    price: 'Prix',
    expiryDate: 'Date d\'Expiration',
    status: 'Statut',
    actions: 'Actions',
    aiAnalysisPanel: 'Analyse IA du Produit',
    healthTab: 'Santé',
    explainerTab: 'Explication',
    promoTab: 'Promo',
    importTab: 'Importation',
    simulateTab: 'Simulation',

    // Forecast Page
    forecastTitle: 'Prévision de la Demande',
    forecastSubtitle: 'Algorithmes IA prédictifs évaluant les moyennes de ventes et coefficients saisonniers',
    activeMultipliers: 'Coefficients Saisonniers Actifs (Ramadan & Fêtes)',
    forecastTableTitle: 'Prédictions de Demande & Recommandations d\'Importation',
    currentStock: 'Stock Actuel',
    histMonthlyAvg: 'Moy. Mensuelle Hist.',
    seasonalEvent: 'Événement Saisonnier',
    expectedDemand: 'Demande Prévue',
    recImportQty: 'Qté Import Rec.',
    aiInterpretation: 'Interprétation IA',

    // Alert Center Page
    alertCenterTitle: 'Centre d\'Alertes Intelligentes',
    alertCenterSubtitle: 'Règles d\'échéance (30/15/7/3/1 jours), suppression des doublons et journaux d\'alertes',
    scanAlertsBtn: 'Lancer Analyse & Envoyer Alertes Email',
    statusFilter: 'Statut:',
    milestoneFilter: 'Échéance:',
    noAlerts: 'Aucune Alerte de Péremption',
    daysRemaining: 'JOURS RESTANTS',
    emailLog: 'Journal des Notifications Email',
    previewEmail: 'Aperçu de l\'Email',
    launchPromo: 'Lancer Promo Réduction',
    markResolved: 'Marquer comme Résolu',

    // Executive Reports Page
    reportTitle: 'Rapport Exécutif d\'Intelligence d\'Affaires',
    reportSubtitle: 'ETS FOFANA CONFISERIE • Document d\'Audit Managérial Officiel',
    exportCsv: 'Exporter en CSV',
    costValue: 'Valeur d\'Achat des Stocks',
    revenueValue: 'Valeur de Vente Projetée',
    grossProfit: 'Marge Brute Projetée',
    managedLines: 'Lignes Gérées au Total',
    masterAuditTitle: 'Feuille d\'Audit Général des Stocks',

    // Modal Form
    registerNewItem: 'Enregistrer un Nouveau Produit',
    editInventoryItem: 'Modifier la Fiche Produit',
    unit: 'Unité',
    cartons: 'Cartons',
    boxes: 'Boîtes',
    pallets: 'Palettes',
    costPrice: 'Prix d\'Achat',
    sellingPrice: 'Prix de Vente',
    manufactureDate: 'Date de Fabrication',
    warehouse: 'Entrepôt',
    saveProduct: 'Enregistrer',
    cancel: 'Annuler',

    // Member Management & Settings
    registeredMembers: 'Comptes et Rôles des Gestionnaires (RBAC)',
    deleteUser: 'Supprimer le Compte',
    adminOnlyDeleteNote: '* Seuls les Administrateurs ont la permission de supprimer des comptes de gestionnaires.',
    profilePicture: 'Photo de Profil / Avatar',
    uploadAvatar: 'Changer la Photo de Profil',
    languageSetting: 'Langue du Système',
    currencySetting: 'Devise d\'Affichage',
    english: 'Anglais (EN)',
    french: 'Français (FR)',

    // Auth & Password Recovery
    signIn: 'Se Connecter',
    registerManager: 'S\'inscrire comme Gestionnaire',
    forgotPassword: 'Mot de passe ou identifiant oublié ?',
    recoverTitle: 'Récupération du Compte',
    enterWorkEmail: 'Entrez votre adresse email professionnelle enregistrée pour réinitialiser le mot de passe :',
    resetPasswordBtn: 'Réinitialiser & Créer Nouveau Mot de Passe',
    newPasswordLabel: 'Nouveau Mot de Passe Sécurisé :',
    backToLogin: 'Retour à la Connexion'
  }
};
