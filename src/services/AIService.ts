import { Product, Invoice, Customer, Supplier, SalesHistory, ExpiryAlert, DemandForecast, SeasonalEvent, AIProductAnalysis, AIPromotionAdvice, AIImportAdvice, DecisionSimulationResult, WeeklyActionPlanDay } from '../types';
import { dbService } from './DatabaseService';
import { forecastService } from './ForecastService';

/**
 * 🎯 User Intent Taxonomy
 */
export type UserIntent =
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

    // 1. INVOICES Intent
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

    // 2. CUSTOMERS Intent
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

    // 3. EXPIRY Intent
    if (
      q.includes('expire') ||
      q.includes('expiry') ||
      q.includes('peremption') ||
      q.includes('perim') ||
      q.includes('shelf life') ||
      q.includes('dlc')
    ) {
      return 'EXPIRY';
    }

    // 4. SUPPLIERS Intent
    if (
      q.includes('supplier') ||
      q.includes('fournisseur') ||
      q.includes('lead time') ||
      q.includes('delai') ||
      q.includes('vendor')
    ) {
      return 'SUPPLIERS';
    }

    // 5. FORECASTS / IMPORT Intent
    if (
      q.includes('import') ||
      q.includes('reorder') ||
      q.includes('forecast') ||
      q.includes('predict') ||
      q.includes('ramadan') ||
      q.includes('demand') ||
      q.includes('demande') ||
      q.includes('what should we buy') ||
      q.includes('que devrions-nous') ||
      q.includes('que devrions nous')
    ) {
      return 'FORECASTS';
    }

    // 6. INVENTORY Intent
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

    // 7. EXECUTIVE Intent (Default for general reports)
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
          })),
          salesSummaryModule: {
            totalInvoicesCount: invoices.length,
            totalRevenueFromInvoices: invoices.reduce((sum, i) => sum + i.total_amount, 0)
          }
        };

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
          }))
        };

      case 'EXPIRY':
        return {
          ...baseHeader,
          expiryAlertsModule: alerts.map(a => ({
            alertId: a.alert_id,
            productName: a.product_name,
            quantityAffected: a.quantity_affected,
            expiryDate: a.expiry_date,
            daysUntilExpiry: a.days_until_expiry,
            alertLevel: a.alert_level,
            aiRecommendation: a.ai_recommendation
          })),
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

      case 'FORECASTS':
        return {
          ...baseHeader,
          demandForecastsModule: forecasts.map(f => ({
            productName: f.product_name,
            category: f.category,
            currentStock: f.current_stock,
            expectedDemand: f.expected_demand,
            recommendedReorderQty: f.import_recommendation_qty,
            aiInterpretation: f.ai_interpretation,
            trend: f.trend
          })),
          seasonalEventsModule: events
        };

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
          suppliersModule: suppliers
        };
    }
  }
}

/**
 * ⚡ Intent-Driven Local Data Analytics Engine
 * Performs exact mathematical and logical calculations on live ERP database tables.
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

    // =========================================================================
    // INTENT 1: INVOICES ANALYTICS
    // =========================================================================
    if (intent === 'INVOICES') {
      // 1A. Highest Value Invoice
      if (q.includes('highest') || q.includes('plus elev') || q.includes('plus chere') || q.includes('max') || q.includes('biggest')) {
        if (invoices.length === 0) return isFr ? 'Aucune facture enregistrée dans le système.' : 'No invoices recorded in the system.';
        
        const topInvoice = [...invoices].sort((a, b) => b.total_amount - a.total_amount)[0];
        const itemsList = topInvoice.items && topInvoice.items.length > 0
          ? topInvoice.items.map(item => `  - **${item.product_name}**: ${item.quantity} cartons @ $${item.unit_price.toFixed(2)} = **$${item.total_price.toLocaleString()}**`).join('\n')
          : '  - Standard confectionery batch shipment';

        if (isFr) {
          return `### 🧾 Facture la plus Élevée (Valeur Maximale) :\n\n- **Numéro de Facture :** **${topInvoice.invoice_number}**\n- **Client :** **${topInvoice.customer_name}**\n- **Pays de Destination :** ${topInvoice.destination_country}\n- **Date d'Émission :** ${topInvoice.invoice_date}\n- **Mode de Paiement :** ${topInvoice.payment_method}\n- **Montant Total :** **$${topInvoice.total_amount.toLocaleString()}**\n- **Statut de Paiement :** ${topInvoice.status}\n\n**Produits Inclus dans la Facture :**\n${itemsList}`;
        }
        return `### 🧾 Highest Value Invoice Details:\n\n- **Invoice Number:** **${topInvoice.invoice_number}**\n- **Customer Name:** **${topInvoice.customer_name}**\n- **Destination Market:** ${topInvoice.destination_country}\n- **Issue Date:** ${topInvoice.invoice_date}\n- **Payment Method:** ${topInvoice.payment_method}\n- **Total Amount:** **$${topInvoice.total_amount.toLocaleString()}**\n- **Payment Status:** ${topInvoice.status}\n\n**Products Included in Invoice:**\n${itemsList}`;
      }

      // 1B. Specific Invoice Number Query (e.g. INV-2026-008)
      const invMatch = q.match(/inv[-\s]?\d{4}[-\s]?\d{3}/i) || q.match(/inv[-\s]?\d+/i);
      if (invMatch) {
        const searchedNum = invMatch[0].toUpperCase().replace(/\s+/g, '');
        const targetInv = invoices.find(i => i.invoice_number.toUpperCase().replace(/[-\s]/g, '') === searchedNum.replace(/[-\s]/g, '')) || invoices[invoices.length - 1];

        if (targetInv) {
          const itemsList = targetInv.items && targetInv.items.length > 0
            ? targetInv.items.map(item => `| **${item.product_name}** | ${item.quantity} Cartons | $${item.unit_price.toFixed(2)} | **$${item.total_price.toLocaleString()}** |`).join('\n')
            : '| Standard Confectionery Items | Batch | Included | $' + targetInv.total_amount.toFixed(2) + ' |';

          if (isFr) {
            return `### 🧾 Détails de la Facture ${targetInv.invoice_number} :\n- **Client :** ${targetInv.customer_name}\n- **Marché :** ${targetInv.destination_country}\n- **Date :** ${targetInv.invoice_date}\n- **Statut :** ${targetInv.status}\n\n| Produit Inclus | Quantité | Prix Unitaire | Total |\n| :--- | :--- | :--- | :--- |\n${itemsList}\n\n**Montant Total de la Facture :** **$${targetInv.total_amount.toLocaleString()}**`;
          }
          return `### 🧾 Invoice Breakdown for ${targetInv.invoice_number}:\n- **Customer:** ${targetInv.customer_name}\n- **Destination:** ${targetInv.destination_country}\n- **Date:** ${targetInv.invoice_date}\n- **Status:** ${targetInv.status}\n\n| Included Product | Quantity | Unit Price | Total |\n| :--- | :--- | :--- | :--- |\n${itemsList}\n\n**Total Invoice Amount:** **$${targetInv.total_amount.toLocaleString()}**`;
        }
      }

      // 1C. Unpaid / Pending Invoices
      if (q.includes('unpaid') || q.includes('pending') || q.includes('non paye') || q.includes('en attente')) {
        const pendingInvoices = invoices.filter(i => i.status !== 'Paid');
        const rows = pendingInvoices.map(i => `| **${i.invoice_number}** | ${i.customer_name} | ${i.invoice_date} | **$${i.total_amount.toLocaleString()}** | ${i.status} |`).join('\n');
        
        if (isFr) {
          return `### ⏳ Factures En Attente de Paiement (${pendingInvoices.length}) :\n\n| N° Facture | Client | Date | Montant Dû | Statut |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}`;
        }
        return `### ⏳ Pending Unpaid Invoices (${pendingInvoices.length}):\n\n| Invoice # | Customer | Issue Date | Amount Due | Status |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}`;
      }

      // 1D. All Invoices List
      const rows = invoices.map(i => `| **${i.invoice_number}** | ${i.customer_name} | ${i.destination_country} | ${i.invoice_date} | **$${i.total_amount.toLocaleString()}** | ${i.status} |`).join('\n');
      if (isFr) {
        return `### 🧾 Liste des Factures Émises (${invoices.length}) :\n\n| N° Facture | Client | Destination | Date | Montant | Statut |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${rows}`;
      }
      return `### 🧾 Issued Invoices Directory (${invoices.length}):\n\n| Invoice # | Customer | Destination | Date | Total Amount | Status |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${rows}`;
    }

    // =========================================================================
    // INTENT 2: CUSTOMERS CRM ANALYTICS
    // =========================================================================
    if (intent === 'CUSTOMERS') {
      // 2A. Best / Highest Spending Customer
      if (q.includes('best') || q.includes('meilleur') || q.includes('top') || q.includes('highest spending') || q.includes('plus grand')) {
        if (customers.length === 0) return isFr ? 'Aucun client enregistré.' : 'No customers registered.';
        const topCustomer = [...customers].sort((a, b) => b.total_spent - a.total_spent)[0];

        if (isFr) {
          return `### 🏆 Meilleur Client Entreprise (Plus Grand Acheteur) :\n\n- **Nom de la Société :** **${topCustomer.company_name || topCustomer.name}**\n- **Contact Principal :** ${topCustomer.name}\n- **Pays :** ${topCustomer.country}\n- **Dépenses Totales Cumulées :** **$${topCustomer.total_spent.toLocaleString()}**\n- **Nombre Total de Commandes :** ${topCustomer.total_orders} commandes\n- **Plafond de Crédit Accordé :** $${topCustomer.credit_limit.toLocaleString()}\n- **Statut CRM :** **${topCustomer.status}**\n- **Email :** ${topCustomer.email} | **Téléphone :** ${topCustomer.phone}`;
        }
        return `### 🏆 Top Enterprise Customer (Highest Spending Account):\n\n- **Company Name:** **${topCustomer.company_name || topCustomer.name}**\n- **Primary Contact:** ${topCustomer.name}\n- **Country:** ${topCustomer.country}\n- **Total Cumulative Revenue:** **$${topCustomer.total_spent.toLocaleString()}**\n- **Total Orders Executed:** ${topCustomer.total_orders} orders\n- **Approved Credit Limit:** $${topCustomer.credit_limit.toLocaleString()}\n- **CRM Account Status:** **${topCustomer.status}**\n- **Email:** ${topCustomer.email} | **Phone:** ${topCustomer.phone}`;
      }

      // 2B. Country Filter (e.g. Customers from Mali)
      const countries = ['mali', 'burkina', 'ivoire', 'angola'];
      const matchedCountry = countries.find(c => q.includes(c));

      if (matchedCountry) {
        const filteredCust = customers.filter(c => c.country.toLowerCase().includes(matchedCountry));
        const rows = filteredCust.map(c => `| **${c.company_name || c.name}** | ${c.name} | ${c.total_orders} commandes | **$${c.total_spent.toLocaleString()}** | ${c.status} |`).join('\n');
        
        const countryName = matchedCountry === 'mali' ? 'Mali 🇲🇱' : matchedCountry === 'burkina' ? 'Burkina Faso 🇧🇫' : matchedCountry === 'ivoire' ? "Côte d'Ivoire 🇨🇮" : 'Angola 🇦🇴';

        if (isFr) {
          return `### 👥 Clients Basés au ${countryName} (${filteredCust.length}) :\n\n| Entreprise | Contact | Commandes | Total Dépensé | Statut |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}`;
        }
        return `### 👥 Active Customers in ${countryName} (${filteredCust.length}):\n\n| Enterprise Account | Contact Name | Orders | Total Spent | CRM Status |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}`;
      }

      // 2C. All Customers List
      const rows = [...customers].sort((a, b) => b.total_spent - a.total_spent).map(c => `| **${c.company_name || c.name}** | ${c.country} | ${c.total_orders} orders | **$${c.total_spent.toLocaleString()}** | ${c.status} |`).join('\n');
      if (isFr) {
        return `### 👥 Répertoire Clients CRM (${customers.length}) :\n\n| Entreprise | Pays | Commandes | Chiffre d'Affaires | Statut |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}`;
      }
      return `### 👥 Complete Customer CRM Accounts (${customers.length}):\n\n| Enterprise Account | Country | Orders | Total Spent | Status |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}`;
    }

    // =========================================================================
    // INTENT 3: EXPIRY ANALYTICS
    // =========================================================================
    if (intent === 'EXPIRY') {
      const expItems = products.filter(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 60;
      }).sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());

      const rows = expItems.map(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const riskVal = p.quantity * p.cost_price;
        return `| **${p.product_name}** | ${p.quantity} ${p.unit} | ${p.warehouse} | ${p.expiry_date} (${days} days) | **$${riskVal.toLocaleString()}** |`;
      }).join('\n');

      if (isFr) {
        return `### ⏰ Analyse des Expirations de Stock (Sous 60 Jours) :\n\n| Produit | Stock Restant | Entrepôt | Date d'Expiration | Perte Financière Risquée |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n**Plan d'Action Exécutif :** Appliquer une remise immédiate de 15% à 25% pour écouler les lots avant péremption.`;
      }
      return `### ⏰ Live Shelf Expiry Risk Analysis (< 60 Days):\n\n| Product Line | Remaining Stock | Depot Location | Expiry Date | Potential Loss Risk |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n**Executive Action Plan:** Initiate immediate 15% to 25% promotional discounts to liquidate batches prior to shelf expiration.`;
    }

    // =========================================================================
    // INTENT 4: SUPPLIERS ANALYTICS
    // =========================================================================
    if (intent === 'SUPPLIERS') {
      const rows = suppliers.map(s => `| **${s.supplier_name}** | ${s.country} | ⭐ ${s.rating}/5 | ${s.lead_time_days} jours | ${s.contact_person} | ${s.products_supplied.join(', ')} |`).join('\n');
      if (isFr) {
        return `### 🏭 Répertoire des Fournisseurs Partenaires (${suppliers.length}) :\n\n| Fournisseur | Pays d'Origine | Note | Délai de Livraison | Contact | Gammes de Produits |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${rows}`;
      }
      return `### 🏭 Verified International Suppliers Directory (${suppliers.length}):\n\n| Supplier Name | Country | Rating | Lead Time | Contact Person | Supplied Products |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${rows}`;
    }

    // =========================================================================
    // INTENT 5: FORECASTS / IMPORT ANALYTICS
    // =========================================================================
    if (intent === 'FORECASTS') {
      const forecasts = forecastService.generateForecasts();
      const rows = forecasts.map(f => `| **${f.product_name}** | ${f.current_stock} Cartons | ${f.expected_demand} Cartons | **${f.import_recommendation_qty} Cartons** | ${f.trend} |`).join('\n');

      if (isFr) {
        return `### 🔮 Recommandations d'Importation & Prévisions de Demande :\n\n| Produit | Stock Actuel | Demande Prévue | Quantité à Importer | Tendance |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n**Conseil Stratégique :** Passer les commandes d'importation sous 48h auprès des fournisseurs en Turquie, Chine et Belgique pour éviter les ruptures pendant le Ramadan.`;
      }
      return `### 🔮 Demand Forecasting & Import Recommendations:\n\n| Product Line | Current Stock | Projected Demand | Recommended Reorder Qty | Market Trend |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n**Strategic Advice:** Issue purchase orders within 48 hours to preferred suppliers in Turkey, China, and Belgium to ensure inventory availability for high-demand seasonal surges.`;
    }

    // =========================================================================
    // INTENT 6: INVENTORY ANALYTICS
    // =========================================================================
    if (intent === 'INVENTORY') {
      // 6A. Category or origin filter
      let filteredProducts = products;

      if (q.includes('biscuit')) filteredProducts = products.filter(p => p.category === 'Biscuits' || p.product_name.toLowerCase().includes('biscuit'));
      else if (q.includes('chocolate') || q.includes('chocolat')) filteredProducts = products.filter(p => p.category === 'Chocolates' || p.product_name.toLowerCase().includes('chocolate') || p.product_name.toLowerCase().includes('chocolat'));
      else if (q.includes('candy') || q.includes('bonbon')) filteredProducts = products.filter(p => p.category === 'Candy' || p.product_name.toLowerCase().includes('candy'));
      else if (q.includes('turkey') || q.includes('turquie')) filteredProducts = products.filter(p => p.supplier_country === 'Turkey');
      else if (q.includes('china') || q.includes('chine')) filteredProducts = products.filter(p => p.supplier_country === 'China');
      else if (q.includes('morocco') || q.includes('maroc')) filteredProducts = products.filter(p => p.supplier_country === 'Morocco');

      const rows = filteredProducts.map(p => `| **${p.product_name}** | ${p.category} | **${p.quantity} ${p.unit}** | ${p.warehouse} | ${p.supplier_country} | $${p.selling_price.toFixed(2)} | **$${(p.quantity * p.selling_price).toLocaleString()}** |`).join('\n');

      if (isFr) {
        return `### 📦 Bilan des Stocks de Confiserie (${filteredProducts.length} Produits) :\n\n| Produit | Catégorie | Stock Restant | Entrepôt | Fournisseur | Prix Vente | Valeur Totale |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n${rows}`;
      }
      return `### 📦 Live Confectionery Inventory Balance (${filteredProducts.length} Products):\n\n| Product Name | Category | Available Stock | Logistics Depot | Origin Country | Selling Price | Total Value |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n${rows}`;
    }

    // =========================================================================
    // INTENT 7: EXECUTIVE SUMMARY (GENERAL REPORT)
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
   * 1. Detects User Intent (INVOICES, CUSTOMERS, INVENTORY, EXPIRY, SUPPLIERS, FORECASTS, EXECUTIVE).
   * 2. Assembles Focused Business Context with ONLY relevant ERP modules.
   * 3. Passes query + focused context to Gemini API.
   * 4. If Gemini API succeeds -> Displays Gemini's exact answer.
   * 5. If Gemini API rate-limits (429) or fails -> Calls LocalDataEngine (Intent-Driven Data Analytics Engine).
   */
  public async answerQueryAsync(query: string, language: string = 'en', userRole: string = 'Administrator'): Promise<string> {
    const focusedContext = BusinessContextBuilder.buildFocusedContext(query, userRole);

    const systemPrompt = `You are Gemini, an autonomous Executive Business Intelligence AI Agent for ETS FOFANA CONFISERIE (confectionery import & distribution enterprise based in Mali importing from Turkey, Morocco, Tunisia, Brazil, China, Thailand, and Belgium, and distributing across Mali, Burkina Faso, Côte d'Ivoire, and Angola).

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
- Answer the user's question directly with exact figures, invoice numbers, customer names, carton quantities, dollar amounts, product names, and country origins retrieved from the focused context.
- Reply entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.
- Use clean Markdown formatting with clear headers, tables, and bullet points.`;

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
