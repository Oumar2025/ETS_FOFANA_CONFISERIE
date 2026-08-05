import { Product, AIProductAnalysis, AIPromotionAdvice, AIImportAdvice, DecisionSimulationResult, WeeklyActionPlanDay } from '../types';
import { dbService } from './DatabaseService';
import { forecastService } from './ForecastService';

/**
 * 🏢 Business Context Builder
 * Reads EVERY module in the ERP system and constructs a single, factual, complete Business Context Summary.
 * The AI Agent does NOT generate business responses — its sole job is to gather live database facts for Gemini.
 */
export class BusinessContextBuilder {
  public static buildFullContext(query: string, userRole: string = 'Administrator') {
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

    const getSalesRev = (s: any) => {
      const val = Number(s?.total_revenue || (s?.quantity_sold * s?.unit_price) || 0);
      return isNaN(val) ? 0 : val;
    };

    const totalInventoryValueCost = products.reduce((sum, p) => sum + (p.quantity * (p.cost_price || 0)), 0);
    const totalInventoryValueRetail = products.reduce((sum, p) => sum + (p.quantity * (p.selling_price || 0)), 0);
    const totalRecordedRevenue = sales.reduce((sum, s) => sum + getSalesRev(s), 0);
    const totalGrossProfitPotential = totalInventoryValueRetail - totalInventoryValueCost;

    // Aggregate Warehouse Volume Breakdown
    const warehouseVolumes: Record<string, { totalCartons: number; totalCostValue: number; itemsCount: number }> = {};
    products.forEach(p => {
      if (!warehouseVolumes[p.warehouse]) {
        warehouseVolumes[p.warehouse] = { totalCartons: 0, totalCostValue: 0, itemsCount: 0 };
      }
      warehouseVolumes[p.warehouse].totalCartons += p.quantity;
      warehouseVolumes[p.warehouse].totalCostValue += (p.quantity * (p.cost_price || 0));
      warehouseVolumes[p.warehouse].itemsCount += 1;
    });

    // Aggregate Category Valuation Breakdown
    const categoryValuations: Record<string, { totalCartons: number; totalCostValue: number; totalRetailValue: number; itemsCount: number }> = {};
    products.forEach(p => {
      if (!categoryValuations[p.category]) {
        categoryValuations[p.category] = { totalCartons: 0, totalCostValue: 0, totalRetailValue: 0, itemsCount: 0 };
      }
      categoryValuations[p.category].totalCartons += p.quantity;
      categoryValuations[p.category].totalCostValue += (p.quantity * (p.cost_price || 0));
      categoryValuations[p.category].totalRetailValue += (p.quantity * (p.selling_price || 0));
      categoryValuations[p.category].itemsCount += 1;
    });

    // Supplier Country Valuation Breakdown
    const supplierCountryValuations: Record<string, { totalCartons: number; totalCostValue: number; itemsCount: number }> = {};
    products.forEach(p => {
      if (!supplierCountryValuations[p.supplier_country]) {
        supplierCountryValuations[p.supplier_country] = { totalCartons: 0, totalCostValue: 0, itemsCount: 0 };
      }
      supplierCountryValuations[p.supplier_country].totalCartons += p.quantity;
      supplierCountryValuations[p.supplier_country].totalCostValue += (p.quantity * (p.cost_price || 0));
      supplierCountryValuations[p.supplier_country].itemsCount += 1;
    });

    // Destination Country Sales Breakdown
    const destinationCountrySales: Record<string, { totalSalesCount: number; totalRevenue: number }> = {};
    sales.forEach(s => {
      const country = s.destination_country || 'Mali';
      if (!destinationCountrySales[country]) {
        destinationCountrySales[country] = { totalSalesCount: 0, totalRevenue: 0 };
      }
      destinationCountrySales[country].totalSalesCount += 1;
      destinationCountrySales[country].totalRevenue += getSalesRev(s);
    });

    return {
      currentDate: new Date().toISOString().split('T')[0],
      requestingUserRole: userRole,
      companyProfile: {
        companyName: settings.general.companyName || 'ETS FOFANA CONFISERIE',
        currency: settings.general.currency || 'USD',
        activeSupplierCountries: ['Turkey 🇹🇷', 'Morocco 🇲🇦', 'Tunisia 🇹🇳', 'Brazil 🇧🇷', 'China 🇨🇳', 'Thailand 🇹🇭', 'Belgium 🇧🇪'],
        activeDistributionMarkets: ['Mali 🇲🇱', 'Burkina Faso 🇧🇫', "Côte d'Ivoire 🇨🇮", 'Angola 🇦🇴']
      },
      financialSummary: {
        totalInventoryCostValuation: totalInventoryValueCost,
        totalInventoryRetailValuation: totalInventoryValueRetail,
        potentialGrossProfit: totalGrossProfitPotential,
        totalRecordedSalesRevenue: totalRecordedRevenue,
        totalInvoicesIssued: invoices.length,
        totalCompletedSalesTransactions: sales.length
      },
      systemThresholds: {
        lowStockThreshold: settings.thresholds?.lowStockThreshold || 300,
        criticalExpiryDaysThreshold: settings.thresholds?.criticalExpiryDays || 30,
        marginTargetPercent: settings.thresholds?.defaultMarginTargetPercent || 35
      },
      inventoryModule: products.map(p => ({
        id: p.product_id,
        name: p.product_name,
        category: p.category,
        brand: p.brand,
        supplierCountry: p.supplier_country,
        destinationCountry: p.destination_country,
        quantity: p.quantity,
        unit: p.unit,
        costPrice: p.cost_price,
        sellingPrice: p.selling_price,
        manufactureDate: p.manufacture_date,
        expiryDate: p.expiry_date,
        warehouse: p.warehouse,
        status: p.status,
        notes: p.notes
      })),
      warehouseBreakdownModule: warehouseVolumes,
      categoryValuationModule: categoryValuations,
      supplierCountryValuationModule: supplierCountryValuations,
      destinationMarketSalesModule: destinationCountrySales,
      salesModule: sales.map(s => ({
        saleId: s.sale_id,
        invoiceNumber: s.invoice_number,
        productName: s.product_name,
        customerName: s.customer_name,
        saleDate: s.date,
        quantitySold: s.quantity_sold,
        unitPrice: s.unit_price,
        totalRevenue: getSalesRev(s),
        destinationCountry: s.destination_country
      })),
      invoicesModule: invoices.map(i => ({
        invoiceNumber: i.invoice_number,
        customerName: i.customer_name,
        customerEmail: i.customer_email,
        customerPhone: i.customer_phone,
        destinationCountry: i.destination_country,
        invoiceDate: i.invoice_date,
        paymentMethod: i.payment_method,
        subtotal: i.subtotal,
        tax: i.tax,
        totalAmount: i.total_amount,
        status: i.status,
        notes: i.notes,
        itemsCount: i.items ? i.items.length : 0,
        itemsList: i.items
      })),
      customersCRMModule: customers.map(c => ({
        customerId: c.customer_id,
        companyName: c.company_name || c.name,
        country: c.country,
        email: c.email,
        phone: c.phone,
        totalSpent: c.total_spent,
        totalOrders: c.total_orders,
        creditLimit: c.credit_limit,
        status: c.status
      })),
      suppliersModule: suppliers.map(s => ({
        supplierId: s.supplier_id,
        supplierName: s.supplier_name,
        country: s.country,
        leadTimeDays: s.lead_time_days,
        rating: s.rating,
        contactPerson: s.contact_person,
        email: s.email,
        phone: s.phone,
        productsSupplied: s.products_supplied
      })),
      demandForecastsModule: forecasts.map(f => ({
        productName: f.product_name,
        category: f.category,
        currentStock: f.current_stock,
        expectedDemand: f.expected_demand,
        recommendedReorderQty: f.import_recommendation_qty,
        aiInterpretation: f.ai_interpretation,
        confidenceScore: f.confidence_score,
        trend: f.trend
      })),
      expiryAlertsModule: alerts.map(a => ({
        alertId: a.alert_id,
        productName: a.product_name,
        quantityAffected: a.quantity_affected,
        expiryDate: a.expiry_date,
        daysUntilExpiry: a.days_until_expiry,
        alertLevel: a.alert_level,
        status: a.status,
        aiRecommendation: a.ai_recommendation
      })),
      seasonalEventsModule: events.map(e => ({
        event: e.event,
        category: e.category,
        startDate: e.start_date,
        endDate: e.end_date,
        demandMultiplier: e.demand_multiplier,
        description: e.description
      })),
      userAccountsModule: users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        fullName: u.fullName,
        email: u.email,
        status: u.status
      }))
    };
  }
}

export class AIService {
  /**
   * 🤖 Sends prompt and context directly to Google Gemini AI.
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

    // Models pipeline: Prioritizes Gemini Flash, Gemini 2.0, Gemma models, and Gemini Pro
    const requestedModel = settings.ai?.model || 'gemini-1.5-flash';
    const modelsToTry = Array.from(new Set([
      requestedModel,
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemma-2-27b-it',
      'gemma-2-9b-it',
      'gemini-1.5-pro'
    ]));

    let lastError = '';
    const errorsTracked: string[] = [];

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
            console.log(`[AIService SUCCESS] Generated response using model '${cleanModel}'!`);
            return { success: true, text: candidateText.trim() };
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
          console.warn(`[AIService ${cleanModel}] API returned status ${response.status}:`, errData);
          errorsTracked.push(`Model '${cleanModel}': ${errMsg}`);
          lastError = errMsg;
        }
      } catch (err: any) {
        console.warn(`[AIService ${cleanModel}] Fetch network error:`, err);
        const netErr = err?.message || 'Network fetch error';
        errorsTracked.push(`Model '${cleanModel}': ${netErr}`);
        lastError = netErr;
      }
    }

    return {
      success: false,
      error: `GEMINI_API_ERROR: ${errorsTracked.join(' | ')}`
    };
  }

  /**
   * 🚀 Core Execution Pipeline:
   * 1. Assembles full Business Context Summary across ALL ERP modules.
   * 2. Passes prompt + summary to Gemini AI.
   * 3. Gemini performs ALL reasoning, calculations, decisions, and recommendations.
   * 4. Returns Gemini's exact answer to the UI.
   * NO PREDEFINED TEMPLATES OR HARDCODED REPORTS!
   */
  public async answerQueryAsync(query: string, language: string = 'en', userRole: string = 'Administrator'): Promise<string> {
    const context = BusinessContextBuilder.buildFullContext(query, userRole);

    const systemPrompt = `You are Gemini, an autonomous Executive Business Intelligence AI Engine for ETS FOFANA CONFISERIE (a confectionery import & distribution enterprise based in Mali importing from Turkey, Morocco, Tunisia, Brazil, China, Thailand, and Belgium, and distributing across Mali, Burkina Faso, Côte d'Ivoire, and Angola).

The AI Agent has gathered the following LIVE, FACTUAL, COMPLETE ERP BUSINESS CONTEXT SUMMARY directly from the enterprise database:

================================================================================
[LIVE ENTERPRISE ERP BUSINESS CONTEXT SUMMARY]
================================================================================
Current Date: ${context.currentDate}
User Role: ${context.requestingUserRole}

1. FINANCIAL OVERVIEW:
   - Total Inventory Cost Valuation: $${context.financialSummary.totalInventoryCostValuation.toLocaleString()}
   - Total Inventory Retail Valuation: $${context.financialSummary.totalInventoryRetailValuation.toLocaleString()}
   - Potential Gross Profit: $${context.financialSummary.potentialGrossProfit.toLocaleString()}
   - Recorded Sales Revenue: $${context.financialSummary.totalRecordedSalesRevenue.toLocaleString()}
   - Total Invoices Issued: ${context.financialSummary.totalInvoicesIssued}
   - Total Sales Transactions: ${context.financialSummary.totalCompletedSalesTransactions}

2. INVENTORY DATABASE MODULE (${context.inventoryModule.length} SKUs):
${JSON.stringify(context.inventoryModule, null, 2)}

3. WAREHOUSE VOLUME & VALUATION BREAKDOWN:
${JSON.stringify(context.warehouseBreakdownModule, null, 2)}

4. CATEGORY VALUATION BREAKDOWN:
${JSON.stringify(context.categoryValuationModule, null, 2)}

5. SUPPLIER COUNTRY INVENTORY COST BREAKDOWN:
${JSON.stringify(context.supplierCountryValuationModule, null, 2)}

6. SALES HISTORY MODULE:
${JSON.stringify(context.salesModule, null, 2)}

7. INVOICES MODULE:
${JSON.stringify(context.invoicesModule, null, 2)}

8. CUSTOMERS CRM MODULE:
${JSON.stringify(context.customersCRMModule, null, 2)}

9. SUPPLIERS DIRECTORY MODULE:
${JSON.stringify(context.suppliersModule, null, 2)}

10. DEMAND FORECASTS MODULE:
${JSON.stringify(context.demandForecastsModule, null, 2)}

11. EXPIRY ALERTS MODULE:
${JSON.stringify(context.expiryAlertsModule, null, 2)}

12. SEASONAL EVENTS MULTIPLIERS MODULE:
${JSON.stringify(context.seasonalEventsModule, null, 2)}

13. SYSTEM USER ACCOUNTS MODULE:
${JSON.stringify(context.userAccountsModule, null, 2)}
================================================================================

USER QUESTION:
"${query}"

GEMINI INSTRUCTIONS:
- You must perform all reasoning, calculation, analysis, forecasting, comparison, decisions, and executive recommendations yourself based on the live context provided above.
- Never output hardcoded templates or canned responses.
- Answer the user's specific question directly with exact figures, exact product names, exact carton numbers, dollar amounts, customer names, supplier names, and warehouse locations.
- If the database context lacks information required to answer the question, clearly state which information is missing instead of inventing values.
- Reply entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}. Use clean markdown formatting with bold headers, bullet points, and tables where helpful.`;

    const geminiResult = await this.callGeminiAPI(systemPrompt);

    if (geminiResult.success && geminiResult.text) {
      return geminiResult.text;
    }

    // Transparent notification if Gemini API cannot be reached or API key is missing
    if (language === 'fr') {
      return `⚠️ **Clé API Google Gemini requise pour l'analyse IA en direct** :\n\nPour permettre à l'IA d'analyser vos données en temps réel et de répondre aux questions sur l'inventaire, les ventes, les factures et les fournisseurs, veuillez configurer une clé API Google Gemini valide dans **Paramètres Système ⚙️ -> Configuration de l'Assistant IA**.\n\n*Raison de la réponse : ${geminiResult.error || "Clé API non configurée"}*`;
    }

    return `⚠️ **Google Gemini API Key Required for Live AI Reasoning**:\n\nTo enable the AI Agent to perform real-time reasoning across your inventory, sales, customer, supplier, and financial databases, please configure a valid **Google Gemini API Key** in **System Settings ⚙️ -> AI Assistant Configuration**.\n\n*Diagnostic details: ${geminiResult.error || "No valid Google API key found"}*`;
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
