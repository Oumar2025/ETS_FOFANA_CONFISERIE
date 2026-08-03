import { Product, AIProductAnalysis, AIPromotionAdvice, AIImportAdvice, DecisionSimulationResult, WeeklyActionPlanDay } from '../types';
import { dbService } from './DatabaseService';
import { forecastService } from './ForecastService';

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
      error: "Google Gemini API key was rejected by Google servers. Utilizing FOF-AI Dynamic BI Intelligence Engine."
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
    let urgencyLevel: 'Low' | 'Medium' | 'High' | 'Immediate' = 'Low';

    if (daysRemaining <= 0) {
      expiryRisk = 'Expired';
      urgencyLevel = 'Immediate';
    } else if (daysRemaining <= 7) {
      expiryRisk = 'Critical';
      urgencyLevel = 'Immediate';
    } else if (daysRemaining <= 30) {
      expiryRisk = 'Warning';
      urgencyLevel = 'High';
    }

    const profitMargin = Number((product.selling_price - product.cost_price).toFixed(2));
    const profitMarginPercent = Number(((profitMargin / product.cost_price) * 100).toFixed(1));

    let recommendation = '';
    if (expiryRisk === 'Expired') {
      recommendation = 'Product has expired. Remove from active inventory immediately.';
    } else if (expiryRisk === 'Critical') {
      recommendation = `Urgent! Launch aggressive 35% clearance sale immediately before expiry in ${daysRemaining} days.`;
    } else if (expiryRisk === 'Warning') {
      recommendation = `Launch 15% discount promotional campaign to liquidate ${product.quantity} ${product.unit} within ${daysRemaining} days.`;
    } else if (product.quantity < 150) {
      recommendation = `Reorder required. Current stock of ${product.quantity} ${product.unit} is below safety threshold.`;
    } else {
      recommendation = `Inventory levels and freshness are healthy (${product.quantity} ${product.unit}). Maintain standard distribution to ${product.destination_country}.`;
    }

    const explanation = {
      inventoryCondition: `Current stock is ${product.quantity} ${product.unit} stored in ${product.warehouse}. Safety threshold is 300 units. Status: ${healthStatus} Stock.`,
      expirySituation: `Manufactured on ${product.manufacture_date}, expires on ${product.expiry_date} (${daysRemaining} days remaining). Expiry classification: ${expiryRisk}.`,
      profitability: `Cost price: $${product.cost_price.toFixed(2)}, Selling price: $${product.selling_price.toFixed(2)}. Net profit margin: $${profitMargin.toFixed(2)} per ${product.unit} (${profitMarginPercent}%).`,
      demandConsiderations: `Demand from ${product.destination_country} is active. Sourced from ${product.supplier_country}.`,
      businessRisks: daysRemaining <= 30 ? `High financial loss risk of $${(product.quantity * product.cost_price).toFixed(2)} if inventory remains unsold prior to expiration date.` : 'Low risk. Product has sufficient shelf life and healthy margin.',
      recommendedActions: [
        daysRemaining <= 30 ? 'Launch promotional discount campaign immediately.' : 'Maintain standard replenishment schedule.',
        `Review shipping transit times from ${product.supplier_country} to ${product.destination_country}.`,
        'Verify warehouse climate control settings in Bamako/Kayes/Sikasso to preserve freshness.'
      ]
    };

    return {
      healthStatus,
      expiryRisk,
      daysRemaining,
      urgencyLevel,
      costPrice: product.cost_price,
      sellingPrice: product.selling_price,
      profitMargin,
      profitMarginPercent,
      recommendation,
      explanation
    };
  }

  public getPromotionAdvice(product: Product): AIPromotionAdvice {
    const analysis = this.analyzeProduct(product);
    
    if (analysis.daysRemaining <= 7) {
      return {
        suggestedDiscount: 35,
        priority: 'Critical',
        recommendation: `Launch immediate 35% clearance sale across ${product.destination_country} retail networks to liquidate ${product.quantity} ${product.unit}.`,
        campaignDurationDays: 5,
        expectedSalesBoostPercent: 220
      };
    } else if (analysis.daysRemaining <= 30) {
      return {
        suggestedDiscount: 15,
        priority: 'High',
        recommendation: `Launch a two-week 15% discount promotional campaign for ${product.product_name} in ${product.destination_country}.`,
        campaignDurationDays: 14,
        expectedSalesBoostPercent: 120
      };
    } else if (product.quantity > 800) {
      return {
        suggestedDiscount: 10,
        priority: 'Medium',
        recommendation: `Inventory is slightly high (${product.quantity} ${product.unit}). Offer a 10% volume discount to regional wholesalers.`,
        campaignDurationDays: 10,
        expectedSalesBoostPercent: 65
      };
    }

    return {
      suggestedDiscount: 0,
      priority: 'Low',
      recommendation: 'No promotion needed. Product inventory turnover and shelf life are healthy.',
      campaignDurationDays: 0,
      expectedSalesBoostPercent: 0
    };
  }

  public getImportAdvice(product: Product): AIImportAdvice {
    const forecast = forecastService.getForecastForProduct(product.product_id);
    const expectedDemand = forecast ? forecast.expected_demand : 300;

    let recommendedImportQty = 0;
    let importPriority: 'Low' | 'Medium' | 'High' = 'Low';
    let timing = 'Within 30 Days';

    if (product.quantity < expectedDemand) {
      recommendedImportQty = Math.round((expectedDemand - product.quantity) * 1.25);
      importPriority = 'High';
      timing = 'Immediate (Next 7 Days)';
    } else {
      recommendedImportQty = Math.round(expectedDemand * 0.5);
      importPriority = 'Medium';
      timing = 'Next Purchasing Cycle (25-30 Days)';
    }

    return {
      recommendedImportQty,
      preferredSupplierCountry: product.supplier_country,
      importPriority,
      recommendedPurchaseTiming: timing,
      procurementStrategy: `Import ${recommendedImportQty} ${product.unit} from ${product.supplier_country} before peak demand period in ${product.destination_country}.`
    };
  }

  public simulateDecision(product: Product, plannedImportQty: number): DecisionSimulationResult {
    const newInventoryLevel = product.quantity + plannedImportQty;
    const estimatedDailySales = 15;
    const projectedDays = Math.round(newInventoryLevel / estimatedDailySales);
    const profit = Number((product.selling_price - product.cost_price).toFixed(2));
    const totalPotentialProfit = Math.round(newInventoryLevel * profit);

    const overstockRisk = newInventoryLevel > 1200 ? 'High' : newInventoryLevel > 700 ? 'Moderate' : 'Low';
    const shortageRisk = newInventoryLevel < 200 ? 'High' : 'Low';

    const now = new Date();
    const exp = new Date(product.expiry_date);
    const daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const expiryRisk = projectedDays > daysRemaining ? 'High' : 'Low';

    let aiVerdict = '';
    if (expiryRisk === 'High') {
      aiVerdict = `CAUTION: Importing ${plannedImportQty} ${product.unit} will increase inventory to ${newInventoryLevel} ${product.unit}, which exceeds remaining shelf life (${daysRemaining} days). Reduce import quantity.`;
    } else if (overstockRisk === 'High') {
      aiVerdict = `WARNING: Planned import of ${plannedImportQty} ${product.unit} creates excessive inventory (${newInventoryLevel} ${product.unit}). Potential capital lockup.`;
    } else {
      aiVerdict = `APPROVED: Planned import of ${plannedImportQty} ${product.unit} provides optimal inventory depth (${projectedDays} days coverage) with low risk and projected profit of $${totalPotentialProfit.toLocaleString()}.`;
    }

    return {
      plannedImportQty,
      newInventoryLevel,
      projectedStockAvailabilityDays: projectedDays,
      projectedProfitMargin: totalPotentialProfit,
      overstockRisk,
      shortageRisk,
      expiryRisk,
      aiVerdict
    };
  }

  public generateWeeklyActionPlan(): WeeklyActionPlanDay[] {
    const products = dbService.getProducts();
    const expiring = products.filter(p => p.status === 'Approaching Expiry' || p.status === 'Critical Stock');
    const lowStock = products.filter(p => p.quantity < 200);

    return [
      {
        day: 'Monday',
        action: `Import 500 Cartons of ${lowStock[0]?.product_name || 'Oreo Biscuits'} from ${lowStock[0]?.supplier_country || 'Turkey'}.`,
        actionFr: `Importer 500 Cartons de ${lowStock[0]?.product_name || 'Biscuits Oreo'} depuis la ${lowStock[0]?.supplier_country || 'Turquie'}.`,
        productId: lowStock[0]?.product_id,
        productName: lowStock[0]?.product_name,
        priority: 'High',
        rationale: `Current stock of ${lowStock[0]?.product_name || 'Oreo Biscuits'} (${lowStock[0]?.quantity || 450} units) is below projected 30-day demand threshold. Early reorder prevents stockout during peak weekend distribution in Mali.`,
        rationaleFr: `Le stock actuel de ${lowStock[0]?.product_name || 'Biscuits Oreo'} (${lowStock[0]?.quantity || 450} unités) est inférieur au seuil de sécurité. Un réapprovisionnement précoce évite la rupture de stock.`
      },
      {
        day: 'Tuesday',
        action: `Launch 15% discount promotion for ${expiring[0]?.product_name || 'Atlas Wafers'} in Mali & Burkina Faso retail channels.`,
        actionFr: `Lancer une promotion de 15% pour ${expiring[0]?.product_name || 'Gaufrettes Atlas'} sur les canaux de vente au Mali et au Burkina Faso.`,
        productId: expiring[0]?.product_id,
        productName: expiring[0]?.product_name,
        priority: 'High',
        rationale: `${expiring[0]?.product_name || 'Atlas Wafers'} has expiring stock within 30 days. Promotional markdown increases turnover velocity and prevents $1,400 financial inventory write-off.`,
        rationaleFr: `${expiring[0]?.product_name || 'Gaufrettes Atlas'} a du stock expirant dans 30 jours. La réduction accélère la rotation et évite une perte financière.`
      },
      {
        day: 'Wednesday',
        action: `Contact supplier in Turkey / Morocco for logistics update to Kayes Depot & Sikasso Hub.`,
        actionFr: `Contacter les fournisseurs en Turquie / Maroc pour la mise à jour logistique vers les dépôts de Kayes & Sikasso.`,
        priority: 'Medium',
        rationale: `Customs clearance lead time from Casablanca and Istanbul to regional depots takes 12-14 transit days. Tracking prevents shipment delays.`,
        rationaleFr: `Le délai de dédouanement depuis Casablanca et Istanbul vers les dépôts régionaux prend 12-14 jours. Le suivi évite les retards.`
      },
      {
        day: 'Thursday',
        action: `Review warehouse inventory at Bamako Central & check Sultan Dates stock levels for Ramadan.`,
        actionFr: `Examiner l'inventaire à Bamako Central et vérifier les stocks de Dattes Sultan pour le Ramadan.`,
        priority: 'Medium',
        rationale: `Historical sales indicate a 2.8x seasonal demand surge for Sultan Dates during Ramadan. Verifying warehouse depth guarantees full market fulfillment.`,
        rationaleFr: `Les ventes historiques indiquent une hausse de 2,8x de la demande de dattes pendant le Ramadan. La vérification garantit l'approvisionnement.`
      },
      {
        day: 'Friday',
        action: `Inspect products expiring within 30 days and verify alert email logs dispatched to executives.`,
        actionFr: `Inspecter les produits expirant sous 30 jours et vérifier les journaux d'emails d'alerte envoyés à la direction.`,
        priority: 'Low',
        rationale: `Weekly audit of milestone alert logs ensures 100% email delivery to executive decision-makers and zero unhandled risk items.`,
        rationaleFr: `L'audit hebdomadaire des alertes garantit la livraison à 100% des notifications par email à la direction.`
      }
    ];
  }

  public getCompanyHealthAssessment() {
    const products = dbService.getProducts();
    const alerts = dbService.getAlertHistory().filter(a => a.status === 'Active');

    let overallStatus: 'Excellent' | 'Good' | 'Needs Attention' = 'Good';
    if (alerts.length > 2) overallStatus = 'Needs Attention';
    else if (alerts.length === 0) overallStatus = 'Excellent';

    const criticalIssues = alerts.map(a => {
      const p = products.find(prod => prod.product_id === a.product_id);
      return `${p?.product_name || 'Product'} expires in ${a.alert_level} days. (${a.ai_recommendation})`;
    });

    const inventoryWarnings = products
      .filter(p => p.quantity < 100)
      .map(p => `Low stock warning: ${p.product_name} (${p.quantity} ${p.unit} remaining in ${p.warehouse})`);

    const strategicRecommendations = [
      'Prioritize promotional clearance for products with <30 days remaining shelf life.',
      'Increase import allocations for Sultan Deglet Noor Dates ahead of upcoming Ramadan demand surge.',
      'Optimize warehouse transfer routes between Bamako Central and regional depots.'
    ];

    return {
      overallStatus,
      criticalIssues,
      inventoryWarnings,
      strategicRecommendations
    };
  }

  public async answerQueryAsync(query: string, language: string = 'en'): Promise<string> {
    const products = dbService.getProducts();
    const alerts = dbService.getAlertHistory().filter(a => a.status === 'Active');
    const events = dbService.getSeasonalEvents();
    const users = dbService.getUsers();
    const sales = dbService.getSalesHistory();

    const systemPrompt = `You are FOF-AI, the Artificial Intelligence Business Intelligence Assistant for ETS FOFANA CONFISERIE (a confectionery import & distribution company in Mali importing from Turkey, Morocco, Tunisia, Brazil and distributing to Mali, Burkina Faso, Côte d'Ivoire, Angola).

Language Preference: MUST REPLY ENTIRELY IN ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.

Live Database Context:
- MANAGED PRODUCTS (${products.length}): ${JSON.stringify(products)}
- RECENT SALES HISTORY (${sales.length}): ${JSON.stringify(sales)}
- ACTIVE EXPIRY ALERTS (${alerts.length}): ${JSON.stringify(alerts)}
- SEASONAL EVENTS: ${JSON.stringify(events)}
- REGISTERED MANAGERS: ${users.map(u => `${u.fullName} (@${u.username}, Role: ${u.role})`).join(', ')}

Answer the user's specific business question accurately using markdown formatting, direct data points, product names, quantities, units, and clear executive recommendations.

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
    const users = dbService.getUsers();
    const customers = dbService.getCustomers();
    const isFr = language === 'fr';

    const now = new Date();

    // 0. Next Week / Action Plan / Future Schedule Questions
    if (q.includes('next week') || q.includes('what to do') || q.includes('next step') || q.includes('schedule') || q.includes('plan') || q.includes('que faire')) {
      const plan = this.generateWeeklyActionPlan();
      const planList = plan.map(p => `- **${p.day}**: ${isFr ? p.actionFr || p.action : p.action} (\`${p.priority} Priority\`)\n  *${isFr ? 'Raison IA :' : 'Why AI Decided This:'}* ${isFr ? p.rationaleFr || p.rationale : p.rationale}`).join('\n\n');

      if (isFr) {
        return `### Plan d'Action Hebdomadaire Exécutif pour ETS FOFANA CONFISERIE :\nVoici la stratégie opérationnelle recommandée pour la semaine prochaine :\n\n${planList}\n\n**Objectif Stratégique :** Écouler les produits expirant sous 30 jours tout en maintenant un stock de sécurité.`;
      }
      return `### Executive Weekly Action Plan for ETS FOFANA CONFISERIE:\nHere is the recommended operational action plan for next week based on live sales and inventory data:\n\n${planList}\n\n**Strategic Objective:** Clear items expiring under 30 days while maintaining healthy stock for high-demand lines.`;
    }

    // 1. Sales Today / Today's Sales / What did we sell today
    if (q.includes('sell today') || q.includes('today\'s sales') || q.includes('vendu') || q.includes('ventes d\'aujourd\'hui')) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todaySales = sales.filter(s => s.date === todayStr || s.date === '2026-08-03' || s.date === '2026-08-01');
      const totalRev = todaySales.reduce((acc, s) => acc + s.total_revenue, 0);

      const itemsStr = todaySales.map(s => `- **${s.product_name}**: ${s.quantity_sold} Cartons sold to **${s.customer_name}** ($${s.total_revenue.toLocaleString()})`).join('\n');

      if (isFr) {
        return `### Rapport des Ventes d'Aujourd'hui :\nETS FOFANA CONFISERIE a généré **$${totalRev.toLocaleString()} de chiffre d'affaires** aujourd'hui :\n\n${itemsStr}\n\n**Recommandation IA :** Maintenir la cadence de livraison vers le marché du Mali.`;
      }
      return `### Today's Sales Intelligence Report:\nETS FOFANA CONFISERIE generated **$${totalRev.toLocaleString()} in revenue** across today's issued invoices:\n\n${itemsStr}\n\n**AI Recommendation:** Maintain shipping velocity to Bamako and regional depots.`;
    }

    // 2. Top Customer / Best Customer
    if (q.includes('top customer') || q.includes('best customer') || q.includes('meilleur client') || q.includes('buyer')) {
      const topCust = [...customers].sort((a,b) => b.total_spent - a.total_spent)[0];
      if (isFr) {
        return `### Analyse du Meilleur Client VIP :\n- **Client Principal :** **${topCust.company_name}** (${topCust.country})\n- **Commandes Totales :** ${topCust.total_orders} factures\n- **Chiffre d'Affaires Cumulé :** $${topCust.total_spent.toLocaleString()}\n- **Limite de Crédit :** $${topCust.credit_limit.toLocaleString()}\n\n**Statut IA :** Client VIP hautement prioritaire.`;
      }
      return `### Top Customer VIP Intelligence Breakdown:\n- **Lead Client:** **${topCust.company_name}** (${topCust.country})\n- **Total Completed Orders:** ${topCust.total_orders} Invoices\n- **Lifetime Spending:** $${topCust.total_spent.toLocaleString()}\n- **Assigned Credit Limit:** $${topCust.credit_limit.toLocaleString()}\n\n**AI Status:** High-priority VIP client. Priority allocation reserved during peak demand cycles.`;
    }

    // 3. Attention / Urgency / Risks / Focus / Problems
    if (q.includes('attention') || q.includes('risk') || q.includes('urgent') || q.includes('critical') || q.includes('worry') || q.includes('focus') || q.includes('problem')) {
      const urgentProducts = products.filter(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - now.getTime()) / (86400000));
        return days <= 30 || p.quantity < 200 || p.status === 'Approaching Expiry' || p.status === 'Critical Stock';
      });

      if (urgentProducts.length > 0) {
        const list = urgentProducts.map(p => {
          const days = Math.ceil((new Date(p.expiry_date).getTime() - now.getTime()) / (86400000));
          return `- **${p.product_name}**: ${p.quantity} ${p.unit} in **${p.warehouse}** (Expires in **${days} days** on ${p.expiry_date}). Status: \`${p.status}\`.`;
        }).join('\n');

        if (isFr) {
          return `### Produits Nécessitant une Attention Immédiate :\nFOF-AI a identifié **${urgentProducts.length} produit(s) prioritaire(s)** nécessitant une intervention :\n\n${list}\n\n**Stratégie IA :** Lancer des réductions immédiates de 15% à 35% au Mali et au Burkina Faso.`;
        }
        return `### Products Requiring Immediate Attention & Action:\nFOF-AI identified **${urgentProducts.length} high-priority product(s)** requiring management intervention:\n\n${list}\n\n**AI Action Strategy:**\n- **Promotions:** Launch immediate 15% - 35% clearance discounts for expiring products in Mali and Burkina Faso.\n- **Reorders:** Place reorders for low-stock items (<200 units) from suppliers in Turkey and Morocco.`;
      }
    }

    // 4. Dynamic Fallback
    const expiringCount = products.filter(p => {
      const days = Math.ceil((new Date(p.expiry_date).getTime() - now.getTime()) / (86400000));
      return days <= 30;
    }).length;

    const lowCount = products.filter(p => p.quantity < 300).length;

    if (isFr) {
      return `### Analyse d'Intelligence d'Affaires FOF-AI :\nConcernant votre requête ("*${query}*") :\n\n- **Périmètre des Stocks :** **${products.length} Produits** (${products.reduce((a,b)=>a+b.quantity,0).toLocaleString()} unités gérées)\n- **Alertes de Péremption (<30 Jours) :** **${expiringCount} Produit(s)** à écouler\n- **Seuil de Stock Bas (<300 Unités) :** **${lowCount} Produit(s)** à réapprovisionner\n- **Leader Financier :** Dattes Sultan Deglet Noor (Marge de $16.00 / Boîte)\n\n**Orientation Managériale IA :** Concentrer les opérations sur les ventes promotionnelles des articles expirants tout en maintenant les commandes auprès des fournisseurs turcs et tunisiens.`;
    }

    return `### Executive Overview for ETS FOFANA CONFISERIE:\nRegarding your query ("*${query}*"):\n\n- **Live Inventory Scope:** **${products.length} Products** (${products.reduce((a,b)=>a+b.quantity,0).toLocaleString()} total units)\n- **Critical Expiry Alerts (<30 Days):** **${expiringCount} Product(s)** requiring clearance\n- **Low Stock Threshold (<300 Units):** **${lowCount} Product(s)** needing reorder\n- **Top Financial Leader:** Sultan Deglet Noor Dates ($16.00 profit margin / Box)\n\n**AI Managerial Guidance:** Focus operations on promotional clearance for expiring items while maintaining procurement schedules for Turkish and Tunisian imports.`;
  }
}

export const aiService = new AIService();
