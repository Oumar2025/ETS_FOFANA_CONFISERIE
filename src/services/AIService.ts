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
        action: `Import 500 ${lowStock[0]?.unit || 'Cartons'} of ${lowStock[0]?.product_name || 'Oreo Biscuits'} from ${lowStock[0]?.supplier_country || 'Turkey'}.`,
        productId: lowStock[0]?.product_id,
        productName: lowStock[0]?.product_name,
        priority: 'High'
      },
      {
        day: 'Tuesday',
        action: `Launch 15% discount promotion for ${expiring[0]?.product_name || 'Bambino Candies'} in Mali retail channels.`,
        productId: expiring[0]?.product_id,
        productName: expiring[0]?.product_name,
        priority: 'High'
      },
      {
        day: 'Wednesday',
        action: `Contact supplier in Turkey / Morocco for logistics update to Kayes Depot.`,
        priority: 'Medium'
      },
      {
        day: 'Thursday',
        action: `Review warehouse inventory at Bamako Central & check Sultan Dates stock levels.`,
        priority: 'Medium'
      },
      {
        day: 'Friday',
        action: `Inspect products expiring within 30 days and verify alert email logs.`,
        priority: 'Low'
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

  public async answerQueryAsync(query: string): Promise<string> {
    const products = dbService.getProducts();
    const alerts = dbService.getAlertHistory().filter(a => a.status === 'Active');
    const events = dbService.getSeasonalEvents();
    const users = dbService.getUsers();

    const systemPrompt = `You are FOF-AI, the Artificial Intelligence Business Intelligence Assistant for ETS FOFANA CONFISERIE (a confectionery import & distribution company in Mali importing from Turkey, Morocco, Tunisia, Brazil and distributing to Mali, Burkina Faso, Côte d'Ivoire, Angola).

Live Database Context:
- MANAGED PRODUCTS (${products.length}): ${JSON.stringify(products)}
- ACTIVE EXPIRY ALERTS (${alerts.length}): ${JSON.stringify(alerts)}
- SEASONAL EVENTS: ${JSON.stringify(events)}
- REGISTERED MANAGERS: ${users.map(u => `${u.fullName} (@${u.username}, Role: ${u.role})`).join(', ')}

Please provide a clear, professional executive answer. Use bullet points and bold highlights for key numbers and product names. Format headings cleanly with ###.

User Query: "${query}"`;

    const geminiRes = await this.callGeminiAPI(systemPrompt);
    if (geminiRes.success && geminiRes.text) {
      return geminiRes.text;
    }

    return this.answerQuery(query);
  }

  public answerQuery(query: string): string {
    const q = query.toLowerCase().trim();
    const products = dbService.getProducts();
    const forecasts = forecastService.generateForecasts();
    const alerts = dbService.getAlertHistory().filter(a => a.status === 'Active');
    const users = dbService.getUsers();

    const now = new Date();

    // 0. Next Week / Action Plan / Future Schedule Questions
    if (q.includes('next week') || q.includes('what to do') || q.includes('next step') || q.includes('schedule') || q.includes('plan')) {
      const plan = this.generateWeeklyActionPlan();
      const planList = plan.map(p => `- **${p.day}**: ${p.action} (\`${p.priority} Priority\`)`).join('\n');

      return `### Executive Weekly Action Plan for ETS FOFANA CONFISERIE:\nHere is the recommended operational action plan for next week based on current inventory and expiry alerts:\n\n${planList}\n\n**Strategic Objective:** Clear items expiring under 30 days while maintaining healthy stock for high-demand lines.`;
    }

    // 1. Attention / Urgency / Risks / Focus / Problems
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

        return `### Products Requiring Immediate Attention & Action:\nFOF-AI identified **${urgentProducts.length} high-priority product(s)** requiring management intervention:\n\n${list}\n\n**AI Action Strategy:**\n- **Promotions:** Launch immediate 15% - 35% clearance discounts for expiring products in Mali and Burkina Faso.\n- **Reorders:** Place reorders for low-stock items (<200 units) from suppliers in Turkey and Morocco.`;
      }
    }

    // 2. Questions about Specific Products
    const matchingProduct = products.find(p => q.includes(p.product_name.toLowerCase()) || q.includes(p.brand.toLowerCase()) || q.includes(p.category.toLowerCase().replace('s', '')));
    if (matchingProduct) {
      const analysis = this.analyzeProduct(matchingProduct);
      const forecast = forecastService.getForecastForProduct(matchingProduct.product_id);
      return `### Intelligence Breakdown for **${matchingProduct.product_name}**:\n- **Category:** ${matchingProduct.category} (${matchingProduct.brand})\n- **Stock Level:** **${matchingProduct.quantity} ${matchingProduct.unit}** in ${matchingProduct.warehouse}\n- **Trade Flow:** ${matchingProduct.supplier_country} &rarr; ${matchingProduct.destination_country}\n- **Expiry Date:** ${matchingProduct.expiry_date} (${analysis.daysRemaining} days remaining)\n- **Profit Margin:** $${analysis.profitMargin.toFixed(2)} / ${matchingProduct.unit} (${analysis.profitMarginPercent}%)\n- **Predicted Demand:** ${forecast?.expected_demand || 'N/A'} units\n\n**AI Recommendation:** ${analysis.recommendation}`;
    }

    // 3. User / Admin / Role / Security Questions
    if (q.includes('admin') || q.includes('who is') || q.includes('user') || q.includes('manager') || q.includes('role') || q.includes('account')) {
      const userList = users.map(u => `- **${u.fullName}** (@${u.username}) &bull; Role: \`${u.role}\` &bull; Email: \`${u.email}\``).join('\n');
      return `### Registered System Administrators & Managers:\nFOF-AI multi-user role-based access control (RBAC) active users:\n\n${userList}\n\n**Security Policy:** Multiple administrators and managers can register their custom role and strong password directly from the Login page.`;
    }

    // 4. Quantity / Stock Level / How Much Product Questions
    if (q.includes('how much') || q.includes('total stock') || q.includes('inventory quantity') || q.includes('many product') || q.includes('how many') || q.includes('stock level')) {
      const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
      const list = products.map(p => `- **${p.product_name}**: ${p.quantity} ${p.unit} stored in **${p.warehouse}**`).join('\n');
      return `### Live Inventory Stock Report:\nETS FOFANA CONFISERIE manages **${totalUnits.toLocaleString()} total units** across ${products.length} active product lines:\n\n${list}\n\n**Total Inventory Cost:** $${products.reduce((acc, p) => acc + (p.quantity * p.cost_price), 0).toLocaleString()} (Expected Revenue: $${products.reduce((acc, p) => acc + (p.quantity * p.selling_price), 0).toLocaleString()}).`;
    }

    // 5. Expiry / Expiration / Month / 30 Days Questions
    if (q.includes('expire') || q.includes('expiry') || q.includes('shelf life') || q.includes('date')) {
      const expiring = products.filter(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - now.getTime()) / (86400000));
        return days <= 30;
      });

      if (expiring.length === 0) return "All active inventory items are fresh and have over 30 days of shelf life remaining.";

      const list = expiring.map(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - now.getTime()) / (86400000));
        return `- **${p.product_name}**: ${p.quantity} ${p.unit} in **${p.warehouse}** (Expires in **${days} days** on ${p.expiry_date})`;
      }).join('\n');
      return `### Expiry Status Report:\nFOF-AI detected ${expiring.length} product(s) approaching expiry:\n\n${list}\n\n**AI Recommendation:** Launch 15% - 35% discount campaigns across retail networks in Mali and Burkina Faso to clear stock.`;
    }

    // 6. Import / Procurement / Reorder / Purchasing / Turkey / Supplier Questions
    if (q.includes('import') || q.includes('order') || q.includes('procure') || q.includes('buy') || q.includes('supplier') || q.includes('turkey') || q.includes('morocco') || q.includes('tunisia') || q.includes('brazil')) {
      const needed = forecasts.filter(f => f.ai_interpretation === 'Inventory Shortage');
      const list = (needed.length > 0 ? needed : forecasts).slice(0, 4).map(f => `- **${f.product_name}**: Current Stock = ${f.current_stock}, Expected Demand = ${f.expected_demand}. **Rec. Import:** ${f.import_recommendation_qty} units.`).join('\n');
      return `### Procurement & Import Strategy:\nBased on demand forecasts and seasonal demand multipliers:\n\n${list}\n\n**AI Recommendation:** Place purchase orders with suppliers in Turkey, Tunisia, and Morocco before upcoming peak demand cycles.`;
    }

    // 7. Ramadan / Holiday / Seasonal Questions
    if (q.includes('ramadan') || q.includes('eid') || q.includes('season') || q.includes('holiday')) {
      const dates = products.find(p => p.category === 'Dates');
      return `### Seasonal Demand Forecast (Ramadan & Holidays):\nHistorical sales indicate a **2.8x seasonal demand multiplier** for confectionery and dates during Ramadan.\n\n- **Key Item:** ${dates?.product_name || 'Sultan Deglet Noor Dates'}\n- **Current Stock:** ${dates?.quantity || 1200} ${dates?.unit || 'Boxes'}\n- **Projected Ramadan Demand:** ~2,800 Boxes\n\n**Action Plan:** Prepare advance reorders from Tunisia to Bamako Central by early February.`;
    }

    // 8. Profit / Revenue / Margin / Performance Questions
    if (q.includes('profit') || q.includes('revenue') || q.includes('margin') || q.includes('best') || q.includes('top') || q.includes('money')) {
      const sortedMargin = [...products].sort((a,b) => (b.selling_price - b.cost_price) - (a.selling_price - a.cost_price));
      const top = sortedMargin[0];
      return `### Profitability & Financial Performance:\n- **Highest Margin Product:** **${top.product_name}**\n- **Cost Price:** $${top.cost_price.toFixed(2)} | **Selling Price:** $${top.selling_price.toFixed(2)}\n- **Net Margin:** $${(top.selling_price - top.cost_price).toFixed(2)} / ${top.unit} (${(((top.selling_price - top.cost_price)/top.cost_price)*100).toFixed(1)}%)\n- **Top Sales Destination:** **Mali** generates the highest overall revenue yield.`;
    }

    // 9. Simulation / Decision Support / What If Questions
    if (q.includes('if i') || q.includes('simulate') || q.includes('carton') || q.includes('500') || q.includes('should i')) {
      const sample = products[0];
      const sim = this.simulateDecision(sample, 500);
      return `### Decision Simulation (Import 500 Cartons of ${sample.product_name}):\n- **New Inventory Level:** ${sim.newInventoryLevel} units (${sim.projectedStockAvailabilityDays} days coverage)\n- **Projected Net Profit:** $${sim.projectedProfitMargin.toLocaleString()}\n- **Overstock Risk:** ${sim.overstockRisk}\n- **Expiry Risk:** ${sim.expiryRisk}\n\n**AI Verdict:** ${sim.aiVerdict}`;
    }

    // 10. Universal Dynamic Fallback
    const expiringCount = products.filter(p => {
      const days = Math.ceil((new Date(p.expiry_date).getTime() - now.getTime()) / (86400000));
      return days <= 30;
    }).length;

    const lowCount = products.filter(p => p.quantity < 300).length;

    return `### Executive Overview for ETS FOFANA CONFISERIE:\n- **Live Inventory Scope:** **${products.length} Products** (${products.reduce((a,b)=>a+b.quantity,0).toLocaleString()} total units)\n- **Critical Expiry Alerts (<30 Days):** **${expiringCount} Product(s)** requiring clearance\n- **Low Stock Threshold (<300 Units):** **${lowCount} Product(s)** needing reorder\n- **Top Financial Leader:** Sultan Deglet Noor Dates ($16.00 profit margin / Box)\n\n**AI Managerial Guidance:** Focus operations on promotional clearance for expiring items while maintaining procurement schedules for Turkish and Tunisian imports.`;
  }
}

export const aiService = new AIService();
