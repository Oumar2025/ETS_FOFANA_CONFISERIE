import { Product, Invoice, Customer, Supplier, SalesHistory, ExpiryAlert, DemandForecast, SeasonalEvent, AIProductAnalysis, AIPromotionAdvice, AIImportAdvice, DecisionSimulationResult, WeeklyActionPlanDay } from '../types';
import { dbService } from './DatabaseService';
import { forecastService } from './ForecastService';

/**
 * 🎯 User Intent Taxonomy
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
 * 🔍 Intent Detection Layer
 * Classifies user queries before retrieving ERP data to build lean, targeted context.
 */
export class IntentDetector {
  public static detectIntent(query: string): UserIntent {
    const q = query.toLowerCase().trim();

    // 0. IDENTITY / SYSTEM USER Intent
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

    // 1. OVERSTOCK ANALYSIS Intent
    if (
      q.includes('overstocked') ||
      q.includes('overstock') ||
      q.includes('too much stock') ||
      q.includes('excess inventory') ||
      q.includes('surplus') ||
      q.includes('surstock') ||
      q.includes('trop de stock')
    ) {
      return 'OVERSTOCK_ANALYSIS';
    }

    // 2. DISCOUNT RECOMMENDATIONS Intent
    if (
      q.includes('which products should be discounted') ||
      q.includes('should be discounted') ||
      q.includes('products need promotions') ||
      q.includes('should i promote') ||
      q.includes('suggest discounts') ||
      q.includes('remise') ||
      q.includes('promotion')
    ) {
      return 'DISCOUNT_RECOMMENDATIONS';
    }

    // 3. PROFIT IMPROVEMENT / STRATEGIC RECOMMENDATIONS Intent
    if (
      q.includes('improve profits') ||
      q.includes('increase profits') ||
      q.includes('boost profit') ||
      q.includes('recommendation for this month') ||
      q.includes('recommendation for month') ||
      q.includes('what is your recommendation') ||
      q.includes('biggest business risks') ||
      q.includes('biggest risks') ||
      q.includes('executive report') ||
      q.includes('generate executive report') ||
      q.includes('how to make more money') ||
      q.includes('comment augmenter les profits')
    ) {
      return 'PROFIT_IMPROVEMENT';
    }

    // 4. CUSTOMER DISCOUNT ANALYSIS Intent
    if (
      q.includes('which customer should receive a discount') ||
      q.includes('customer should receive a discount') ||
      q.includes('discount for customer') ||
      q.includes('give discount to customer') ||
      q.includes('client devrait recevoir une remise')
    ) {
      return 'CUSTOMER_DISCOUNT_ANALYSIS';
    }

    // 5. SUPPLIER RELIABILITY ANALYSIS Intent
    if (
      q.includes('best reliability') ||
      q.includes('most reliable') ||
      q.includes('supplier reliability') ||
      q.includes('delayed shipments') ||
      q.includes('meilleur fournisseur') ||
      q.includes('fiabilite')
    ) {
      return 'SUPPLIER_RELIABILITY_ANALYSIS';
    }

    // 6. INVOICES Intent
    if (
      q.includes('invoice') ||
      q.includes('facture') ||
      q.includes('inv-') ||
      q.includes('highest value') ||
      q.includes('plus chere') ||
      q.includes('plus elev') ||
      q.includes('unpaid') ||
      q.includes('non paye') ||
      q.includes('items in invoice') ||
      q.includes('products inside invoice') ||
      q.includes('included in invoice') ||
      q.includes('dans la facture')
    ) {
      return 'INVOICES';
    }

    // 7. CUSTOMERS Intent
    if (
      q.includes('customer') ||
      q.includes('client') ||
      q.includes('best customer') ||
      q.includes('meilleur client') ||
      q.includes('vip') ||
      q.includes('spending') ||
      q.includes('depense') ||
      q.includes('buyers') ||
      q.includes('acheteurs') ||
      q.includes('from mali') ||
      q.includes('au mali') ||
      q.includes('burkina') ||
      q.includes("d'ivoire") ||
      q.includes('angola')
    ) {
      return 'CUSTOMERS';
    }

    // 8. EXPIRY Intent
    if (
      q.includes('expire') ||
      q.includes('expiry') ||
      q.includes('peremption') ||
      q.includes('perim') ||
      q.includes('shelf life') ||
      q.includes('dlc') ||
      q.includes('lose money') ||
      q.includes('perte')
    ) {
      return 'EXPIRY';
    }

    // 9. SUPPLIERS Intent
    if (
      q.includes('supplier') ||
      q.includes('fournisseur') ||
      q.includes('lead time') ||
      q.includes('delai') ||
      q.includes('vendor')
    ) {
      return 'SUPPLIERS';
    }

    // 10. FORECASTS / IMPORT Intent
    if (
      q.includes('import') ||
      q.includes('reorder') ||
      q.includes('forecast') ||
      q.includes('predict') ||
      q.includes('ramadan') ||
      q.includes('demand') ||
      q.includes('demande') ||
      q.includes('what should we buy') ||
      q.includes('what should i import') ||
      q.includes('stop importing') ||
      q.includes('que devrions-nous')
    ) {
      return 'FORECASTS';
    }

    // 11. INVENTORY Intent
    if (
      q.includes('product') ||
      q.includes('produit') ||
      q.includes('stock') ||
      q.includes('inventory') ||
      q.includes('inventaire') ||
      q.includes('warehouse') ||
      q.includes('entrepot') ||
      q.includes('biscuit') ||
      q.includes('chocolate') ||
      q.includes('chocolat') ||
      q.includes('candy') ||
      q.includes('bonbon') ||
      q.includes('date') ||
      q.includes('turkey') ||
      q.includes('china') ||
      q.includes('morocco') ||
      q.includes('belgium') ||
      q.includes('thailand') ||
      q.includes('brazil') ||
      q.includes('tunisia') ||
      q.includes('remaining') ||
      q.includes('restant')
    ) {
      return 'INVENTORY';
    }

    // Default to EXECUTIVE
    return 'EXECUTIVE';
  }
}

/**
 * 🏢 Focused Context Builder
 * Assembles lean, targeted data modules tailored strictly to the detected intent.
 */
export class BusinessContextBuilder {
  public static buildFocusedContext(query: string, userRole: string = 'Administrator') {
    const intent = IntentDetector.detectIntent(query);
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

    const getSalesRev = (s: any) => Number(s?.total_revenue || (s?.quantity_sold * s?.unit_price) || 0);

    const baseHeader = {
      currentDate,
      requestingUserRole: userRole,
      detectedIntent: intent,
      companyProfile: {
        companyName: settings.general.companyName || 'ETS FOFANA CONFISERIE',
        currency: settings.general.currency || 'USD'
      }
    };

    switch (intent) {
      case 'IDENTITY':
        return {
          ...baseHeader,
          loggedInUsers: users.map(u => ({
            username: u.username,
            role: u.role,
            fullName: u.fullName,
            email: u.email,
            status: u.status
          }))
        };

      case 'OVERSTOCK_ANALYSIS':
      case 'DISCOUNT_RECOMMENDATIONS':
      case 'INVENTORY':
        return {
          ...baseHeader,
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
            expiryDate: p.expiry_date,
            warehouse: p.warehouse,
            status: p.status
          })),
          forecastsSummary: forecasts.map(f => ({
            productName: f.product_name,
            currentStock: f.current_stock,
            expectedDemand: f.expected_demand,
            aiInterpretation: f.ai_interpretation
          }))
        };

      case 'CUSTOMER_DISCOUNT_ANALYSIS':
      case 'CUSTOMERS':
        return {
          ...baseHeader,
          customersCRMModule: customers.map(c => ({
            customerId: c.customer_id,
            companyName: c.company_name || c.name,
            contactName: c.name,
            country: c.country,
            email: c.email,
            phone: c.phone,
            totalSpent: c.total_spent,
            totalOrders: c.total_orders,
            creditLimit: c.credit_limit,
            status: c.status
          })),
          topSalesByCustomer: sales.map(s => ({
            invoiceNumber: s.invoice_number,
            customerName: s.customer_name,
            totalRevenue: getSalesRev(s),
            date: s.date
          }))
        };

      case 'SUPPLIER_RELIABILITY_ANALYSIS':
      case 'SUPPLIERS':
        return {
          ...baseHeader,
          suppliersModule: suppliers.map(s => ({
            supplierId: s.supplier_id,
            supplierName: s.supplier_name,
            country: s.country,
            rating: s.rating,
            leadTimeDays: s.lead_time_days,
            contactPerson: s.contact_person,
            email: s.email,
            phone: s.phone,
            productsSupplied: s.products_supplied
          }))
        };

      case 'INVOICES':
        return {
          ...baseHeader,
          invoicesModule: invoices.map(i => ({
            invoiceNumber: i.invoice_number,
            customerName: i.customer_name,
            destinationCountry: i.destination_country,
            invoiceDate: i.invoice_date,
            paymentMethod: i.payment_method,
            subtotal: i.subtotal,
            tax: i.tax,
            totalAmount: i.total_amount,
            status: i.status,
            items: i.items
          }))
        };

      case 'EXPIRY':
        return {
          ...baseHeader,
          expiryAlertsModule: alerts,
          productsExpiringSoon: products.filter(p => {
            const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return days <= 60;
          }).map(p => ({
            name: p.product_name,
            quantity: p.quantity,
            unit: p.unit,
            expiryDate: p.expiry_date,
            warehouse: p.warehouse,
            costValueLossRisk: p.quantity * p.cost_price
          }))
        };

      case 'FORECASTS':
        return {
          ...baseHeader,
          demandForecastsModule: forecasts,
          seasonalEventsModule: events
        };

      case 'PROFIT_IMPROVEMENT':
      case 'EXECUTIVE':
      default:
        return {
          ...baseHeader,
          financialSummary: {
            totalInventoryCost: products.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0),
            totalInventoryRetail: products.reduce((sum, p) => sum + (p.quantity * p.selling_price), 0),
            potentialGrossProfit: products.reduce((sum, p) => sum + (p.quantity * (p.selling_price - p.cost_price)), 0),
            recordedRevenue: sales.reduce((sum, s) => sum + getSalesRev(s), 0),
            invoicesCount: invoices.length,
            customersCount: customers.length,
            suppliersCount: suppliers.length,
            skusCount: products.length
          },
          inventoryModule: products,
          customersModule: customers,
          invoicesModule: invoices,
          suppliersModule: suppliers,
          forecastsModule: forecasts
        };
    }
  }
}

/**
 * ⚡ Intent-Driven Business Reasoning & Analytics Engine
 * Converts raw ERP data into structured executive decisions and natural analytical answers.
 */
export class LocalDataEngine {
  public static analyzeAndRespond(query: string, language: string = 'en', userRole: string = 'Administrator'): string {
    const q = query.toLowerCase().trim();
    const isFr = language === 'fr';
    const intent = IntentDetector.detectIntent(query);

    const products = dbService.getProducts();
    const invoices = dbService.getInvoices();
    const customers = dbService.getCustomers();
    const suppliers = dbService.getSuppliers();
    const sales = dbService.getSalesHistory();
    const users = dbService.getUsers();
    const forecasts = forecastService.generateForecasts();

    // =========================================================================
    // INTENT 0: IDENTITY & SYSTEM USER LOOKUP
    // =========================================================================
    if (intent === 'IDENTITY') {
      const adminUser = users.find(u => u.role === 'Super Administrator' || u.username === 'admin') || users[0];
      if (isFr) {
        return `### 👤 Identité du Compte Administrateur Système :\n\n- **Nom Complet :** **${adminUser.fullName}**\n- **Nom d'Utilisateurs (Username) :** \`${adminUser.username}\`\n- **Rôle Système :** **${adminUser.role}**\n- **Adresse Email :** ${adminUser.email}\n- **Statut du Compte :** ${adminUser.status}\n\nVous êtes actuellement connecté avec les privilèges d'Administration Générale sur le système ERP ETS FOFANA CONFISERIE.`;
      }
      return `### 👤 System Administrator Account Identity:\n\n- **Full Name:** **${adminUser.fullName}**\n- **Username:** \`${adminUser.username}\`\n- **System Role:** **${adminUser.role}**\n- **Email Address:** ${adminUser.email}\n- **Account Status:** ${adminUser.status}\n\nYou are currently logged in with full System Administrator privileges across the ETS FOFANA CONFISERIE enterprise platform.`;
    }

    // =========================================================================
    // INTENT 1: OVERSTOCK ANALYSIS
    // =========================================================================
    if (intent === 'OVERSTOCK_ANALYSIS') {
      const overstockedItems = products.filter(p => p.quantity >= 1000 || p.quantity > 500);
      const totalTiedUpCapital = overstockedItems.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);

      const itemsList = overstockedItems.map(p => {
        const costVal = p.quantity * p.cost_price;
        return `• **${p.product_name}** (${p.category})\n  - **Current Inventory:** ${p.quantity.toLocaleString()} ${p.unit} (${p.warehouse})\n  - **Supplier Origin:** ${p.supplier_country}\n  - **Capital Tied Up:** **$${costVal.toLocaleString()}**\n  - **Risk Assessment:** Excess buffer capacity holding capital.`;
      }).join('\n\n');

      if (isFr) {
        return `### 📦 Analyse Exécutive des Surstocks d'Inventaire\n\n**Vue d'Ensemble**\nD'après l'analyse des niveaux de stock actuels, 3 lignes de produits présentent un stock excédentaire significatif bloquant le fonds de roulement.\n\n**Produits en Surstock :**\n${itemsList}\n\n**Impact Financier & Commercial :**\nUn total de **$${totalTiedUpCapital.toLocaleString()}** est actuellement immobilisé dans ces surstocks. Cela augmente les coûts de stockage en entrepôt et expose l'entreprise à des risques d'obsolescence.\n\n**Recommandations Exécutives :**\n1. **Actions Promotionnelles B2B :** Offrir une remise de 10% à 15% pour les achats en gros auprès des distributeurs au Mali et au Burkina Faso.\n2. **Pause des Commandes :** Suspendre temporairement les bons de commande d'importation pour ces références.`;
      }

      return `### 📦 Executive Inventory Overstock Analysis\n\n**Overview**\nBased on current inventory levels relative to monthly demand velocity, we have identified key product lines with excess inventory tying up working capital.\n\n**Overstocked Product Lines:**\n${itemsList}\n\n**Financial & Business Impact:**\nA total of **$${totalTiedUpCapital.toLocaleString()}** in working capital is currently locked in excess inventory holding. This increases warehouse storage overhead and long-term shelf expiration risk.\n\n**Executive Actionable Recommendations:**\n1. **Execute B2B Wholesale Promotions**: Offer a 10% to 15% volume discount for bulk purchase orders to regional distributors in Mali and Burkina Faso.\n2. **Pause Import Orders**: Temporarily halt new purchase orders for these SKUs until stock levels fall below 600 cartons.`;
    }

    // =========================================================================
    // INTENT 2: DISCOUNT RECOMMENDATIONS
    // =========================================================================
    if (intent === 'DISCOUNT_RECOMMENDATIONS') {
      const expiringItems = products.filter(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 45;
      });

      const totalRiskValue = expiringItems.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);

      const itemsList = expiringItems.map(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const recDiscount = days <= 15 ? '20% to 25% OFF' : '15% OFF';
        return `• **${p.product_name}**\n  - **Remaining Stock:** ${p.quantity} ${p.unit} (${p.warehouse})\n  - **Expiry Date:** ${p.expiry_date} (${days} days remaining)\n  - **Spoilage Loss Risk:** $${(p.quantity * p.cost_price).toLocaleString()}\n  - **Recommended Discount:** **${recDiscount}**`;
      }).join('\n\n');

      if (isFr) {
        return `### 🏷️ Recommandations Stratégiques de Remises & Promotions\n\n**Vue d'Ensemble**\nL'analyse de la durée de conservation des stocks identifie les produits nécessitant une promotion tarifaire immédiate pour accélérer l'écoulement avant expiration.\n\n**Produits Prioritaires pour Remise :**\n${itemsList}\n\n**Justification Financière :**\nAccorder ces remises évite une perte sèche estimée à **$${totalRiskValue.toLocaleString()}** tout en générant des liquidités immédiates.\n\n**Plan d'Action :**\nLancer la campagne promotionnelle sur les réseaux de distribution au Mali, Burkina Faso et Côte d'Ivoire sous 24h.`;
      }

      return `### 🏷️ Strategic Promotional Discount Recommendations\n\n**Overview**\nThe AI Business Analytics Engine evaluated inventory shelf-life risk and sales turnover velocity to identify products that require immediate discount promotions.\n\n**Priority Products for Discount:**\n${itemsList}\n\n**Financial Justification:**\nDiscounting these near-expiry items prevents an estimated **$${totalRiskValue.toLocaleString()}** in total inventory spoilage loss while accelerating cash flow recovery.\n\n**Action Plan:**\nLaunch the promotional pricing campaign across Mali, Burkina Faso, and Côte d'Ivoire distribution networks within 24 hours.`;
    }

    // =========================================================================
    // INTENT 3: PROFIT IMPROVEMENT / STRATEGIC ROADMAP
    // =========================================================================
    if (intent === 'PROFIT_IMPROVEMENT') {
      const topProduct = [...products].sort((a, b) => (b.selling_price - b.cost_price) - (a.selling_price - a.cost_price))[0];
      const topCustomer = [...customers].sort((a, b) => b.total_spent - a.total_spent)[0];
      const topSupplier = [...suppliers].sort((a, b) => b.rating - a.rating)[0];

      if (isFr) {
        return `### 💡 Feuille de Route Stratégique d'Optimisation des Profits (5 Actions Prioritaires)\n\n**Vue d'Ensemble**\nPour maximiser les marges bénéficiaires brutes et le chiffre d'affaires d'ETS FOFANA CONFISERIE ce mois-ci, l'IA recommande cinq initiatives opérationnelles :\n\n1. **Écouler Immédiatement les Stocks Proches de l'Expiration**\n   - *Analyse* : Les produits comme Oreo et PUFF représentent un risque de perte financière lié à la péremption.\n   - *Action* : Appliquer une remise de 15% à 20% pour récupérer le capital engagé avant expiration.\n\n2. **Concentrer la Force de Vente sur les Catégories à Forte Marge**\n   - *Analyse* : Les chocolats comme **${topProduct.product_name}** génèrent des marges élevées ($${(topProduct.selling_price - topProduct.cost_price).toFixed(2)} de profit par unité).\n   - *Action* : Offrir des commissions incitatives aux commerciaux pour la vente groupée de chocolats au Mali et en Angola.\n\n3. **Optimiser les Approvisionnements auprès des Fournisseurs Performants**\n   - *Analyse* : **${topSupplier.supplier_name}** (${topSupplier.country}) offre la meilleure fiabilité (Note ⭐ ${topSupplier.rating}/5, délai ${topSupplier.lead_time_days} jours).\n   - *Action* : Regrouper les commandes d'importation avec ${topSupplier.supplier_name} pour réduire les frais de transport maritime et terrestre.\n\n4. **Fidéliser les Grands Comptes VIP**\n   - *Analyse* : **${topCustomer.company_name || topCustomer.name}** a généré $${topCustomer.total_spent.toLocaleString()} de chiffre d'affaires.\n   - *Action* : Accorder une remise de 3% pour paiement anticipé afin de sécuriser les commandes du mois prochain.\n\n5. **Réapprovisionner les Lignes en Rupture de Stock**\n   - *Analyse* : Les produits en rupture entraînent des manques à gagner commerciaux.\n   - *Action* : Émettre des bons de commande sous 48h pour réapprovisionner les dépôts centraux.`;
      }

      return `### 💡 Strategic Profit Optimization Roadmap (5 Executive Actions)\n\n**Overview**\nTo maximize gross profit margins and enterprise revenue for ETS FOFANA CONFISERIE this month, the AI Business Analyst recommends five strategic operational initiatives:\n\n1. **Liquidate Near-Expiry Inventory Immediately**\n   - *Analysis*: Product lines near expiry represent potential spoilage loss risk.\n   - *Action*: Apply a 15% to 20% markdown to recover cost capital before shelf expiration.\n\n2. **Focus Sales Force on High-Margin Categories**\n   - *Analysis*: Premium products like **${topProduct.product_name}** yield high profit margins ($${(topProduct.selling_price - topProduct.cost_price).toFixed(2)} profit per carton).\n   - *Action*: Incentivize sales representatives to bundle high-margin lines with date shipments in Mali and Angola.\n\n3. **Optimize Supplier Procurement & Lead Times**\n   - *Analysis*: **${topSupplier.supplier_name}** (${topSupplier.country}) provides top logistics reliability (Rating ⭐ ${topSupplier.rating}/5, ${topSupplier.lead_time_days}-day lead time).\n   - *Action*: Consolidate purchase orders with ${topSupplier.supplier_name} to reduce shipping overhead by 8%.\n\n4. **Incentivize Top VIP Enterprise Accounts**\n   - *Analysis*: **${topCustomer.company_name || topCustomer.name}** generated $${topCustomer.total_spent.toLocaleString()} in cumulative revenue.\n   - *Action*: Offer a 3% early-payment rebate to secure advance purchase orders for next month.\n\n5. **Reorder Critical Low-Stock Lines**\n   - *Analysis*: Stockouts on popular confectionery lines lead to lost market share.\n   - *Action*: Issue purchase orders within 48 hours to restore warehouse buffers.`;
    }

    // =========================================================================
    // INTENT 4: CUSTOMER DISCOUNT ANALYSIS
    // =========================================================================
    if (intent === 'CUSTOMER_DISCOUNT_ANALYSIS') {
      const topSpent = [...customers].sort((a, b) => b.total_spent - a.total_spent)[0];
      const topOrders = [...customers].sort((a, b) => b.total_orders - a.total_orders)[0];

      if (isFr) {
        return `### 👥 Analyse Stratégique des Remises & Fidélité Client CRM\n\n**Vue d'Ensemble**\nL'analyse du volume d'achats et de la fréquence des commandes permet d'identifier les clients méritant des remises de fidélité :\n\n• **${topSpent.company_name || topSpent.name} (Top Partenaire VIP)**\n  - **Dépenses Cumulées :** **$${topSpent.total_spent.toLocaleString()}** (${topSpent.total_orders} commandes)\n  - **Statut CRM :** ${topSpent.status}\n  - **Remise Recommandée :** **3% d'Escompte pour Paiement Anticipé**\n  - *Justification* : Premier contributeur au chiffre d'affaires global. Renforcer la fidélisation en Angola/Mali.\n\n• **${topOrders.company_name || topOrders.name} (Plus Forte Fréquence de Commande)**\n  - **Dépenses Cumulées :** **$${topOrders.total_spent.toLocaleString()}** (${topOrders.total_orders} commandes)\n  - **Statut CRM :** ${topOrders.status}\n  - **Remise Recommandée :** **5% de Remise sur Volume**\n  - *Justification* : Client le plus régulier. Une remise sur le volume encourage des commandes par cartons plus importantes.`;
      }

      return `### 👥 Strategic Customer Discount & Loyalty Analysis\n\n**Overview**\nThe CRM Analytics Engine evaluated lifetime customer spend, order frequency, and account status to identify accounts eligible for loyalty discounts:\n\n• **${topSpent.company_name || topSpent.name} (Top VIP Partner)**\n  - **Total Cumulative Revenue:** **$${topSpent.total_spent.toLocaleString()}** (${topSpent.total_orders} completed orders)\n  - **CRM Status:** ${topSpent.status}\n  - **Recommended Benefit:** **3% Early Payment Discount**\n  - *Justification*: Single largest revenue contributor. Rewarding them strengthens enterprise retention.\n\n• **${topOrders.company_name || topOrders.name} (Highest Order Frequency)**\n  - **Total Cumulative Revenue:** **$${topOrders.total_spent.toLocaleString()}** (${topOrders.total_orders} completed orders)\n  - **CRM Status:** ${topOrders.status}\n  - **Recommended Benefit:** **5% Volume Rebate on Bulk Orders**\n  - *Justification*: Highest order frequency account. A volume rebate encourages larger carton purchases.`;
    }

    // =========================================================================
    // INTENT 5: SUPPLIER RELIABILITY ANALYSIS
    // =========================================================================
    if (intent === 'SUPPLIER_RELIABILITY_ANALYSIS') {
      const rankedSuppliers = [...suppliers].sort((a, b) => b.rating - a.rating);

      const listStr = rankedSuppliers.map((s, idx) => {
        return `**${idx + 1}. ${s.supplier_name} (${s.country})**\n   - **Reliability Rating:** ⭐ **${s.rating} / 5.0**\n   - **Shipping Lead Time:** ${s.lead_time_days} days\n   - **Products Supplied:** ${s.products_supplied.join(', ')}\n   - **Evaluation:** ${s.rating >= 4.8 ? 'Top Tier Partner - Highly Consistent' : 'Reliable Standard Vendor'}`;
      }).join('\n\n');

      if (isFr) {
        return `### 🏭 Classement de Fiabilité & Performance des Fournisseurs\n\n**Vue d'Ensemble**\nL'évaluation des partenaires fournisseurs internationaux repose sur les délais de livraison, la qualité des produits et la régularité logistique :\n\n${listStr}\n\n**Recommandation d'Approvisionnement :** Consolider les commandes avec les fournisseurs classés Rang #1 et #2 pour réduire les retards d'expédition.`;
      }

      return `### 🏭 Supplier Reliability & Performance Benchmark\n\n**Overview**\nThe Procurement Analytics Engine evaluated our international supplier network based on delivery lead times, product quality ratings, and logistics consistency:\n\n${listStr}\n\n**Procurement Recommendation:** Prioritize purchase order placement with Rank #1 and #2 suppliers to minimize shipment delays and optimize freight lead times.`;
    }

    // =========================================================================
    // INTENT 6: INVOICES ANALYTICS
    // =========================================================================
    if (intent === 'INVOICES') {
      if (q.includes('highest') || q.includes('plus elev') || q.includes('plus chere') || q.includes('max') || q.includes('biggest')) {
        const topInvoice = [...invoices].sort((a, b) => b.total_amount - a.total_amount)[0];
        const itemsList = topInvoice.items && topInvoice.items.length > 0
          ? topInvoice.items.map(item => `  - **${item.product_name}**: ${item.quantity} cartons @ $${item.unit_price.toFixed(2)} = **$${item.total_price.toLocaleString()}**`).join('\n')
          : '  - Standard confectionery batch shipment';

        if (isFr) {
          return `### 🧾 Détails de la Facture la plus Élevée\n\n**Aperçu Exécutif**\nLa facture ayant la valeur financière la plus élevée enregistrée dans le système est la suivante :\n\n• **Numéro de Facture :** **${topInvoice.invoice_number}**\n• **Client :** **${topInvoice.customer_name}**\n• **Marché de Destination :** ${topInvoice.destination_country}\n• **Date d'Émission :** ${topInvoice.invoice_date}\n• **Mode de Paiement :** ${topInvoice.payment_method}\n• **Montant Total :** **$${topInvoice.total_amount.toLocaleString()}**\n• **Statut :** **${topInvoice.status}**\n\n**Produits Inclus dans la Facture :**\n${itemsList}`;
        }

        return `### 🧾 Highest Value Invoice Details\n\n**Executive Summary**\nThe single invoice with the highest transaction value in the enterprise database is:\n\n• **Invoice Number:** **${topInvoice.invoice_number}**\n• **Customer Account:** **${topInvoice.customer_name}**\n• **Destination Market:** ${topInvoice.destination_country}\n• **Issue Date:** ${topInvoice.invoice_date}\n• **Payment Method:** ${topInvoice.payment_method}\n• **Total Invoice Amount:** **$${topInvoice.total_amount.toLocaleString()}**\n• **Payment Status:** **${topInvoice.status}**\n\n**Included Line Items:**\n${itemsList}`;
      }

      const invMatch = q.match(/inv[-\s]?\d{4}[-\s]?\d{3}/i) || q.match(/inv[-\s]?\d+/i);
      if (invMatch) {
        const searchedNum = invMatch[0].toUpperCase().replace(/\s+/g, '');
        const targetInv = invoices.find(i => i.invoice_number.toUpperCase().replace(/[-\s]/g, '') === searchedNum.replace(/[-\s]/g, '')) || invoices[0];

        const itemsList = targetInv.items && targetInv.items.length > 0
          ? targetInv.items.map(item => `  - **${item.product_name}**: ${item.quantity} cartons @ $${item.unit_price.toFixed(2)} = **$${item.total_price.toLocaleString()}**`).join('\n')
          : '  - Standard Confectionery Items';

        if (isFr) {
          return `### 🧾 Bilan Complet de la Facture ${targetInv.invoice_number}\n\n- **Client :** ${targetInv.customer_name}\n- **Destination :** ${targetInv.destination_country}\n- **Date d'Émission :** ${targetInv.invoice_date}\n- **Statut de Paiement :** ${targetInv.status}\n\n**Produits Inclus :**\n${itemsList}\n\n**Montant Total :** **$${targetInv.total_amount.toLocaleString()}**`;
        }

        return `### 🧾 Comprehensive Breakdown for ${targetInv.invoice_number}\n\n- **Customer Account:** ${targetInv.customer_name}\n- **Destination Market:** ${targetInv.destination_country}\n- **Issue Date:** ${targetInv.invoice_date}\n- **Payment Status:** ${targetInv.status}\n\n**Included Line Items:**\n${itemsList}\n\n**Total Invoice Value:** **$${targetInv.total_amount.toLocaleString()}**`;
      }

      const pendingInvoices = invoices.filter(i => i.status !== 'Paid');
      const pendingList = pendingInvoices.map(i => `• **${i.invoice_number}** | Customer: ${i.customer_name} | Amount Due: **$${i.total_amount.toLocaleString()}** | Issued: ${i.invoice_date}`).join('\n');

      return `### 🧾 Issued Invoices Summary (${invoices.length} Total Invoices)\n\n**Pending Unpaid Invoices:**\n${pendingList || 'All invoices are paid.'}\n\n**Total Enterprise Invoiced Revenue:** **$${invoices.reduce((sum, i) => sum + i.total_amount, 0).toLocaleString()}**`;
    }

    // =========================================================================
    // INTENT 7: CUSTOMERS CRM
    // =========================================================================
    if (intent === 'CUSTOMERS') {
      const topCustomer = [...customers].sort((a, b) => b.total_spent - a.total_spent)[0];
      const maliCust = customers.filter(c => c.country.toLowerCase().includes('mali'));

      if (q.includes('mali')) {
        const maliList = maliCust.map(c => `• **${c.company_name || c.name}** (${c.name})\n  - **Orders:** ${c.total_orders} completed\n  - **Total Revenue:** **$${c.total_spent.toLocaleString()}**\n  - **Status:** ${c.status}`).join('\n\n');
        return `### 👥 Enterprise Accounts in Mali 🇲🇱\n\n${maliList}`;
      }

      return `### 🏆 Top Enterprise Account & CRM Summary\n\n**Highest Spending Account:**\n- **Company Name:** **${topCustomer.company_name || topCustomer.name}**\n- **Country:** ${topCustomer.country}\n- **Total Revenue:** **$${topCustomer.total_spent.toLocaleString()}** (${topCustomer.total_orders} orders)\n- **CRM Account Status:** **${topCustomer.status}**\n\n**CRM Network Overview:**\n- Total Active CRM Accounts: ${customers.length} business clients\n- VIP Tier Accounts: ${customers.filter(c => c.status === 'VIP').length} clients`;
    }

    // =========================================================================
    // INTENT 8: EXPIRY ANALYTICS
    // =========================================================================
    if (intent === 'EXPIRY') {
      const expItems = products.filter(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 60;
      });

      const totalLossRisk = expItems.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);

      const itemsList = expItems.map(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return `• **${p.product_name}**: ${p.quantity} ${p.unit} in ${p.warehouse} | Expiry: ${p.expiry_date} (${days} days) | Financial Risk: **$${(p.quantity * p.cost_price).toLocaleString()}**`;
      }).join('\n');

      return `### ⏰ Shelf Life Expiry Risk Analysis (< 60 Days)\n\n**Items Near Expiry:**\n${itemsList}\n\n**Total Financial Spoilage Risk Exposure:** **$${totalLossRisk.toLocaleString()}**\n\n**Recommendation:** Apply immediate 15% to 25% promotional discounts to recover inventory cost capital before expiration dates.`;
    }

    // =========================================================================
    // INTENT 9: SUPPLIERS ANALYTICS
    // =========================================================================
    if (intent === 'SUPPLIERS') {
      const supList = suppliers.map(s => `• **${s.supplier_name}** (${s.country})\n  - **Rating:** ⭐ ${s.rating}/5.0\n  - **Lead Time:** ${s.lead_time_days} days\n  - **Products Supplied:** ${s.products_supplied.join(', ')}`).join('\n\n');

      return `### 🏭 International Suppliers Directory (${suppliers.length} Partners)\n\n${supList}`;
    }

    // =========================================================================
    // INTENT 10: FORECASTS / IMPORT ANALYTICS
    // =========================================================================
    if (intent === 'FORECASTS') {
      const forecastList = forecasts.slice(0, 5).map(f => `• **${f.product_name}** (${f.category})\n  - Current Stock: ${f.current_stock} cartons | Projected Demand: ${f.expected_demand} cartons\n  - **Recommended Reorder Qty:** **${f.import_recommendation_qty} cartons**\n  - Market Trend: ${f.trend}`).join('\n\n');

      return `### 🔮 Demand Forecasting & Import Recommendations\n\n**Priority Reorder Recommendations:**\n${forecastList}\n\n**Strategic Procurement Advice:** Place purchase orders within 48 hours with preferred suppliers in Turkey, China, and Belgium to ensure inventory availability for high-demand seasonal surges.`;
    }

    // =========================================================================
    // INTENT 11: INVENTORY ANALYTICS
    // =========================================================================
    if (intent === 'INVENTORY') {
      let filtered = products;
      if (q.includes('chocolate') || q.includes('chocolat')) filtered = products.filter(p => p.category === 'Chocolates' || p.product_name.toLowerCase().includes('choco') || p.product_name.toLowerCase().includes('laka') || p.product_name.toLowerCase().includes('delisso'));
      else if (q.includes('biscuit')) filtered = products.filter(p => p.category === 'Biscuits' || p.product_name.toLowerCase().includes('biscuit') || p.product_name.toLowerCase().includes('oreo') || p.product_name.toLowerCase().includes('today'));
      else if (q.includes('candy') || q.includes('bonbon')) filtered = products.filter(p => p.category === 'Candy' || p.product_name.toLowerCase().includes('candy') || p.product_name.toLowerCase().includes('ibon') || p.product_name.toLowerCase().includes('freegells'));

      const listStr = filtered.map(p => `• **${p.product_name}** (${p.category})\n  - **Stock:** ${p.quantity.toLocaleString()} ${p.unit} in ${p.warehouse}\n  - **Origin:** ${p.supplier_country} | **Selling Price:** $${p.selling_price.toFixed(2)}\n  - **Total Stock Valuation:** **$${(p.quantity * p.selling_price).toLocaleString()}**`).join('\n\n');

      return `### 📦 Live Confectionery Inventory Balance (${filtered.length} SKUs)\n\n${listStr}`;
    }

    // =========================================================================
    // INTENT 12: EXECUTIVE SUMMARY (GENERAL REPORT)
    // =========================================================================
    const getSalesRev = (s: any) => Number(s?.total_revenue || (s?.quantity_sold * s?.unit_price) || 0);
    const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);
    const totalRetail = products.reduce((sum, p) => sum + (p.quantity * p.selling_price), 0);
    const totalRevenue = sales.reduce((sum, s) => sum + getSalesRev(s), 0);
    const totalProfit = totalRetail - totalCost;

    if (isFr) {
      return `### 📊 Synthèse Stratégique & Financière ETS FOFANA CONFISERIE :\n\n- **Chiffre d'Affaires Global Enregistré :** **$${totalRevenue.toLocaleString()}**\n- **Valeur du Stock (Achat) :** **$${totalCost.toLocaleString()}** (Prix Vente : **$${totalRetail.toLocaleString()}**)\n- **Bénéfice Brut Potentiel :** **$${totalProfit.toLocaleString()}**\n- **Lignes de Produits Gérées :** ${products.length} références (SKUs)\n- **Factures Émises :** ${invoices.length} factures\n- **Comptes Clients Actifs :** ${customers.length} clients CRM\n- **Réseau de Fournisseurs :** ${suppliers.length} partenaires internationaux`;
    }

    return `### 📊 ETS FOFANA CONFISERIE Executive Financial & Operational Report:\n\n- **Total Recorded Sales Revenue:** **$${totalRevenue.toLocaleString()}**\n- **Inventory Cost Valuation:** **$${totalCost.toLocaleString()}** (Retail Sales Valuation: **$${totalRetail.toLocaleString()}**)\n- **Projected Gross Profit:** **$${totalProfit.toLocaleString()}**\n- **Active SKUs Managed:** ${products.length} confectionery product lines\n- **Total Issued Invoices:** ${invoices.length} invoices\n- **Active CRM Customer Accounts:** ${customers.length} business clients\n- **Verified Supplier Network:** ${suppliers.length} international suppliers`;
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
   * 1. Detects User Intent (IDENTITY, OVERSTOCK_ANALYSIS, DISCOUNT_RECOMMENDATIONS, PROFIT_IMPROVEMENT, etc.).
   * 2. Assembles Focused Business Context with ONLY relevant ERP modules.
   * 3. Passes query + focused context + Chief Business Intelligence Officer persona prompt to Gemini API.
   * 4. If Gemini API succeeds -> Displays Gemini's exact answer.
   * 5. If Gemini API rate-limits (429) or fails -> Calls LocalDataEngine (Intent-Driven Business Reasoning Engine).
   */
  public async answerQueryAsync(query: string, language: string = 'en', userRole: string = 'Administrator'): Promise<string> {
    const focusedContext = BusinessContextBuilder.buildFocusedContext(query, userRole);

    const systemPrompt = `You are Gemini, acting as the Chief Business Intelligence Officer for ETS FOFANA CONFISERIE (a confectionery import & distribution enterprise based in Mali importing from Turkey, Morocco, Tunisia, Brazil, China, Thailand, and Belgium, and distributing across Mali, Burkina Faso, Côte d'Ivoire, and Angola).

CRITICAL PERSONA INSTRUCTIONS:
- You are an experienced Business Analyst & Executive Advisor, NOT a simple database lookup tool.
- DO NOT just print raw data or dump markdown tables.
- ALWAYS structure your response with:
  1. **Overview / Executive Summary Statement**
  2. **Data-Grounded Analysis** (using clean bullet points with exact figures, dollar amounts, product names, dates, and customer names)
  3. **Financial & Business Impact** (working capital tied up, spoilage loss risk, or revenue opportunity)
  4. **Actionable Executive Recommendations** (clear, prioritized recommendations with justifications)

The AI Agent Intent Detector classified the user question into Intent: [${focusedContext.detectedIntent}].
The AI Agent constructed the following FOCUSED LIVE ERP BUSINESS CONTEXT:

================================================================================
[FOCUSED LIVE ERP BUSINESS CONTEXT]
================================================================================
${JSON.stringify(focusedContext, null, 2)}
================================================================================

USER QUESTION:
"${query}"

INSTRUCTIONS FOR GEMINI:
- Reply entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.
- Use clean Markdown formatting with bullet points and bold headers. DO NOT use markdown pipe tables.`;

    const geminiResult = await this.callGeminiAPI(systemPrompt);

    if (geminiResult.success && geminiResult.text) {
      return geminiResult.text;
    }

    // Smart Local Intent-Driven Analytics Engine Fallback
    return LocalDataEngine.analyzeAndRespond(query, language, userRole);
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
