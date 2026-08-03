import React, { useState } from 'react';
import { 
  FileText, Plus, ShoppingCart, User, Calendar, DollarSign, Globe, CreditCard, 
  CheckCircle2, Printer, Mail, Trash2, Edit, Search, Award, TrendingUp, AlertTriangle, Building, X, Eye, Download
} from 'lucide-react';
import { dbService, INITIAL_CUSTOMERS, INITIAL_PRODUCTS } from '../services/DatabaseService';
import { notificationService } from '../services/NotificationService';
import { Product, Customer, Invoice, PaymentMethod, DestinationCountry, LanguageCode, CurrencyCode } from '../types';
import { translations, formatPrice } from '../i18n/translations';
import { CountryFlag } from '../components/CountryFlag';
import { CalendarPicker } from '../components/CalendarPicker';

interface SalesInvoicePageProps {
  currentLanguage: LanguageCode;
  currentCurrency: CurrencyCode;
}

interface DraftInvoiceItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  max_stock: number;
  unit: string;
}

export const SalesInvoicePage: React.FC<SalesInvoicePageProps> = ({ currentLanguage, currentCurrency }) => {
  const t = translations[currentLanguage] || translations.en;
  const isFr = currentLanguage === 'fr';
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'crm'>('create');

  // Load Database Records safely
  const products = dbService.getProducts() || INITIAL_PRODUCTS;
  const customers = dbService.getCustomers() || INITIAL_CUSTOMERS;
  const invoices = dbService.getInvoices() || [];
  const salesHistory = dbService.getSalesHistory() || [];

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.customer_id || 1);
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [destinationCountry, setDestinationCountry] = useState<DestinationCountry>('Mali');
  const [notes, setNotes] = useState('');

  // Line Items State
  const [draftItems, setDraftItems] = useState<DraftInvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.product_id || 1);
  const [qtyToSell, setQtyToSell] = useState<number>(50);
  const [customUnitPrice, setCustomUnitPrice] = useState<number>(products[0]?.selling_price || 26.00);

  // Search & Filter state
  const [salesSearch, setSalesSearch] = useState('');
  const [crmSearch, setCrmSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);

  // Invoice Print / PDF Modal State
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Customer Edit / Add Modal State
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [custName, setCustName] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custCountry, setCustCountry] = useState<DestinationCountry>('Mali');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custCredit, setCustCredit] = useState<number>(25000);
  const [custStatus, setCustStatus] = useState<Customer['status']>('Active');

  const selectedProduct = products.find(p => p.product_id === selectedProductId) || products[0] || INITIAL_PRODUCTS[0];
  const selectedCustomer = customers.find(c => c.customer_id === selectedCustomerId) || customers[0] || INITIAL_CUSTOMERS[0];

  const handleProductSelect = (id: number) => {
    setSelectedProductId(id);
    const p = products.find(prod => prod.product_id === id);
    if (p) {
      setCustomUnitPrice(p.selling_price || 0);
      setQtyToSell(Math.min(50, p.quantity || 1));
      setDestinationCountry(p.destination_country || 'Mali');
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (qtyToSell <= 0) {
      alert(isFr ? 'La quantité doit être supérieure à 0' : 'Quantity must be greater than 0');
      return;
    }

    if (qtyToSell > selectedProduct.quantity) {
      alert(isFr ? `Attention: La quantité dépasse le stock disponible (${selectedProduct.quantity} ${selectedProduct.unit}).` : `Warning: Quantity exceeds current warehouse stock (${selectedProduct.quantity} ${selectedProduct.unit} available).`);
      return;
    }

    const existingIndex = draftItems.findIndex(item => item.product_id === selectedProductId);
    const totalPrice = qtyToSell * customUnitPrice;

    if (existingIndex > -1) {
      const updated = [...draftItems];
      updated[existingIndex].quantity += qtyToSell;
      updated[existingIndex].total_price = updated[existingIndex].quantity * customUnitPrice;
      setDraftItems(updated);
    } else {
      setDraftItems([
        ...draftItems,
        {
          product_id: selectedProduct.product_id,
          product_name: selectedProduct.product_name,
          quantity: qtyToSell,
          unit_price: customUnitPrice,
          total_price: totalPrice,
          max_stock: selectedProduct.quantity,
          unit: selectedProduct.unit
        }
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setDraftItems(draftItems.filter((_, i) => i !== index));
  };

  const subtotal = draftItems.reduce((acc, item) => acc + (item.total_price || 0), 0);
  const totalAmount = subtotal;

  const handleGenerateInvoice = () => {
    if (draftItems.length === 0) {
      alert(isFr ? 'Veuillez ajouter au moins un produit à la facture.' : 'Please add at least one product item to the invoice.');
      return;
    }

    const newInvoice = dbService.createInvoice({
      customer_id: selectedCustomer.customer_id,
      customer_name: selectedCustomer.company_name || selectedCustomer.name,
      customer_email: selectedCustomer.email || '',
      customer_phone: selectedCustomer.phone || '',
      destination_country: destinationCountry,
      invoice_date: invoiceDate,
      payment_method: paymentMethod,
      items: draftItems.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price
      })),
      subtotal: subtotal,
      tax: 0,
      total_amount: totalAmount,
      status: 'Paid',
      notes: notes
    });

    setSuccessMessage(isFr ? `Facture ${newInvoice.invoice_number} générée avec succès ! Stock déduit automatiquement.` : `Invoice ${newInvoice.invoice_number} generated successfully! Stock automatically deducted.`);
    setDraftItems([]);
    setNotes('');

    // Open PDF preview modal automatically for printing/saving
    setPreviewInvoice(newInvoice);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleDownloadPdf = (invoice: Invoice) => {
    const element = document.getElementById('printable-invoice-document');
    if (element && (window as any).html2pdf) {
      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `ETS_FOFANA_Invoice_${invoice.invoice_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      (window as any).html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    setEmailStatusMessage(isFr ? `Envoi de la facture par email à ${invoice.customer_email || 'client'}...` : `Dispatching invoice email to ${invoice.customer_email || 'client'}...`);
    const res = await notificationService.sendInvoiceEmail(invoice);
    if (res.success) {
      setEmailStatusMessage(isFr ? `Facture ${invoice.invoice_number} envoyée par email avec succès !` : `Invoice ${invoice.invoice_number} emailed successfully!`);
    } else {
      setEmailStatusMessage(isFr ? `Notification d'envoi d'email transmise à ${invoice.customer_email || 'f.oumarou78@gmail.com'}` : `Email sent notification to ${invoice.customer_email || 'f.oumarou78@gmail.com'}`);
    }
    setTimeout(() => setEmailStatusMessage(null), 4000);
  };

  const handleDeleteInvoice = (id: number, invNum: string) => {
    if (window.confirm(isFr ? `Êtes-vous sûr de vouloir supprimer la facture ${invNum} ?` : `Are you sure you want to delete invoice ${invNum}?`)) {
      dbService.deleteInvoice(id);
      setSuccessMessage(isFr ? `Facture ${invNum} supprimée.` : `Invoice ${invNum} deleted successfully.`);
      if (previewInvoice?.invoice_id === id) setPreviewInvoice(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustName('');
    setCustCompany('');
    setCustCountry('Mali');
    setCustEmail('');
    setCustPhone('');
    setCustCredit(25000);
    setCustStatus('Active');
    setShowCustomerModal(true);
  };

  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustName(c.name);
    setCustCompany(c.company_name);
    setCustCountry(c.country);
    setCustEmail(c.email);
    setCustPhone(c.phone);
    setCustCredit(c.credit_limit);
    setCustStatus(c.status);
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custCompany.trim()) return;

    if (editingCustomer) {
      dbService.updateCustomer(editingCustomer.customer_id, {
        name: custName,
        company_name: custCompany,
        country: custCountry,
        email: custEmail,
        phone: custPhone,
        credit_limit: custCredit,
        status: custStatus
      });
      setSuccessMessage(isFr ? `Client "${custCompany}" mis à jour avec succès.` : `Customer "${custCompany}" updated successfully.`);
    } else {
      dbService.addCustomer({
        name: custName,
        company_name: custCompany,
        country: custCountry,
        email: custEmail || `${custName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        phone: custPhone || '+223 70 00 00 00',
        credit_limit: custCredit,
        status: custStatus
      });
      setSuccessMessage(isFr ? `Nouveau client "${custCompany}" enregistré avec succès.` : `New customer "${custCompany}" registered successfully.`);
    }

    setShowCustomerModal(false);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteCustomer = (id: number, name: string) => {
    if (window.confirm(isFr ? `Supprimer le client "${name}" ?` : `Delete customer "${name}"?`)) {
      dbService.deleteCustomer(id);
      setSuccessMessage(isFr ? `Client "${name}" supprimé.` : `Customer "${name}" deleted.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const filteredSales = salesHistory.filter(s => 
    (s.product_name || '').toLowerCase().includes(salesSearch.toLowerCase()) ||
    (s.customer_name || '').toLowerCase().includes(salesSearch.toLowerCase()) ||
    (s.invoice_number || '').toLowerCase().includes(salesSearch.toLowerCase()) ||
    (s.destination_country || '').toLowerCase().includes(salesSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(crmSearch.toLowerCase()) ||
    (c.company_name || '').toLowerCase().includes(crmSearch.toLowerCase()) ||
    (c.country || '').toLowerCase().includes(crmSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print-hide">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <FileText className="h-7 w-7 text-amber-400" />
            <span>{t.salesInvoiceTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.salesInvoiceSubtitle}
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
              activeTab === 'create' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>{t.createInvoiceTab}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
              activeTab === 'history' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{isFr ? 'Registre des Factures' : 'Invoices Ledger'} ({invoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
              activeTab === 'crm' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="h-4 w-4" />
            <span>{t.customerCrmTab} ({customers.length})</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-3 shadow-lg print-hide">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {emailStatusMessage && (
        <div className="p-4 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center space-x-3 shadow-lg print-hide">
          <Mail className="h-5 w-5 shrink-0 text-blue-400" />
          <span>{emailStatusMessage}</span>
        </div>
      )}

      {/* TAB 1: CREATE SALES INVOICE */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print-hide">
          {/* Left Panel: Invoice Details & Product Selection */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Info Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <Building className="h-4 w-4 text-amber-400" />
                <span>{isFr ? '1. En-tête de Facture & Client' : '1. Invoice & Customer Header'}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Select Customer */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">{t.customerName}</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.customer_id} value={c.customer_id}>
                        {c.company_name || c.name} ({c.country})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calendar Picker for Invoice Date */}
                <CalendarPicker
                  label={t.invoiceDate}
                  value={invoiceDate}
                  onChange={(dateStr) => setInvoiceDate(dateStr)}
                />

                {/* Destination Country */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Marché de Destination' : 'Destination Market'}</label>
                  <select
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value as DestinationCountry)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Mali">🇲🇱 Mali</option>
                    <option value="Burkina Faso">🇧🇫 Burkina Faso</option>
                    <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
                    <option value="Angola">🇦🇴 Angola</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">{t.paymentMethod}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Bank Transfer">{isFr ? 'Virement Bancaire' : 'Bank Transfer'}</option>
                    <option value="Cash">{isFr ? 'Comptant / Espèces' : 'Cash'}</option>
                    <option value="Check">{isFr ? 'Chèque' : 'Check'}</option>
                    <option value="Credit / Account">{isFr ? 'Crédit / Compte' : 'Credit / Account'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Line Item Picker Form */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4 text-amber-400" />
                <span>{isFr ? '2. Ajouter des Produits à la Facture' : '2. Add Products to Invoice'}</span>
              </h2>

              <form onSubmit={handleAddItem} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-300 uppercase block">{t.selectProduct}</label>
                    <span className="text-[11px] text-amber-400 font-bold">
                      {isFr ? 'Stock Disponible :' : 'Available Stock:'} {selectedProduct?.quantity || 0} {selectedProduct?.unit || 'Cartons'} ({selectedProduct?.warehouse || 'Entrepôt A'})
                    </span>
                  </div>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductSelect(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {products.map(p => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name} — {p.quantity} {p.unit} ({formatPrice(p.selling_price || 0, currentCurrency)}/{p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block">{t.qtyToSell}</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct?.quantity || 9999}
                      value={qtyToSell}
                      onChange={(e) => setQtyToSell(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block">{t.unitPrice} (USD)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={customUnitPrice}
                      onChange={(e) => setCustomUnitPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t.addItem}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Invoice Live Draft Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <img src="/ets_fofana_logo.jpg" alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
                      <span className="font-extrabold text-white text-base tracking-tight gold-gradient-text">
                        ETS FOFANA CONFISERIE
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{isFr ? 'Facture Officielle de Vente' : 'Official Sales Invoice & Dispatch Note'}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
                      DRAFT
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{invoiceDate}</p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="py-3 border-b border-slate-800/80 text-xs space-y-1">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">{isFr ? 'Facturé à :' : 'Billed To:'}</p>
                  <p className="font-extrabold text-white">{selectedCustomer?.company_name || selectedCustomer?.name || 'Client'}</p>
                  <p className="text-slate-300 flex items-center space-x-1">
                    <CountryFlag countryName={destinationCountry} className="h-3 w-4 inline mr-1" />
                    <span>{isFr ? 'Marché :' : 'Market:'} {destinationCountry}</span>
                  </p>
                  <p className="text-slate-400 text-[11px]">{isFr ? 'Paiement :' : 'Payment:'} <strong className="text-amber-400">{paymentMethod}</strong></p>
                </div>

                {/* Invoice Items Table */}
                <div className="py-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{isFr ? 'Articles Facturés' : 'Line Items'} ({draftItems.length})</h3>
                  
                  {draftItems.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                      {isFr ? 'Aucun produit ajouté à la facture. Sélectionnez un produit et cliquez sur Ajouter.' : 'No products added to invoice draft yet. Select a product and click Add Item.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {draftItems.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                          <div className="flex-1 pr-2">
                            <p className="font-bold text-slate-100">{item.product_name}</p>
                            <p className="text-[11px] text-slate-400">
                              {item.quantity} {item.unit} &times; ${item.unit_price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right flex items-center space-x-3">
                            <span className="font-extrabold text-amber-400">{formatPrice(item.total_price, currentCurrency)}</span>
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Subtotal & Action Buttons */}
              <div className="border-t border-slate-800 pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-300 uppercase">{isFr ? 'Montant Total :' : 'Total Amount:'}</span>
                  <span className="text-xl font-black text-amber-400">{formatPrice(totalAmount, currentCurrency)}</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-snug">
                  {t.automaticDeductionNotice}
                </div>

                <button
                  onClick={handleGenerateInvoice}
                  disabled={draftItems.length === 0}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center space-x-2 transition disabled:opacity-40"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t.generateInvoice}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES DIRECTORY & SALES HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 print-hide">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="h-4 w-4 text-amber-400" />
                <span>{isFr ? 'Registre Officiel des Factures Émises' : 'Official Issued Invoices Directory'} ({invoices.length})</span>
              </h2>
              <p className="text-xs text-slate-400">{isFr ? 'Affichez, téléchargez en PDF, envoyez par email ou supprimez les factures' : 'View, download PDF document, dispatch email, or delete registered invoices'}</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                placeholder={isFr ? 'Rechercher facture #, client, pays...' : 'Search invoice #, client, country...'}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">{t.invoiceNumber}</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">{t.customerName}</th>
                  <th className="py-3 px-4">{isFr ? 'Marché' : 'Market'}</th>
                  <th className="py-3 px-4">{t.paymentMethod}</th>
                  <th className="py-3 px-4">{isFr ? 'Montant Total' : 'Total Amount'}</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {invoices
                  .filter(inv => 
                    inv.invoice_number.toLowerCase().includes(salesSearch.toLowerCase()) ||
                    inv.customer_name.toLowerCase().includes(salesSearch.toLowerCase()) ||
                    inv.destination_country.toLowerCase().includes(salesSearch.toLowerCase())
                  )
                  .map(inv => (
                    <tr key={inv.invoice_id} className="hover:bg-slate-900/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{inv.invoice_number}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{inv.invoice_date}</td>
                      <td className="py-3 px-4 font-bold text-slate-100">{inv.customer_name}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center space-x-1">
                          <CountryFlag countryName={inv.destination_country} className="h-3 w-4 inline mr-1" />
                          <span>{inv.destination_country}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{inv.payment_method}</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-400">
                        {formatPrice(inv.total_amount || 0, currentCurrency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Printable Official PDF Preview */}
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 font-bold text-[11px] border border-amber-500/30 flex items-center space-x-1"
                            title={isFr ? 'Voir & Télécharger le Document PDF' : 'View & Download PDF Invoice Document'}
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>{isFr ? 'Aperçu / PDF' : 'PDF / Print'}</span>
                          </button>

                          {/* Email Invoice */}
                          <button
                            onClick={() => handleSendEmail(inv)}
                            className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-blue-400 border border-slate-800"
                            title={isFr ? 'Envoyer au Client par Email' : 'Send Invoice to Client Email'}
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Invoice */}
                          <button
                            onClick={() => handleDeleteInvoice(inv.invoice_id, inv.invoice_number)}
                            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-800"
                            title={isFr ? 'Supprimer la Facture' : 'Delete Invoice'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER CRM DIRECTORY */}
      {activeTab === 'crm' && (
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 print-hide">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <User className="h-4 w-4 text-amber-400" />
                <span>{t.customerCrmTab} ({customers.length})</span>
              </h2>
              <p className="text-xs text-slate-400">{isFr ? 'Suivez le volume des commandes clients, le chiffre d\'affaires et gérez les profils' : 'Track client order volume, lifetime spending, credit limits & edit profiles'}</p>
            </div>

            <button
              onClick={handleOpenAddCustomer}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-gold-glow transition"
            >
              <Plus className="h-4 w-4" />
              <span>{isFr ? 'Ajouter un Client' : 'Add Customer'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredCustomers.map(cust => (
              <div key={cust.customer_id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md hover:border-amber-500/40 transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{cust.company_name || cust.name}</h3>
                      <p className="text-xs text-slate-400">{cust.name}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      cust.status === 'VIP' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {cust.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isFr ? 'Pays :' : 'Country:'}</span>
                      <span className="font-semibold flex items-center space-x-1">
                        <CountryFlag countryName={cust.country} className="h-3 w-4 inline mr-1" />
                        <span>{cust.country}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-mono text-slate-300 text-[11px]">{cust.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isFr ? 'Commandes Totales :' : 'Total Orders:'}</span>
                      <span className="font-bold text-amber-400">{cust.total_orders || 0} {isFr ? 'Commandes' : 'Orders'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isFr ? 'Chiffre d\'Affaires :' : 'Lifetime Revenue:'}</span>
                      <span className="font-bold text-emerald-400">{formatPrice(cust.total_spent || 0, currentCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isFr ? 'Limite de Crédit :' : 'Credit Limit:'}</span>
                      <span className="font-mono text-slate-300">{formatPrice(cust.credit_limit || 0, currentCurrency)}</span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Customer Controls */}
                <div className="pt-3 border-t border-slate-800/80 flex justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEditCustomer(cust)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center space-x-1 transition"
                  >
                    <Edit className="h-3.5 w-3.5 text-amber-400" />
                    <span>{isFr ? 'Modifier' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(cust.customer_id, cust.company_name)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-bold flex items-center space-x-1 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{isFr ? 'Supprimer' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEDICATED OFFICIAL INVOICE PDF PRINT MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[999] overflow-y-auto print-hide">
          <div className="bg-slate-900 border border-slate-800 max-w-3xl w-full rounded-2xl p-6 space-y-6 shadow-2xl relative">
            {/* Modal Controls Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  {isFr ? 'Aperçu du Document PDF Facture' : 'Official Invoice PDF Document Preview'} ({previewInvoice.invoice_number})
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                {/* DIRECT REAL PDF FILE DOWNLOAD BUTTON */}
                <button
                  onClick={() => handleDownloadPdf(previewInvoice)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-gold-glow flex items-center space-x-1.5 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>{isFr ? 'Télécharger Fichier PDF' : 'Download PDF Document'}</span>
                </button>

                <button
                  onClick={() => handleSendEmail(previewInvoice)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-bold border border-blue-500/30 flex items-center space-x-1.5"
                >
                  <Mail className="h-4 w-4" />
                  <span>{isFr ? 'Email Client' : 'Email Client'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5"
                  title="Print Document"
                >
                  <Printer className="h-4 w-4" />
                  <span>{isFr ? 'Imprimer' : 'Print'}</span>
                </button>

                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* REAL PRINTABLE OFFICIAL INVOICE LAYOUT */}
            <div id="printable-invoice-document" className="printable-invoice-document bg-white text-slate-900 p-8 rounded-xl space-y-6 border border-slate-200">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b-2 border-amber-500 pb-6">
                <div>
                  <div className="flex items-center space-x-3">
                    <img src="/ets_fofana_logo.jpg" alt="Logo" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">ETS FOFANA CONFISERIE</h1>
                      <p className="text-xs text-slate-600 font-semibold">{isFr ? 'Importation & Distribution Confiserie Mali' : 'Import & Distribution Confectionery Mali'}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Bamako Central Depot &bull; Tel: +223 70 00 00 00 &bull; Email: info@fofana-confiserie.com
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 bg-amber-500 text-slate-950 font-mono font-black text-sm rounded uppercase">
                    {isFr ? 'FACTURE' : 'INVOICE'}
                  </span>
                  <p className="text-sm font-black text-slate-900 mt-2 font-mono">{previewInvoice.invoice_number}</p>
                  <p className="text-xs text-slate-600 font-semibold">Date: {previewInvoice.invoice_date}</p>
                </div>
              </div>

              {/* Bill To & Dispatch Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
                <div>
                  <p className="text-slate-500 font-extrabold uppercase text-[10px]">{isFr ? 'FACTURE À :' : 'BILLED TO CUSTOMER:'}</p>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{previewInvoice.customer_name}</p>
                  <p className="text-slate-600">{previewInvoice.customer_email || 'client@domain.com'}</p>
                  <p className="text-slate-600">{previewInvoice.customer_phone || '+223 70 00 00 00'}</p>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-slate-500 font-extrabold uppercase text-[10px]">{isFr ? 'DESTINATION & PAIEMENT :' : 'DESTINATION & PAYMENT:'}</p>
                  <p className="font-bold text-slate-900">{isFr ? 'Marché Destination :' : 'Destination Market:'} {previewInvoice.destination_country}</p>
                  <p className="text-slate-700">{isFr ? 'Mode de Paiement :' : 'Payment Terms:'} <strong className="text-amber-700">{previewInvoice.payment_method}</strong></p>
                  <p className="text-slate-700">{isFr ? 'Statut :' : 'Status:'} <strong className="text-emerald-600">{previewInvoice.status}</strong></p>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">{isFr ? 'Désignation Produit' : 'Item Description'}</th>
                    <th className="py-2.5 px-3 text-center">{isFr ? 'Quantité' : 'Quantity'}</th>
                    <th className="py-2.5 px-3 text-right">{isFr ? 'Prix Unitaire' : 'Unit Price'}</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {previewInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-bold text-slate-900">{item.product_name}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-700">{item.quantity}</td>
                      <td className="py-3 px-3 text-right text-slate-700">${item.unit_price.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">${item.total_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotal Summary */}
              <div className="flex justify-between items-center border-t-2 border-slate-900 pt-4 text-sm font-bold">
                <span className="text-slate-700">{isFr ? 'MONTANT TOTAL DÛ :' : 'TOTAL AMOUNT DUE:'}</span>
                <span className="text-2xl font-black text-slate-900 font-mono">${previewInvoice.total_amount.toFixed(2)}</span>
              </div>

              {/* Official Stamp & Signature Block */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{isFr ? 'Notes & Conditions :' : 'Notes & Terms:'}</p>
                  <p className="text-slate-600 italic text-[11px]">{previewInvoice.notes || (isFr ? 'Document officiel d\'expédition délivré par ETS FOFANA CONFISERIE.' : 'Official dispatch document issued by ETS FOFANA CONFISERIE.')}</p>
                </div>

                <div className="text-center border-t border-slate-400 pt-2 w-48">
                  <p className="font-extrabold text-slate-900">{isFr ? 'Gestionnaire Autorisé' : 'Authorized Manager'}</p>
                  <p className="text-[10px] text-slate-500">{isFr ? 'Signature et Cachet Officiel' : 'Signature & Official Stamp'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Add / Edit Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 print-hide">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
              <User className="h-5 w-5 text-amber-400" />
              <span>{editingCustomer ? (isFr ? 'Modifier le Profil Client' : 'Edit Customer Profile') : (isFr ? 'Enregistrer un Nouveau Client' : 'Register New Client / Customer')}</span>
            </h3>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Nom de la Société' : 'Company Name'}</label>
                <input
                  type="text"
                  required
                  value={custCompany}
                  onChange={(e) => setCustCompany(e.target.value)}
                  placeholder="e.g. Bamako Wholesale SARL"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Personne de Contact' : 'Contact Person Name'}</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Mamadou Diarra"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Pays' : 'Country'}</label>
                  <select
                    value={custCountry}
                    onChange={(e) => setCustCountry(e.target.value as DestinationCountry)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="Mali">🇲🇱 Mali</option>
                    <option value="Burkina Faso">🇧🇫 Burkina Faso</option>
                    <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
                    <option value="Angola">🇦🇴 Angola</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Statut' : 'Status'}</label>
                  <select
                    value={custStatus}
                    onChange={(e) => setCustStatus(e.target.value as Customer['status'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="VIP">VIP Client</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">Email</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="client@domain.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Téléphone' : 'Phone'}</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+223 70 00 00 00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Limite de Crédit ($)' : 'Credit Limit ($)'}</label>
                <input
                  type="number"
                  value={custCredit}
                  onChange={(e) => setCustCredit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-gold-glow"
                >
                  {editingCustomer ? (isFr ? 'Mettre à jour' : 'Update Customer') : (isFr ? 'Enregistrer Client' : 'Save Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
