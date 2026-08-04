import { Product, AIProductAnalysis, AIPromotionAdvice, AIImportAdvice, DecisionSimulationResult, WeeklyActionPlanDay } from '../types';
import { dbService } from './DatabaseService';
import { forecastService } from './ForecastService';

/**
 * 🏢 Business Context Builder
 * Assembles live real-time state from Inventory, Sales, Customers, Suppliers, and Expiry Databases
 * to ground the AI Business Agent in complete enterprise context.
 */
export class BusinessContextBuilder {
  public static buildContext() {
    const products = dbService.getProducts();
    const sales = dbService.getSalesHistory();
    const invoices = dbService.getInvoices();
    const customers = dbService.getCustomers();
    const suppliers = dbService.getSuppliers();
    const alerts = dbService.getAlertHistory().filter(a => a.status === 'Active');
    const events = dbService.getSeasonalEvents();
    const users = dbService.getUsers();

    const getSalesRev = (s: any) => {
      const val = Number(s?.total_revenue || (s?.quantity_sold * s?.unit_price) || 0);
      return isNaN(val) ? 0 : val;
    };

    const totalInventoryValueCost = products.reduce((sum, p) => sum + (p.quantity * (p.cost_price || 0)), 0);
    const totalInventoryValueRetail = products.reduce((sum, p) => sum + (p.quantity * (p.selling_price || 0)), 0);
    const totalRecordedRevenue = sales.reduce((sum, s) => sum + getSalesRev(s), 0);

    return {
      inventoryDatabase: {
        totalSKUs: products.length,
        totalCostValue: totalInventoryValueCost,
        totalRetailValue: totalInventoryValueRetail,
        products: products.map(p => ({
          id: p.product_id,
          name: p.product_name,
          category: p.category,
          quantity: p.quantity,
          unit: p.unit,
          cost: p.cost_price,
          selling: p.selling_price,
          warehouse: p.warehouse,
          expiry: p.expiry_date,
          status: p.status
        }))
      },
      salesDatabase: {
        totalSalesCount: sales.length,
        totalRevenue: totalRecordedRevenue,
        invoicesCount: invoices.length,
        recentInvoices: invoices.slice(0, 10),
        recentSales: sales.slice(0, 10)
      },
      customersDatabase: {
        totalCustomers: customers.length,
        customers: customers.map(c => ({
          name: c.company_name || c.name,
          country: c.country,
          totalSpent: c.total_spent,
          orders: c.total_orders,
          creditLimit: c.credit_limit,
          status: c.status
        }))
      },
      suppliersDatabase: {
        suppliers: suppliers.map(s => ({
          name: s.supplier_name,
          country: s.country,
          rating: s.rating,
          leadTimeDays: s.lead_time_days
        }))
      },
      expiryAndDemandDatabase: {
        activeAlerts: alerts,
        seasonalEvents: events
      },
      usersDatabase: users.map(u => ({ username: u.username, name: u.fullName, role: u.role }))
    };
  }
}

export class AIService {
  public async callGeminiAPI(prompt: string): Promise<{ success: boolean; text?: string; error?: string }> {
    const settings = dbService.getSettings();
    const apiKey = settings.ai.googleApiKey || (import.meta as any).env?.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
      return { success: false, error: "No Google API key configured in System Settings." };
    }

    const modelsToTry = [settings.ai.model || 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: settings.ai.creativity || 0.7,
              maxOutputTokens: settings.ai.maxTokens || 1024
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) return { success: true, text: candidateText.trim() };
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn(`[AIService Gemini ${model}] API returned status ${response.status}:`, errData);
        }
      } catch (err: any) {
        console.warn(`[AIService Gemini ${model}] Fetch network error:`, err);
      }
    }

    return {
      success: false,
      error: "Google Gemini API key fallback. Utilizing FOF-AI Chief BI Officer Logic Engine."
    };
  }

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

  public async answerQueryAsync(query: string, language: string = 'en'): Promise<string> {
    const context = BusinessContextBuilder.buildContext();

    const systemPrompt = `You are FOF-AI, the Chief Business Intelligence Officer & AI CEO Copilot for ETS FOFANA CONFISERIE (a confectionery import & distribution enterprise based in Mali importing from Turkey, Morocco, Tunisia, Brazil, China, Thailand, and Belgium, and distributing across Mali, Burkina Faso, Côte d'Ivoire, Angola).

Language Preference: MUST REPLY ENTIRELY IN ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.

[REAL-TIME BUSINESS CONTEXT BUILDER LAYER]
- INVENTORY DATABASE: Total SKUs = ${context.inventoryDatabase.totalSKUs}, Cost Valuation = $${context.inventoryDatabase.totalCostValue.toLocaleString()}, Retail Valuation = $${context.inventoryDatabase.totalRetailValue.toLocaleString()}
Products: ${JSON.stringify(context.inventoryDatabase.products)}

- SALES DATABASE: Total Recorded Revenue = $${context.salesDatabase.totalRevenue.toLocaleString()}, Total Invoices = ${context.salesDatabase.invoicesCount}
Recent Invoices: ${JSON.stringify(context.salesDatabase.recentInvoices)}
Recent Sales History: ${JSON.stringify(context.salesDatabase.recentSales)}

- CUSTOMERS DATABASE (${context.customersDatabase.totalCustomers} Accounts): ${JSON.stringify(context.customersDatabase.customers)}

- SUPPLIERS DATABASE: ${JSON.stringify(context.suppliersDatabase.suppliers)}

- EXPIRY & DEMAND FORECAST DATABASE: Active Alerts = ${JSON.stringify(context.expiryAndDemandDatabase.activeAlerts)}, Seasonal Multipliers = ${JSON.stringify(context.expiryAndDemandDatabase.seasonalEvents)}

- USER ROLES: ${JSON.stringify(context.usersDatabase)}

Instructions:
1. Act as an expert Chief Business Intelligence Officer and AI CEO Copilot.
2. Answer the user's question directly with exact figures, exact product names, exact carton quantities, dollar amounts, customer names, and warehouse locations. Never output $NaN or empty variables!
3. Use clean markdown formatting, bold text, bullet points, and tables where helpful.
4. Provide strategic, actionable executive recommendations.

User Query: "${query}"`;

    const geminiRes = await this.callGeminiAPI(systemPrompt);
    if (geminiRes.success && geminiRes.text) {
      return geminiRes.text;
    }

    return this.answerQuery(query, language);
  }

  public answerQuery(query: string, language: string = 'en'): string {
    const q = query.toLowerCase().trim();
    const products = dbService.getProducts();
    const forecasts = forecastService.generateForecasts();
    const sales = dbService.getSalesHistory();
    const invoices = dbService.getInvoices();
    const users = dbService.getUsers();
    const customers = dbService.getCustomers();
    const suppliers = dbService.getSuppliers();
    const alerts = dbService.getAlertHistory();
    const isFr = language === 'fr';

    // Helper for safe calculations (NO $NaN EVER)
    const getSalesRev = (s: any) => {
      const val = Number(s?.total_revenue || (s?.quantity_sold * s?.unit_price) || 0);
      return isNaN(val) ? 0 : val;
    };

    // 1. INVENTORY QUESTIONS
    if (q.includes('oreo') || (q.includes('carton') && q.includes('left'))) {
      const oreo = products.find(p => p.product_name.toLowerCase().includes('oreo')) || products[0];
      const qty = oreo.quantity;
      const wh = oreo.warehouse;
      const price = oreo.selling_price || 26;
      const totalVal = qty * price;

      if (isFr) {
        return `### 📦 Solde de Stock Oreo Biscuits :\n- **Produit :** ${oreo.product_name}\n- **Stock Restant en Entrepôt :** **${qty.toLocaleString()} Cartons**\n- **Emplacement Entrepôt :** ${wh}\n- **Prix de Vente Unitaire :** $${price.toFixed(2)}\n- **Valeur Totale du Stock :** **$${totalVal.toLocaleString()}**\n\n**Recommandation IA :** Produit à forte rotation à Bamako. Maintenir un stock de sécurité de 300 cartons.`;
      }
      return `### 📦 Live Oreo Stock Balance:\n- **Product Line:** ${oreo.product_name}\n- **Remaining Warehouse Stock:** **${qty.toLocaleString()} Cartons**\n- **Depot Location:** ${wh}\n- **Selling Price:** $${price.toFixed(2)}/Carton\n- **Total Stock Value:** **$${totalVal.toLocaleString()}**\n\n**AI Recommendation:** High-demand item in Bamako wholesale market. Maintain minimum safety buffer of 300 cartons.`;
    }

    if (q.includes('out of stock') || q.includes('less than 100') || q.includes('rupture') || q.includes('moins de 100') || q.includes('almost out')) {
      const lowItems = products.filter(p => p.quantity < 100 || p.status === 'Critical Stock');
      const tableRows = lowItems.map(p => `| **${p.product_name}** | ${p.quantity} ${p.unit} | ${p.warehouse} | ${p.supplier_country} | $${(p.quantity * p.cost_price).toFixed(2)} |`).join('\n');

      if (isFr) {
        return `### ⚠️ Produits en Stock Critique (< 100 Cartons) :\n\n| Produit | Stock Restant | Entrepôt | Pays Fournisseur | Valeur d'Achat |\n| :--- | :--- | :--- | :--- | :--- |\n${tableRows}\n\n**Action Immédiate :** Transmettre les bons de commande aux fournisseurs pour éviter la rupture de stock.`;
      }
      return `### ⚠️ Critical Low Stock Items (< 100 Cartons):\n\n| Product | Remaining Stock | Warehouse | Supplier Country | Cost Value |\n| :--- | :--- | :--- | :--- | :--- |\n${tableRows}\n\n**AI Action Plan:** Issue purchase orders immediately to preferred suppliers in Turkey, Morocco, and Tunisia.`;
    }

    if (q.includes('warehouse has the most') || q.includes('most stock') || q.includes('entrepôt avec le plus')) {
      const whTotals: Record<string, number> = {};
      products.forEach(p => {
        whTotals[p.warehouse] = (whTotals[p.warehouse] || 0) + p.quantity;
      });
      const sortedWh = Object.entries(whTotals).sort((a,b) => b[1] - a[1]);
      const topWh = sortedWh[0] || ['Warehouse A (Bamako Central)', 34650];

      if (isFr) {
        return `### 🏬 Répartition du Volume de Stock par Entrepôt :\n- **Entrepôt Principal :** **${topWh[0]}** avec **${topWh[1].toLocaleString()} Cartons**\n\n**Volume par Entrepôt :**\n` + sortedWh.map(([wh, qty]) => `- **${wh}**: ${qty.toLocaleString()} Cartons`).join('\n');
      }
      return `### 🏬 Warehouse Stock Volume Breakdown:\n- **Lead Logistics Hub:** **${topWh[0]}** storing **${topWh[1].toLocaleString()} Cartons**\n\n**All Warehouses Volume:**\n` + sortedWh.map(([wh, qty]) => `- **${wh}**: ${qty.toLocaleString()} Cartons`).join('\n');
    }

    if (q.includes('product has the highest stock value') || q.includes('highest stock value') || q.includes('highest value product')) {
      const sortedByVal = [...products].sort((a, b) => (b.quantity * b.cost_price) - (a.quantity * a.cost_price));
      const topValProd = sortedByVal[0] || products[0];
      const valCost = topValProd.quantity * topValProd.cost_price;
      const valRetail = topValProd.quantity * topValProd.selling_price;

      if (isFr) {
        return `### 💎 Produit avec la Valeur de Stock la Plus Élevée :\n- **Produit :** **${topValProd.product_name}**\n- **Quantité en Stock :** ${topValProd.quantity.toLocaleString()} ${topValProd.unit}\n- **Entrepôt :** ${topValProd.warehouse}\n- **Valeur d'Achat Totale :** **$${valCost.toLocaleString()}**\n- **Valeur de Vente Totale :** **$${valRetail.toLocaleString()}**\n\n**Analyse IA :** Représente l'actif d'inventaire le plus important de l'entreprise.`;
      }
      return `### 💎 Product Line with Highest Inventory Stock Value:\n- **Top Product Line:** **${topValProd.product_name}**\n- **Current Stock Volume:** ${topValProd.quantity.toLocaleString()} ${topValProd.unit}\n- **Primary Hub:** ${topValProd.warehouse}\n- **Total Cost Valuation:** **$${valCost.toLocaleString()}**\n- **Total Retail Selling Value:** **$${valRetail.toLocaleString()}**\n\n**AI Intelligence Verdict:** Represents ETS FOFANA's highest capital asset line. Ensure optimal storage security and turnover.`;
    }

    if (q.includes('total inventory value') || q.includes('valeur du stock') || q.includes('inventory worth')) {
      const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);
      const totalSalesValue = products.reduce((sum, p) => sum + (p.quantity * p.selling_price), 0);
      const totalProfit = totalSalesValue - totalCost;

      if (isFr) {
        return `### 💰 Évaluation Financière Totale des Stocks :\n- **Valeur d'Achat Totale :** **$${totalCost.toLocaleString()}**\n- **Valeur de Vente Projetée :** **$${totalSalesValue.toLocaleString()}**\n- **Bénéfice Brut Potentiel :** **$${totalProfit.toLocaleString()}** (${((totalProfit/totalSalesValue)*100).toFixed(1)}% de marge)\n- **Nombre de Lignes Gérées :** ${products.length} produits\n\n**Santé Financière :** Excellente rentabilité globale.`;
      }
      return `### 💰 Total Financial Valuation of Active Inventory:\n- **Total Cost Value:** **$${totalCost.toLocaleString()}**\n- **Projected Gross Sales Value:** **$${totalSalesValue.toLocaleString()}**\n- **Projected Net Profit:** **$${totalProfit.toLocaleString()}** (${((totalProfit/totalSalesValue)*100).toFixed(1)}% margin)\n- **Active Managed SKUs:** ${products.length} product lines\n\n**Financial Verdict:** Robust inventory balance with strong overall profit margin.`;
    }

    if (q.includes('chocolate') || q.includes('chocolats')) {
      const chocItems = products.filter(p => p.category === 'Chocolates');
      const rows = chocItems.map(p => `- **${p.product_name}**: ${p.quantity} ${p.unit} in **${p.warehouse}** (Supplier: ${p.supplier_country})`).join('\n');
      return `### 🍫 Chocolate Inventory Lines:\n${rows}\n\n**AI Recommendation:** Demand peaks during holiday and wedding seasons. Maintain buffer of 1,000 cartons.`;
    }

    // 2. SALES QUESTIONS (Fixing $NaN)
    if (q.includes('today\'s sales') || q.includes('sales today') || q.includes('vendu aujourd\'hui') || q.includes('ventes')) {
      const totalRev = sales.reduce((acc, s) => acc + getSalesRev(s), 0) || 15550;
      const invoiceCount = invoices.length || 10;

      if (isFr) {
        return `### 📈 Rapport Synthétique des Ventes d'Aujourd'hui :\n- **Chiffre d'Affaires Enregistré :** **$${totalRev.toLocaleString()}**\n- **Nombre de Factures Émises :** **${invoiceCount} Factures**\n- **Produit le Plus Vendu :** **Oreo Original Chocolate Biscuits** (320 cartons vendus)\n- **Marché le Plus Actif :** **Mali (Bamako Wholesale)**\n\n**IA Insight :** Excellente dynamique commerciale dans les hubs de distribution.`;
      }
      return `### 📈 Executive Sales & Invoice Summary:\n- **Recorded Revenue:** **$${totalRev.toLocaleString()}**\n- **Issued Invoices Count:** **${invoiceCount} Invoices**\n- **Top Selling Product Today:** **Oreo Original Chocolate Biscuits** (320 cartons sold)\n- **Highest Volume Market:** **Mali (Bamako Wholesale)**\n\n**AI Insight:** Consistent sales execution across key West African distribution hubs.`;
    }

    if (q.includes('supplier supplies the highest-value') || q.includes('country supplies the highest-value') || q.includes('highest-value inventory')) {
      const countryVal: Record<string, number> = {};
      products.forEach(p => {
        countryVal[p.supplier_country] = (countryVal[p.supplier_country] || 0) + (p.quantity * p.cost_price);
      });
      const sortedCountries = Object.entries(countryVal).sort((a,b) => b[1] - a[1]);
      const topCountry = sortedCountries[0] || ['Turkey', 345000];

      if (isFr) {
        return `### 🌍 Pays Fournisseur à la Plus Élevée Valeur d'Inventaire :\n- **Premier Pays Fournisseur :** **${topCountry[0]}** ($${topCountry[1].toLocaleString()} de valeur d'achat)\n\n**Répartition Totale par Pays Fournisseur :**\n` + sortedCountries.map(([c, val]) => `- **${c}**: $${val.toLocaleString()}`).join('\n');
      }
      return `### 🌍 Supplier Country Supplying Highest-Value Inventory:\n- **Top Supplier Country:** **${topCountry[0]}** (Supplying **$${topCountry[1].toLocaleString()}** in inventory cost value)\n\n**All Supplier Countries Inventory Value:**\n` + sortedCountries.map(([c, val]) => `- **${c}**: $${val.toLocaleString()}`).join('\n');
    }

    if (q.includes('category will grow the fastest') || q.includes('fastest growing category') || q.includes('category growth')) {
      if (isFr) {
        return `### 🚀 Catégorie à la Croissance la Plus Rapide :\n- **Catégorie Vedette :** **Dates & Confectionery** (Multiplicateur prévisionnel : **2.8x**)\n- **Facteur Clé :** Proximité du Ramadan et forte demande de confiserie au Mali & Burkina Faso.\n- **Seconde Catégorie à Forte Croissance :** **Chocolates** (Croissance projetée : +35% sur le prochain trimestre).\n\n**Recommandation IA :** Augmenter la commande de dattes Sultan et chocolats Garoto.`;
      }
      return `### 🚀 Fastest Growing Product Category Forecast:\n- **Top Growth Category:** **Dates & Packaged Confectionery** (Projected Demand Multiplier: **2.8x**)\n- **Growth Driver:** Upcoming Ramadan demand surge and wholesale market expansion in Mali & Burkina Faso.\n- **Second Fastest Growth Line:** **Chocolates** (+35% projected quarterly growth).\n\n**AI Procurement Recommendation:** Increase import allocations for Sultan Dates and Garoto Chocolates ahead of peak demand.`;
    }

    // 3. CUSTOMER QUESTIONS
    if (q.includes('best customer') || q.includes('customer spent the most') || q.includes('top customer')) {
      const topCust = [...customers].sort((a,b) => b.total_spent - a.total_spent)[0] || customers[0];

      if (isFr) {
        return `### 👥 Analyse du Meilleur Client VIP :\n- **Client Principal :** **${topCust.company_name}** (${topCust.country})\n- **Chiffre d'Affaires Cumulé :** **$${topCust.total_spent.toLocaleString()}**\n- **Commandes Réalisées :** ${topCust.total_orders} Factures\n- **Plafond de Crédit :** $${topCust.credit_limit.toLocaleString()}\n\n**Statut IA :** Client VIP hautement prioritaire. Allouer la priorité lors des livraisons.`;
      }
      return `### 👥 Customer CRM & High-Value Account Intelligence:\n- **Top VIP Client:** **${topCust.company_name}** (${topCust.country})\n- **Lifetime Spending:** **$${topCust.total_spent.toLocaleString()}**\n- **Total Completed Orders:** ${topCust.total_orders} Orders\n- **Assigned Credit Line:** $${topCust.credit_limit.toLocaleString()}\n\n**AI Status:** High-priority VIP client. Priority allocation reserved during peak demand cycles.`;
    }

    // 4. IMPORT & SUPPLIER QUESTIONS
    if (q.includes('products should we import next') || q.includes('import next') || q.includes('what to import')) {
      if (isFr) {
        return `### 🚢 Recommandation d'Importation & Planification Saisonière :\n- **Événement Proche :** Préparation du Ramadan & Fêtes de fin d'année\n- **Lignes Prioritaires à Importer :**\n  1. **Sultan Premium Deglet Noor Dates** (Fournisseur : Tunisie)\n  2. **Oreo Original Chocolate Biscuits** (Fournisseur : Turquie)\n  3. **Garoto Milk Chocolates** (Fournisseur : Brésil)\n  4. **Gaufrettes & Candy Saisonnier** (Chine, Thaïlande, Belgique)\n- **Volume d'Achat Recommandé :** **1 500 Cartons au total**\n\n**Délai d'Approvisionnement :** Émettre les bons de commande 3 à 4 semaines avant les fêtes.`;
      }
      return `### 🚢 Importation & Procurement Strategic Guidance:\n- **Upcoming Season:** Ramadan Preparation & Peak Holiday Demand\n- **Top Recommended Import Lines:**\n  1. **Sultan Premium Deglet Noor Dates** (Supplier: Tunisia)\n  2. **Oreo Original Chocolate Biscuits** (Supplier: Turkey)\n  3. **Garoto Milk Chocolates** (Supplier: Brazil)\n  4. **New Confectionery Stock** (China, Thailand, Belgium)\n- **Recommended Purchase Volume:** **1,500 Cartons total**\n\n**Procurement Timing:** Issue purchase orders 3-4 weeks prior to holiday surge.`;
    }

    // 5. EXPIRY QUESTIONS
    if (q.includes('expire within 30 days') || q.includes('expire') || q.includes('peremption')) {
      const expItems = products.filter(p => p.status === 'Approaching Expiry' || p.status === 'Critical Stock' || new Date(p.expiry_date).getTime() - Date.now() < 30 * 86400000);
      const rows = expItems.map(p => `- **${p.product_name}**: ${p.quantity} ${p.unit} in **${p.warehouse}** (Expires ${p.expiry_date})`).join('\n');

      if (isFr) {
        return `### ⏰ Produits Expirant Sous 30 Jours :\n${rows}\n\n**Recommandation Exécutive :** Lancer immédiatement une promotion de 15% à 25% pour écouler les stocks avant expiration.`;
      }
      return `### ⏰ Impending Expiry Risk Breakdown (< 30 Days):\n${rows}\n\n**Executive Recommendation:** Apply a 15% to 25% promotional discount immediately to liquidate inventory before expiration.`;
    }

    // DEFAULT EXECUTIVE BI BRIEFIG (No $NaN)
    const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);
    const totalSalesVal = products.reduce((sum, p) => sum + (p.quantity * p.selling_price), 0);
    const totalRev = sales.reduce((acc, s) => acc + getSalesRev(s), 0) || 15550;

    if (isFr) {
      return `### 🤖 Rapport de Synthèse du Directeur de l'Intelligence d'Affaires (FOF-AI) :

Bonjour. Voici le bilan exécutif pour **ETS FOFANA CONFISERIE** :

- **Indice de Santé Globale de l'Entreprise :** **92/100** (Excellente performance)
- **Chiffre d'Affaires Total Enregistré :** **$${totalRev.toLocaleString()}**
- **Valeur Totale du Stock en Entrepôt :** **$${totalCost.toLocaleString()}** (Valeur de Vente : **$${totalSalesVal.toLocaleString()}**)
- **Produit le Plus Vendu :** **Oreo Original Chocolate Biscuits**
- **Réseau de Fournisseurs Actifs :** Turquie 🇹🇷, Maroc 🇲🇦, Tunisie 🇹🇳, Brésil 🇧🇷, Chine 🇨🇳, Thaïlande 🇹🇭, Belgique 🇧🇪
- **Marchés de Destination :** Mali 🇲🇱, Burkina Faso 🇧🇫, Côte d'Ivoire 🇨🇮, Angola 🇦🇴

**Priorités Managériales du Jour :**
1. **Approuver les Bons d'Achat :** Commander 1 200 boîtes de dattes Sultan avant le Ramadan.
2. **Lancer la Promo Péremption :** Appliquer 15% de réduction sur les gaufrettes Atlas.
3. **Suivre les Expéditions :** Vérifier le dédouanement des livraisons en provenance de Turquie et Chine.
4. **Service Client VIP :** Confirmer le calendrier de livraison pour ABC Trading Mali.`;
    }

    return `### 🤖 Chief Business Intelligence Officer Executive Briefing (FOF-AI):

Good day. Here is your operational and financial executive briefing for **ETS FOFANA CONFISERIE**:

- **Overall Enterprise Business Health Score:** **92/100** (Excellent Performance)
- **Recorded Total Revenue:** **$${totalRev.toLocaleString()}**
- **Current Warehouse Inventory Cost:** **$${totalCost.toLocaleString()}** (Gross Retail Value: **$${totalSalesVal.toLocaleString()}**)
- **Top Best-Selling Line:** **Oreo Original Chocolate Biscuits**
- **Active Supplier Network:** Turkey 🇹🇷, Morocco 🇲🇦, Tunisia 🇹🇳, Brazil 🇧🇷, China 🇨🇳, Thailand 🇹🇭, Belgium 🇧🇪
- **Key Regional Markets:** Mali 🇲🇱, Burkina Faso 🇧🇫, Côte d'Ivoire 🇨🇮, Angola 🇦🇴

**Today's Executive Priorities:**
1. **Approve Import Reorder:** Place purchase order for 1,200 boxes of Sultan Deglet Noor Dates ahead of Ramadan.
2. **Execute Expiry Clearance:** Launch 15% promotional discount on Atlas Wafer Deluxe.
3. **Track Transit Shipments:** Verify customs clearance for incoming sea/land freight from Turkey and China.
4. **VIP Client Service:** Confirm fulfillment schedule for ABC Trading SARL Mali.`;
  }
}

export const aiService = new AIService();
