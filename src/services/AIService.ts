import { Product, Invoice, Customer, Supplier, SalesHistory, ExpiryAlert, DemandForecast, SeasonalEvent, AIProductAnalysis, AIPromotionAdvice, AIImportAdvice, DecisionSimulationResult, WeeklyActionPlanDay } from '../types';
import { dbService } from './DatabaseService';
import { forecastService } from './ForecastService';

/**
 * 🎯 User Intent Taxonomy (Module Context)
 */
export type UserIntent =
  | 'IDENTITY'
  | 'OVERSTOCK_ANALYSIS'
  | 'DISCOUNT_RECOMMENDATIONS'
  | 'PROFIT_IMPROVEMENT'
  | 'CUSTOMER_DISCOUNT_ANALYSIS'
  | 'SUPPLIER_RELIABILITY_ANALYSIS'
  | 'INVOICES'
  | 'CUSTOMERS'
  | 'INVENTORY'
  | 'EXPIRY'
  | 'SUPPLIERS'
  | 'FORECASTS'
  | 'EXECUTIVE';

/**
 * 📊 Question Type Taxonomy (Analytical Operation)
 */
export type QuestionType =
  | 'FILTER'
  | 'SUM_AGGREGATION'
  | 'MAX_MIN_RANKING'
  | 'GROUP_BY_ANALYTICS'
  | 'COMPARE'
  | 'RECOMMENDATION'
  | 'RISK_ANALYSIS'
  | 'IDENTITY';

/**
 * 🔍 Intent Detector Class
 */
export class IntentDetector {
  public static detectIntent(query: string): UserIntent {
    const q = query.toLowerCase().trim();

    if (
      q.includes('who is the admin') ||
      q.includes('who is admin') ||
      q.includes('qui est l\'admin') ||
      q.includes('qui est admin') ||
      q.includes('who logged in') ||
      q.includes('my profile') ||
      q.includes('who am i') ||
      q.includes('logged in user')
    ) {
      return 'IDENTITY';
    }

    if (
      q.includes('overstocked') ||
      q.includes('overstock') ||
      q.includes('too much stock') ||
      q.includes('excess inventory') ||
      q.includes('surplus') ||
      q.includes('surstock')
    ) {
      return 'OVERSTOCK_ANALYSIS';
    }

    if (
      q.includes('which products should be discounted') ||
      q.includes('should be discounted') ||
      q.includes('products need promotions') ||
      q.includes('should i promote') ||
      q.includes('suggest discounts')
    ) {
      return 'DISCOUNT_RECOMMENDATIONS';
    }

    if (
      q.includes('improve profits') ||
      q.includes('increase profits') ||
      q.includes('recommendation for this month') ||
      q.includes('what is your recommendation') ||
      q.includes('biggest business risks') ||
      q.includes('executive report')
    ) {
      return 'PROFIT_IMPROVEMENT';
    }

    if (
      q.includes('customer should receive a discount') ||
      q.includes('discount for customer')
    ) {
      return 'CUSTOMER_DISCOUNT_ANALYSIS';
    }

    if (
      q.includes('best reliability') ||
      q.includes('most reliable') ||
      q.includes('supplier reliability') ||
      q.includes('delayed shipments')
    ) {
      return 'SUPPLIER_RELIABILITY_ANALYSIS';
    }

    if (
      q.includes('invoice') ||
      q.includes('facture') ||
      q.includes('inv-') ||
      q.includes('highest value') ||
      q.includes('plus chere') ||
      q.includes('unpaid')
    ) {
      return 'INVOICES';
    }

    if (
      q.includes('customer') ||
      q.includes('client') ||
      q.includes('best customer') ||
      q.includes('vip') ||
      q.includes('spending') ||
      q.includes('from mali') ||
      q.includes('au mali') ||
      q.includes('burkina') ||
      q.includes('angola')
    ) {
      return 'CUSTOMERS';
    }

    if (
      q.includes('expire') ||
      q.includes('expiry') ||
      q.includes('peremption') ||
      q.includes('lose money')
    ) {
      return 'EXPIRY';
    }

    if (
      q.includes('supplier') ||
      q.includes('fournisseur') ||
      q.includes('lead time')
    ) {
      return 'SUPPLIERS';
    }

    if (
      q.includes('import') ||
      q.includes('reorder') ||
      q.includes('forecast') ||
      q.includes('ramadan') ||
      q.includes('what should i import') ||
      q.includes('stop importing')
    ) {
      return 'FORECASTS';
    }

    if (
      q.includes('product') ||
      q.includes('produit') ||
      q.includes('stock') ||
      q.includes('inventory') ||
      q.includes('warehouse') ||
      q.includes('entrepot') ||
      q.includes('biscuit') ||
      q.includes('chocolate') ||
      q.includes('candy') ||
      q.includes('date') ||
      q.includes('turkey') ||
      q.includes('china') ||
      q.includes('morocco') ||
      q.includes('belgium') ||
      q.includes('thailand') ||
      q.includes('oreo') ||
      q.includes('ibon') ||
      q.includes('today') ||
      q.includes('puff') ||
      q.includes('cremo') ||
      q.includes('freegells') ||
      q.includes('laka')
    ) {
      return 'INVENTORY';
    }

    return 'EXECUTIVE';
  }
}

/**
 * 🧠 Question Analyzer Classifier
 * Classifies the exact analytical operation required (Filter, Sum, Max/Min, Group By, Recommendation, Risk).
 */
export class QuestionAnalyzer {
  public static analyzeQuestion(query: string): { intent: UserIntent; questionType: QuestionType } {
    const q = query.toLowerCase().trim();
    const intent = IntentDetector.detectIntent(query);

    if (intent === 'IDENTITY') {
      return { intent, questionType: 'IDENTITY' };
    }

    // GROUP BY / RANKING / MAX / MIN
    if (
      q.includes('worth the most') ||
      q.includes('most money') ||
      q.includes('highest value') ||
      q.includes('most stock') ||
      q.includes('highest stock') ||
      q.includes('highest profit') ||
      q.includes('largest') ||
      q.includes('biggest') ||
      q.includes('top') ||
      q.includes('best') ||
      q.includes('meilleur')
    ) {
      if (q.includes('category') || q.includes('warehouse') || q.includes('supplier') || q.includes('customer')) {
        return { intent, questionType: 'GROUP_BY_ANALYTICS' };
      }
      return { intent, questionType: 'MAX_MIN_RANKING' };
    }

    // SUM / AGGREGATION / COUNT
    if (
      q.includes('how much') ||
      q.includes('how many') ||
      q.includes('total') ||
      q.includes('combien') ||
      q.includes('sum') ||
      q.includes('count') ||
      q.includes('cartons of') ||
      q.includes('stored in') ||
      q.includes('came from')
    ) {
      return { intent, questionType: 'SUM_AGGREGATION' };
    }

    // RECOMMENDATION
    if (
      q.includes('recommend') ||
      q.includes('should') ||
      q.includes('improve') ||
      q.includes('promote') ||
      q.includes('discount') ||
      q.includes('advice')
    ) {
      return { intent, questionType: 'RECOMMENDATION' };
    }

    // RISK ANALYSIS
    if (
      q.includes('risk') ||
      q.includes('overstock') ||
      q.includes('expire') ||
      q.includes('perte') ||
      q.includes('loss')
    ) {
      return { intent, questionType: 'RISK_ANALYSIS' };
    }

    // COMPARE
    if (q.includes('compare') || q.includes('versus') || q.includes('vs')) {
      return { intent, questionType: 'COMPARE' };
    }

    return { intent, questionType: 'FILTER' };
  }
}

/**
 * 🏢 Focused Context Builder
 */
export class BusinessContextBuilder {
  public static buildFocusedContext(query: string, userRole: string = 'Administrator') {
    const analysis = QuestionAnalyzer.analyzeQuestion(query);
    const currentDate = new Date().toISOString().split('T')[0];

    const products = dbService.getProducts();
    const sales = dbService.getSalesHistory();
    const invoices = dbService.getInvoices();
    const customers = dbService.getCustomers();
    const suppliers = dbService.getSuppliers();
    const alerts = dbService.getAlertHistory();
    const events = dbService.getSeasonalEvents();
    const users = dbService.getUsers();
    const settings = dbService.getSettings();
    const forecasts = forecastService.generateForecasts();

    return {
      currentDate,
      requestingUserRole: userRole,
      detectedIntent: analysis.intent,
      detectedQuestionType: analysis.questionType,
      companyProfile: {
        companyName: settings.general.companyName || 'ETS FOFANA CONFISERIE',
        currency: settings.general.currency || 'USD'
      },
      productsModule: products,
      invoicesModule: invoices,
      customersModule: customers,
      suppliersModule: suppliers,
      salesModule: sales,
      alertsModule: alerts,
      eventsModule: events,
      forecastsModule: forecasts,
      usersModule: users
    };
  }
}

/**
 * ⚡ Business Calculation Engine (True Analytical Reasoning Router)
 * Executes exact mathematical queries (SUM, MAX, GROUP BY, FILTER) and outputs concise executive conclusions.
 */
export class BusinessCalculationEngine {
  public static calculateAndRespond(query: string, language: string = 'en', userRole: string = 'Administrator'): string {
    const q = query.toLowerCase().trim();
    const isFr = language === 'fr';
    const { intent, questionType } = QuestionAnalyzer.analyzeQuestion(query);

    const products = dbService.getProducts();
    const invoices = dbService.getInvoices();
    const customers = dbService.getCustomers();
    const suppliers = dbService.getSuppliers();
    const sales = dbService.getSalesHistory();
    const users = dbService.getUsers();
    const forecasts = forecastService.generateForecasts();

    // =========================================================================
    // 0. IDENTITY LOOKUP
    // =========================================================================
    if (intent === 'IDENTITY') {
      const adminUser = users.find(u => u.role === 'Super Administrator' || u.username === 'admin') || users[0];
      return `### 👤 System Administrator Account Identity:\n\n- **Full Name:** **${adminUser.fullName}**\n- **Username:** \`${adminUser.username}\`\n- **System Role:** **${adminUser.role}**\n- **Email Address:** ${adminUser.email}\n- **Account Status:** ${adminUser.status}\n\nYou are currently logged in as the System Administrator with full enterprise administrative privileges.`;
    }

    // =========================================================================
    // 1. SPECIFIC PRODUCT SINGLE ITEM QUERY (e.g. "How many cartons of Oreo are left?")
    // =========================================================================
    const singleProductMatch = products.find(p => q.includes(p.product_name.toLowerCase()) || (q.includes('oreo') && p.product_name.toLowerCase().includes('oreo')) || (q.includes('ibon') && p.product_name.toLowerCase().includes('ibon')) || (q.includes('today') && p.product_name.toLowerCase().includes('today')));
    if (singleProductMatch && (q.includes('how many') || q.includes('left') || q.includes('cartons') || q.includes('stock of'))) {
      const daysToExp = Math.ceil((new Date(singleProductMatch.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const totalVal = singleProductMatch.quantity * singleProductMatch.selling_price;

      if (isFr) {
        return `### 📦 Statut de Stock pour ${singleProductMatch.product_name} :\n\n- **Stock Disponible Restant :** **${singleProductMatch.quantity.toLocaleString()} ${singleProductMatch.unit}**\n- **Entrepôt de Stockage :** ${singleProductMatch.warehouse}\n- **Pays Fournisseur :** ${singleProductMatch.supplier_country}\n- **Date d'Expiration :** ${singleProductMatch.expiry_date} (${daysToExp} jours restants)\n- **Valeur Totale au Prix Vente :** **$${totalVal.toLocaleString()}**\n\n**Recommandation Exécutive :** ${singleProductMatch.quantity < 200 ? 'Le stock est bas. Émettre une commande de réapprovisionnement sous 48h.' : 'Niveau de stock optimal pour couvrir la demande régionale.'}`;
      }
      return `### 📦 Live Stock Status for ${singleProductMatch.product_name}:\n\n- **Available Stock Remaining:** **${singleProductMatch.quantity.toLocaleString()} ${singleProductMatch.unit}**\n- **Depot Location:** ${singleProductMatch.warehouse}\n- **Origin Country:** ${singleProductMatch.supplier_country}\n- **Expiry Date:** ${singleProductMatch.expiry_date} (${daysToExp} days remaining)\n- **Total Stock Value:** **$${totalVal.toLocaleString()}**\n\n**Executive Recommendation:** ${singleProductMatch.quantity < 200 ? 'Stock is at critical levels. Issue a reorder within 48 hours to prevent stockouts.' : 'Optimal inventory buffer maintained.'}`;
    }

    // =========================================================================
    // 2. WAREHOUSE SPECIFIC FILTER/SUM (e.g. "How much inventory is stored in Warehouse A?")
    // =========================================================================
    if (q.includes('warehouse a') || q.includes('warehouse b') || q.includes('warehouse c') || q.includes('warehouse d') || q.includes('warehouse e') || q.includes('warehouse f')) {
      let targetWh = 'Warehouse A (Bamako Central)';
      if (q.includes('warehouse b')) targetWh = 'Warehouse B (Kayes Depot)';
      else if (q.includes('warehouse c')) targetWh = 'Warehouse C (Sikasso Hub)';
      else if (q.includes('warehouse d')) targetWh = 'Warehouse D (Bobo Central)';
      else if (q.includes('warehouse e')) targetWh = 'Warehouse E (Ango Depot)';
      else if (q.includes('warehouse f')) targetWh = 'Warehouse F (Abidjan Hub)';

      const whProducts = products.filter(p => p.warehouse === targetWh);
      const totalCartons = whProducts.reduce((sum, p) => sum + p.quantity, 0);
      const totalCostValue = whProducts.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);

      const itemsList = whProducts.map(p => `• **${p.product_name}**: ${p.quantity.toLocaleString()} ${p.unit} ($${(p.quantity * p.cost_price).toLocaleString()} cost value)`).join('\n');

      return `### 📦 ${targetWh} Stock Inventory Analysis\n\n**Current Storage Breakdown:**\n${itemsList || 'No inventory stored at this depot.'}\n\n**Financial Valuation & Volume:**\n- **Total Items Stored:** **${totalCartons.toLocaleString()} units**\n- **Total Cost Valuation:** **$${totalCostValue.toLocaleString()}**\n\n**Business Insight & Recommendation:**\n${targetWh} holds significant inventory value. Ensure climate control and temperature compliance to prevent shelf deterioration.`;
    }

    // =========================================================================
    // 3. COUNTRY ORIGIN FILTER/SUM (e.g. "How much inventory came from Turkey?")
    // =========================================================================
    if (q.includes('turkey') || q.includes('turquie') || q.includes('china') || q.includes('chine') || q.includes('morocco') || q.includes('maroc') || q.includes('belgium') || q.includes('belgique') || q.includes('thailand') || q.includes('brazil')) {
      let targetCountry = 'Turkey';
      if (q.includes('china') || q.includes('chine')) targetCountry = 'China';
      else if (q.includes('morocco') || q.includes('maroc')) targetCountry = 'Morocco';
      else if (q.includes('belgium') || q.includes('belgique')) targetCountry = 'Belgium';
      else if (q.includes('thailand')) targetCountry = 'Thailand';
      else if (q.includes('brazil')) targetCountry = 'Brazil';

      const countryProducts = products.filter(p => p.supplier_country === targetCountry);
      const totalCartons = countryProducts.reduce((sum, p) => sum + p.quantity, 0);
      const totalCostValue = countryProducts.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);

      const itemsList = countryProducts.map(p => `• **${p.product_name}**: ${p.quantity.toLocaleString()} ${p.unit} ($${(p.quantity * p.cost_price).toLocaleString()} cost value)`).join('\n');

      return `### 🌍 ${targetCountry} Imported Inventory Breakdown\n\n**Products Imported from ${targetCountry}:**\n${itemsList}\n\n**Logistics Metrics:**\n- **Combined Stock Volume:** **${totalCartons.toLocaleString()} units**\n- **Combined Cost Valuation:** **$${totalCostValue.toLocaleString()}**\n\n**Business Recommendation:**\nImports from ${targetCountry} represent key product lines. Maintain active shipping communication to ensure steady lead-time replenishment.`;
    }

    // =========================================================================
    // 4. GROUP BY CATEGORY VALUATION (e.g. "Which category is worth the most money?")
    // =========================================================================
    if (q.includes('category is worth') || q.includes('category worth') || (q.includes('category') && (q.includes('most money') || q.includes('highest value')))) {
      const catMap: Record<string, number> = {};
      products.forEach(p => {
        catMap[p.category] = (catMap[p.category] || 0) + (p.quantity * p.cost_price);
      });

      const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
      const topCat = sortedCats[0];

      const listStr = sortedCats.map(([cat, val], idx) => `${idx + 1}. **${cat}**: **$${val.toLocaleString()}**`).join('\n');

      return `### 📊 Inventory Valuation Breakdown by Category\n\n**Category Valuation Rankings (Cost Basis):**\n${listStr}\n\n**Highest Value Category:**\n**${topCat[0]}** represents the single highest inventory valuation at **$${topCat[1].toLocaleString()}**.\n\n**Business Insight & Recommendation:**\nA major portion of enterprise capital is invested in ${topCat[0]}. Monitor sales turnover velocity closely to prevent overstock stagnation.`;
    }

    // =========================================================================
    // 5. GROUP BY WAREHOUSE MOST STOCK (e.g. "Which warehouse has the most stock?")
    // =========================================================================
    if (q.includes('warehouse has the most') || q.includes('warehouse most stock') || (q.includes('warehouse') && (q.includes('most') || q.includes('highest')))) {
      const whMap: Record<string, number> = {};
      products.forEach(p => {
        whMap[p.warehouse] = (whMap[p.warehouse] || 0) + p.quantity;
      });

      const sortedWh = Object.entries(whMap).sort((a, b) => b[1] - a[1]);
      const topWh = sortedWh[0];

      const listStr = sortedWh.map(([wh, qty], idx) => `${idx + 1}. **${wh}**: **${qty.toLocaleString()} units**`).join('\n');

      return `### 🏭 Logistics Warehouse Stock Concentration\n\n**Warehouse Volume Rankings:**\n${listStr}\n\n**Top Facility:**\n**${topWh[0]}** holds the largest share of physical inventory with **${topWh[1].toLocaleString()} units**.\n\n**Recommendation:** Focus routine physical stock audits on ${topWh[0]} to ensure 100% inventory accuracy.`;
    }

    // =========================================================================
    // 6. OVERSTOCK ANALYSIS (e.g. "Which products are overstocked?")
    // =========================================================================
    if (intent === 'OVERSTOCK_ANALYSIS' || q.includes('overstock')) {
      const overstockedItems = products.filter(p => p.quantity >= 1000 || p.quantity > 500);
      const totalTiedUpCapital = overstockedItems.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);

      const itemsList = overstockedItems.map(p => `• **${p.product_name}** (${p.category})\n  - Current Inventory: ${p.quantity.toLocaleString()} ${p.unit} (${p.warehouse})\n  - Capital Tied Up: **$${(p.quantity * p.cost_price).toLocaleString()}**`).join('\n\n');

      return `### 📦 Executive Inventory Overstock Analysis\n\n**Overstocked Product Lines:**\n${itemsList}\n\n**Financial & Business Impact:**\nA total of **$${totalTiedUpCapital.toLocaleString()}** in working capital is currently locked in excess inventory holding.\n\n**Executive Actionable Recommendations:**\n1. **Execute B2B Wholesale Promotions**: Offer a 10% to 15% volume discount to regional distributors.\n2. **Pause Import Orders**: Temporarily halt new purchase orders for these SKUs until stock levels normalize.`;
    }

    // =========================================================================
    // 7. DISCOUNT RECOMMENDATIONS (e.g. "Which products should be discounted?")
    // =========================================================================
    if (intent === 'DISCOUNT_RECOMMENDATIONS' || q.includes('discounted')) {
      const expiringItems = products.filter(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 45;
      });

      const totalRiskValue = expiringItems.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);

      const itemsList = expiringItems.map(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return `• **${p.product_name}**\n  - Remaining Stock: ${p.quantity} ${p.unit} (${p.warehouse})\n  - Expiry Date: ${p.expiry_date} (${days} days remaining)\n  - Recommended Discount: **${days <= 15 ? '20% to 25% OFF' : '15% OFF'}**`;
      }).join('\n\n');

      return `### 🏷️ Strategic Promotional Discount Recommendations\n\n**Priority Products for Discount:**\n${itemsList}\n\n**Financial Justification:**\nDiscounting these near-expiry items prevents an estimated **$${totalRiskValue.toLocaleString()}** in total inventory spoilage loss while accelerating cash flow recovery.`;
    }

    // =========================================================================
    // 8. PROFIT IMPROVEMENT / STRATEGIC ROADMAP
    // =========================================================================
    if (intent === 'PROFIT_IMPROVEMENT') {
      const topProduct = [...products].sort((a, b) => (b.selling_price - b.cost_price) - (a.selling_price - a.cost_price))[0];
      const topCustomer = [...customers].sort((a, b) => b.total_spent - a.total_spent)[0];
      const topSupplier = [...suppliers].sort((a, b) => b.rating - a.rating)[0];

      return `### 💡 Strategic Profit Optimization Roadmap (5 Executive Actions)\n\n1. **Liquidate Near-Expiry Inventory Immediately**\n   - *Action*: Apply a 15% to 20% markdown on near-expiry lines to recover cost capital before expiration.\n\n2. **Focus Sales Force on High-Margin Categories**\n   - *Action*: Incentivize sales representatives to bundle high-margin lines like **${topProduct.product_name}** ($${(topProduct.selling_price - topProduct.cost_price).toFixed(2)} profit/carton).\n\n3. **Optimize Supplier Procurement & Lead Times**\n   - *Action*: Consolidate purchase orders with **${topSupplier.supplier_name}** (Rating ⭐ ${topSupplier.rating}/5, ${topSupplier.lead_time_days}-day lead time).\n\n4. **Incentivize Top VIP Enterprise Accounts**\n   - *Action*: Offer **${topCustomer.company_name || topCustomer.name}** a 3% early-payment rebate to secure advance purchase orders.\n\n5. **Reorder Critical Low-Stock Lines**\n   - *Action*: Issue purchase orders within 48 hours to restore low-stock warehouse buffers.`;
    }

    // =========================================================================
    // 9. HIGHEST VALUE INVOICE
    // =========================================================================
    if (intent === 'INVOICES' && (q.includes('highest') || q.includes('plus elev') || q.includes('max'))) {
      const topInvoice = [...invoices].sort((a, b) => b.total_amount - a.total_amount)[0];
      const itemsList = topInvoice.items && topInvoice.items.length > 0
        ? topInvoice.items.map(item => `  - **${item.product_name}**: ${item.quantity} cartons @ $${item.unit_price.toFixed(2)} = **$${item.total_price.toLocaleString()}**`).join('\n')
        : '  - Standard confectionery batch shipment';

      return `### 🧾 Highest Value Invoice Details\n\n- **Invoice Number:** **${topInvoice.invoice_number}**\n- **Customer Account:** **${topInvoice.customer_name}**\n- **Destination Market:** ${topInvoice.destination_country}\n- **Issue Date:** ${topInvoice.invoice_date}\n- **Payment Method:** ${topInvoice.payment_method}\n- **Total Invoice Amount:** **$${topInvoice.total_amount.toLocaleString()}**\n- **Payment Status:** **${topInvoice.status}**\n\n**Included Line Items:**\n${itemsList}`;
    }

    // =========================================================================
    // 10. BEST CUSTOMER LOOKUP
    // =========================================================================
    if (intent === 'CUSTOMERS' && (q.includes('best') || q.includes('top') || q.includes('highest spending'))) {
      const topCustomer = [...customers].sort((a, b) => b.total_spent - a.total_spent)[0];
      return `### 🏆 Top Enterprise Account & CRM Summary\n\n- **Company Name:** **${topCustomer.company_name || topCustomer.name}**\n- **Primary Contact:** ${topCustomer.name}\n- **Country:** ${topCustomer.country}\n- **Total Cumulative Revenue:** **$${topCustomer.total_spent.toLocaleString()}** (${topCustomer.total_orders} completed orders)\n- **Credit Limit:** $${topCustomer.credit_limit.toLocaleString()}\n- **CRM Account Status:** **${topCustomer.status}**`;
    }

    // DEFAULT REPORT
    const getSalesRev = (s: any) => Number(s?.total_revenue || (s?.quantity_sold * s?.unit_price) || 0);
    const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);
    const totalRetail = products.reduce((sum, p) => sum + (p.quantity * p.selling_price), 0);
    const totalRevenue = sales.reduce((sum, s) => sum + getSalesRev(s), 0);

    return `### 📊 ETS FOFANA CONFISERIE Executive Financial & Operational Report:\n\n- **Total Recorded Sales Revenue:** **$${totalRevenue.toLocaleString()}**\n- **Inventory Cost Valuation:** **$${totalCost.toLocaleString()}** (Retail Sales Valuation: **$${totalRetail.toLocaleString()}**)\n- **Projected Gross Profit:** **$${(totalRetail - totalCost).toLocaleString()}**\n- **Active SKUs Managed:** ${products.length} confectionery product lines\n- **Total Issued Invoices:** ${invoices.length} invoices\n- **Active CRM Customer Accounts:** ${customers.length} business clients\n- **Verified Supplier Network:** ${suppliers.length} international suppliers`;
  }
}

/**
 * 🤖 AIService Main Interface
 */
export class AIService {
  /**
   * Sends prompt directly to Google Gemini AI API.
   */
  public async callGeminiAPI(prompt: string): Promise<{ success: boolean; text?: string; error?: string }> {
    const settings = dbService.getSettings();
    const apiKey = settings.ai?.googleApiKey || (import.meta as any).env?.VITE_GOOGLE_API_KEY;
    const cleanedKey = apiKey ? apiKey.trim() : '';

    if (!cleanedKey || cleanedKey.length < 5) {
      return {
        success: false,
        error: "NO_VALID_API_KEY: Please configure a valid Google Gemini API key in System Settings (or VITE_GOOGLE_API_KEY)."
      };
    }

    const requestedModel = settings.ai?.model || 'gemini-1.5-flash-latest';
    const modelsToTry = Array.from(new Set([
      requestedModel,
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro-latest',
      'gemini-2.5-flash'
    ]));

    let lastError = '';

    for (const model of modelsToTry) {
      const cleanModel = model.replace(/^models\//, '');
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${cleanedKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: settings.ai?.creativity || 0.7,
              maxOutputTokens: settings.ai?.maxTokens || 2048
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            console.log(`[AIService SUCCESS] Response generated with model '${cleanModel}'!`);
            return { success: true, text: candidateText.trim() };
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
          console.warn(`[AIService ${cleanModel}] API status ${response.status}:`, errData);
          lastError = errMsg;
        }
      } catch (err: any) {
        console.warn(`[AIService ${cleanModel}] Fetch error:`, err);
        lastError = err?.message || 'Network fetch error';
      }
    }

    return {
      success: false,
      error: lastError || 'Google Gemini API Quota Limit or Rate Limit reached.'
    };
  }

  /**
   * 🚀 Core Multi-Stage AI Agent Execution Pipeline:
   * 1. Detects User Intent & Question Type (FILTER, SUM_AGGREGATION, MAX_MIN_RANKING, GROUP_BY_ANALYTICS, RECOMMENDATION, etc.).
   * 2. Assembles Focused Business Context with ONLY relevant ERP data.
   * 3. Passes prompt + focused context + 6-Step CBIO reasoning protocol to Gemini API.
   * 4. If Gemini API succeeds -> Displays Gemini's exact answer.
   * 5. If Gemini API rate-limits (429) or fails -> Executes BusinessCalculationEngine.
   */
  public async answerQueryAsync(query: string, language: string = 'en', userRole: string = 'Administrator'): Promise<string> {
    const focusedContext = BusinessContextBuilder.buildFocusedContext(query, userRole);

    const systemPrompt = `You are FOF-AI, acting as the Chief Business Intelligence Officer for ETS FOFANA CONFISERIE (a confectionery import & distribution enterprise based in Mali importing from Turkey, Morocco, Tunisia, Brazil, China, Thailand, and Belgium, and distributing across Mali, Burkina Faso, Côte d'Ivoire, and Angola).

CRITICAL PERSONA & REASONING PROTOCOL:
- You are a Chief Business Intelligence Officer, NOT a simple database browser.
- DO NOT dump full tables or list every record unless explicitly requested with "show all".
- Always answer the user's specific business question directly.
- Whenever answering, follow this 5-step structure:
  1. **Executive Summary / Direct Conclusion** (Directly answer what was asked)
  2. **Data-Grounded Key Findings** (Use clean bullet points with exact numbers, carton quantities, dollar amounts, product names, dates, and customer names)
  3. **Financial & Business Impact** (Capital tied up, spoilage loss risk, or revenue opportunity)
  4. **Executive Actionable Recommendations** (Prioritized action steps with clear justifications)

Intent Detected: [${focusedContext.detectedIntent}] | Question Type: [${focusedContext.detectedQuestionType}]
FOCUSED ENTERPRISE DATABASE CONTEXT:
================================================================================
${JSON.stringify(focusedContext, null, 2)}
================================================================================

USER QUESTION:
"${query}"

INSTRUCTIONS FOR GEMINI:
- Reply entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.
- Use clean Markdown formatting with bullet points and bold headers. DO NOT use markdown pipe tables (| col | col |).`;

    const geminiResult = await this.callGeminiAPI(systemPrompt);

    if (geminiResult.success && geminiResult.text) {
      return geminiResult.text;
    }

    // Smart Local Business Calculation Engine Fallback
    return BusinessCalculationEngine.calculateAndRespond(query, language, userRole);
  }

  // --- Auxiliary Decision Analysis Methods (Used by UI Cards) ---
  public analyzeProduct(product: Product): AIProductAnalysis {
    const now = new Date();
    const exp = new Date(product.expiry_date);
    const daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let healthStatus: 'Healthy' | 'Low' | 'Critical' = 'Healthy';
    if (product.quantity < 100 || daysRemaining <= 7) healthStatus = 'Critical';
    else if (product.quantity < 300 || daysRemaining <= 30) healthStatus = 'Low';

    let expiryRisk: 'Safe' | 'Warning' | 'Critical' | 'Expired' = 'Safe';
    if (daysRemaining <= 0) expiryRisk = 'Expired';
    else if (daysRemaining <= 7) expiryRisk = 'Critical';
    else if (daysRemaining <= 30) expiryRisk = 'Warning';

    let urgencyLevel: 'Low' | 'Medium' | 'High' | 'Immediate' = 'Low';
    if (daysRemaining <= 3 || product.quantity < 50) urgencyLevel = 'Immediate';
    else if (daysRemaining <= 15 || product.quantity < 150) urgencyLevel = 'High';
    else if (daysRemaining <= 30 || product.quantity < 300) urgencyLevel = 'Medium';

    const cost = product.cost_price || 0;
    const selling = product.selling_price || 0;
    const profitMargin = Math.max(0, selling - cost);
    const profitMarginPercent = selling > 0 ? (profitMargin / selling) * 100 : 0;

    let recommendation = `Maintain current stock of ${product.quantity} ${product.unit} in ${product.warehouse}.`;
    if (daysRemaining <= 7) {
      recommendation = `URGENT: Launch immediate 25% discount campaign for ${product.product_name} before ${product.expiry_date}.`;
    } else if (daysRemaining <= 30) {
      recommendation = `Apply 15% promotional discount to clear ${product.quantity} ${product.unit} prior to expiration.`;
    } else if (product.quantity < 100) {
      recommendation = `Reorder recommendation: Place purchase order for 400 ${product.unit} from ${product.supplier_country}.`;
    }

    return {
      healthStatus,
      expiryRisk,
      daysRemaining,
      urgencyLevel,
      costPrice: cost,
      sellingPrice: selling,
      profitMargin,
      profitMarginPercent,
      recommendation,
      explanation: {
        inventoryCondition: `${product.quantity} ${product.unit} stored in ${product.warehouse}. Stock status is ${healthStatus}.`,
        expirySituation: `${daysRemaining} days remaining until shelf expiration date (${product.expiry_date}). Expiry risk level: ${expiryRisk}.`,
        profitability: `Unit cost: $${cost.toFixed(2)} | Unit selling price: $${selling.toFixed(2)} | Profit margin: $${profitMargin.toFixed(2)} (${profitMarginPercent.toFixed(1)}%).`,
        demandConsiderations: `Strong regional demand in ${product.destination_country} market for ${product.category}.`,
        businessRisks: daysRemaining <= 30 ? `Potential waste loss of $${(product.quantity * cost).toFixed(2)} if unsold before expiration.` : 'No critical risk detected.',
        recommendedActions: [
          recommendation,
          `Monitor sales velocity in ${product.destination_country}`,
          `Verify warehouse storage temperature in ${product.warehouse}`
        ]
      }
    };
  }

  public getPromotionAdvice(product: Product): AIPromotionAdvice {
    const now = new Date();
    const exp = new Date(product.expiry_date);
    const daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let suggestedDiscount = 0;
    let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let expectedSalesBoostPercent = 0;
    let campaignDurationDays = 14;

    if (daysRemaining <= 7) {
      suggestedDiscount = 25;
      priority = 'Critical';
      expectedSalesBoostPercent = 85;
      campaignDurationDays = 5;
    } else if (daysRemaining <= 15) {
      suggestedDiscount = 20;
      priority = 'High';
      expectedSalesBoostPercent = 65;
      campaignDurationDays = 10;
    } else if (daysRemaining <= 30) {
      suggestedDiscount = 15;
      priority = 'Medium';
      expectedSalesBoostPercent = 45;
      campaignDurationDays = 14;
    } else {
      suggestedDiscount = 5;
      priority = 'Low';
      expectedSalesBoostPercent = 15;
      campaignDurationDays = 21;
    }

    const recommendation = `Apply a ${suggestedDiscount}% promotional discount to clear ${product.quantity} ${product.unit} of ${product.product_name} before ${product.expiry_date}.`;

    return {
      suggestedDiscount,
      priority,
      recommendation,
      campaignDurationDays,
      expectedSalesBoostPercent
    };
  }

  public getImportAdvice(product: Product): AIImportAdvice {
    const recommendedImportQty = Math.max(200, 500 - product.quantity);
    const importPriority: 'Low' | 'Medium' | 'High' = product.quantity < 150 ? 'High' : product.quantity < 300 ? 'Medium' : 'Low';
    
    return {
      recommendedImportQty,
      preferredSupplierCountry: product.supplier_country,
      importPriority,
      recommendedPurchaseTiming: importPriority === 'High' ? 'Immediate Order (Within 48 Hours)' : 'Standard Monthly Cycle',
      procurementStrategy: `Order ${recommendedImportQty} ${product.unit} from preferred supplier in ${product.supplier_country} for dispatch to ${product.warehouse}.`
    };
  }

  public simulateDecision(product: Product, plannedImportQty: number): DecisionSimulationResult {
    const newInventoryLevel = product.quantity + plannedImportQty;
    const cost = product.cost_price || 20;
    const selling = product.selling_price || 30;
    const profitMargin = selling - cost;
    const projectedProfitMargin = selling > 0 ? (profitMargin / selling) * 100 : 0;

    const overstockRisk: 'Low' | 'Moderate' | 'High' = newInventoryLevel > 1200 ? 'High' : newInventoryLevel > 800 ? 'Moderate' : 'Low';
    const shortageRisk: 'Low' | 'Moderate' | 'High' = newInventoryLevel < 200 ? 'High' : newInventoryLevel < 400 ? 'Moderate' : 'Low';

    const exp = new Date(product.expiry_date);
    const daysRemaining = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const expiryRisk: 'Low' | 'Moderate' | 'High' = daysRemaining <= 15 ? 'High' : daysRemaining <= 30 ? 'Moderate' : 'Low';

    let aiVerdict = `Simulated import of ${plannedImportQty} ${product.unit} increases stock level to ${newInventoryLevel} ${product.unit}.`;
    if (overstockRisk === 'High') {
      aiVerdict += ' Warning: Stock level exceeds optimal warehouse buffer capacity.';
    } else {
      aiVerdict += ' Optimal inventory buffer achieved for regional distribution.';
    }

    return {
      plannedImportQty,
      newInventoryLevel,
      projectedStockAvailabilityDays: Math.round(newInventoryLevel / 15),
      projectedProfitMargin,
      overstockRisk,
      shortageRisk,
      expiryRisk,
      aiVerdict
    };
  }

  public generateWeeklyActionPlan(): WeeklyActionPlanDay[] {
    const products = dbService.getProducts();
    if (!products || products.length === 0) return [];

    const sortedByExp = [...products].sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
    const sortedByQty = [...products].sort((a, b) => a.quantity - b.quantity);

    const targetExp = sortedByExp[0] || products[0];
    const targetLow = sortedByQty[0] || products[0];
    const thirdItem = products[2] || products[0];

    return [
      {
        day: 'Monday',
        action: `Launch 15% discount promo on ${targetExp.product_name} in ${targetExp.destination_country}.`,
        actionFr: `Lancer une promotion de 15% sur ${targetExp.product_name} au ${targetExp.destination_country}.`,
        productId: targetExp.product_id,
        productName: targetExp.product_name,
        priority: 'High',
        rationale: `Item has ${targetExp.quantity} ${targetExp.unit} expiring on ${targetExp.expiry_date}. Discounting prevents $${(targetExp.quantity * targetExp.cost_price).toFixed(2)} stock loss.`,
        rationaleFr: `Le produit compte ${targetExp.quantity} ${targetExp.unit} expirant le ${targetExp.expiry_date}. Une remise évite la perte de $${(targetExp.quantity * targetExp.cost_price).toFixed(2)}.`
      },
      {
        day: 'Tuesday',
        action: `Issue import purchase order for ${targetLow.category} (${targetLow.supplier_country} supplier).`,
        actionFr: `Émettre un bon d'achat pour la catégorie ${targetLow.category} (Fournisseur ${targetLow.supplier_country}).`,
        productId: targetLow.product_id,
        productName: targetLow.product_name,
        priority: 'High',
        rationale: `Stock for ${targetLow.product_name} is critically low at ${targetLow.quantity} ${targetLow.unit} in ${targetLow.warehouse}.`,
        rationaleFr: `Le stock pour ${targetLow.product_name} est très bas (${targetLow.quantity} ${targetLow.unit} dans ${targetLow.warehouse}).`
      },
      {
        day: 'Wednesday',
        action: `Contact supplier in ${targetLow.supplier_country} for shipping updates to ${targetLow.warehouse}.`,
        actionFr: `Contacter le fournisseur en ${targetLow.supplier_country} pour les mises à jour d'expédition vers ${targetLow.warehouse}.`,
        priority: 'Medium',
        rationale: `Customs clearance and sea/land transport from ${targetLow.supplier_country} requires active tracking to avoid port delays.`,
        rationaleFr: `Le dédouanement et le transport depuis la ${targetLow.supplier_country} nécessitent un suivi actif.`
      },
      {
        day: 'Thursday',
        action: `Audit warehouse stock at ${thirdItem.warehouse} & inspect ${thirdItem.product_name}.`,
        actionFr: `Inspecter l'entrepôt à ${thirdItem.warehouse} et vérifier les stocks de ${thirdItem.product_name}.`,
        priority: 'Medium',
        rationale: `Evaluating stock levels for ${thirdItem.product_name} (${thirdItem.quantity} ${thirdItem.unit}) guarantees regional fulfillment.`,
        rationaleFr: `L'évaluation des stocks de ${thirdItem.product_name} garantit un approvisionnement régional continu.`
      },
      {
        day: 'Friday',
        action: `Inspect products expiring within 30 days and verify alert email logs.`,
        actionFr: `Inspecter les produits expirant sous 30 jours et vérifier les emails d'alerte.`,
        priority: 'Low',
        rationale: `Weekly audit of alert logs ensures 100% email delivery to executive decision-makers and zero unhandled risk items.`,
        rationaleFr: `L'audit hebdomadaire des alertes garantit la livraison à 100% des notifications par email à la direction.`
      }
    ];
  }
}

export const aiService = new AIService();
