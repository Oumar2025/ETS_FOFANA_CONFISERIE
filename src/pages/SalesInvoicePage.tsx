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
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Paid');
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
      status: paymentStatus,
      notes: notes
    });

    setSuccessMessage(isFr ? `Facture ${newInvoice.invoice_number} générée avec succès ! Statut: ${paymentStatus === 'Paid' ? 'Payé' : 'En Attente'}.` : `Invoice ${newInvoice.invoice_number} generated successfully! Status: ${paymentStatus}.`);
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
    setCustCompany(c.company_name || c.name);
    setCustCountry(c.country as DestinationCountry);
    setCustEmail(c.email || '');
    setCustPhone(c.phone || '');
    setCustCredit(c.credit_limit || 25000);
    setCustStatus(c.status);
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
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
      setSuccessMessage(isFr ? `Profil client "${custCompany}" mis à jour.` : `Customer profile "${custCompany}" updated.`);
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
            <span>{isFr ? 'Gestion des Ventes & Facturation' : t.salesInvoiceTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isFr ? 'Émettez des factures de vente avec déduction automatique des stocks et suivi CRM' : t.salesInvoiceSubtitle}
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
            <span>{isFr ? 'Créer une Facture' : t.createInvoiceTab}</span>
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
            <span>{isFr ? 'Annuaire Clients CRM' : t.customerCrmTab} ({customers.length})</span>
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
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl relative z-30">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <Building className="h-4 w-4 text-amber-400" />
                <span>{isFr ? '1. En-tête de Facture & Client' : '1. Invoice & Customer Header'}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Select Customer */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Nom du Client / Entreprise' : t.customerName}</label>
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
                  label={isFr ? 'Date d\'Émission' : t.invoiceDate}
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
                  <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Mode de Paiement' : t.paymentMethod}</label>
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

                {/* Payment Status Dropdown (User Request) */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-amber-400 uppercase block">{isFr ? 'Statut du Paiement (Payé / Non Payé)' : 'Payment Status (Paid / Unpaid)'}</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Pending')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-300 font-extrabold focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Paid">{isFr ? '✅ Payé / Réglé' : '✅ Paid'}</option>
                    <option value="Pending">{isFr ? '⏳ En Attente / Non Payé' : '⏳ Pending / Unpaid'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Line Item Picker Form */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl relative z-10">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4 text-amber-400" />
                <span>{isFr ? '2. Ajouter des Produits à la Facture' : '2. Add Products to Invoice'}</span>
              </h2>

              <form onSubmit={handleAddItem} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Sélectionner le Produit' : t.selectProduct}</label>
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
                        {p.product_name} — {p.quantity} {p.unit} {isFr ? 'restants en stock' : 'remaining in stock'} ({p.warehouse || 'Entrepôt A'}) — {formatPrice(p.selling_price || 0, currentCurrency)}/{p.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Quantité à Vendre' : t.qtyToSell}</label>
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
                    <label className="font-bold text-slate-300 uppercase block">{isFr ? 'Prix Unitaire (USD)' : 'Unit Price (USD)'}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customUnitPrice}
                      onChange={(e) => setCustomUnitPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 font-bold hover:bg-amber-500/10 transition flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isFr ? '+ AJOUTER LE PRODUIT À LA FACTURE' : '+ ADD ITEM TO INVOICE'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Invoice Preview & Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl relative z-10">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <img src="/ets_fofana_logo.jpg" alt="Logo" className="h-8 w-8 rounded-lg object-cover border border-amber-500/40" />
                  <span className="font-black text-white text-xs tracking-tight">ETS FOFANA CONFISERIE</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                  {paymentStatus === 'Paid' ? (isFr ? 'PAYÉ' : 'PAID') : (isFr ? 'EN ATTENTE' : 'PENDING')}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-400 font-bold uppercase text-[10px]">{isFr ? 'FACTURÉ À :' : 'BILLED TO:'}</p>
                <p className="font-extrabold text-white text-sm">{selectedCustomer.company_name || selectedCustomer.name}</p>
                <p className="text-slate-400 flex items-center space-x-1">
                  <CountryFlag countryName={destinationCountry} size="sm" />
                  <span>{isFr ? 'Marché:' : 'Market:'} {destinationCountry}</span>
                </p>
                <p className="text-slate-400">{isFr ? 'Paiement:' : 'Payment:'} <span className="text-amber-400 font-bold">{paymentMethod}</span></p>
              </div>

              {/* Items Table */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <p className="font-bold text-slate-300 text-xs uppercase">{isFr ? 'ARTICLES SÉLECTIONNÉS' : 'LINE ITEMS'} ({draftItems.length})</p>
                {draftItems.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    {isFr ? 'Aucun article ajouté. Veuillez sélectionner un produit.' : 'No line items added yet. Select products on the left.'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {draftItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-100">{item.product_name}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.quantity} {item.unit} &times; ${item.unit_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-extrabold text-amber-400">{formatPrice(item.total_price, currentCurrency)}</span>
                          <button onClick={() => handleRemoveItem(idx)} className="text-slate-500 hover:text-red-400 transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">{isFr ? 'MONTANT TOTAL :' : 'TOTAL AMOUNT:'}</span>
                  <span className="text-xl font-black text-amber-400 font-mono tracking-tight">{formatPrice(totalAmount, currentCurrency)}</span>
                </div>
              </div>

              <button
                onClick={handleGenerateInvoice}
                disabled={draftItems.length === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-gold-glow transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isFr ? 'GÉNÉRER LA FACTURE & DÉDUIRE LE STOCK' : 'GENERATE INVOICE & DEDUCT STOCK'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES LEDGER / HISTORY */}
      {activeTab === 'history' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 print-hide">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>{isFr ? 'Historique des Factures Émises' : 'Issued Sales Invoices Ledger'} ({invoices.length})</span>
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={isFr ? 'Rechercher une facture...' : 'Search invoices...'}
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">{isFr ? 'N° Facture' : 'Invoice #'}</th>
                  <th className="py-3 px-4">{isFr ? 'Client' : 'Customer'}</th>
                  <th className="py-3 px-4">{isFr ? 'Destination' : 'Destination'}</th>
                  <th className="py-3 px-4">{isFr ? 'Date' : 'Date'}</th>
                  <th className="py-3 px-4">{isFr ? 'Montant Total' : 'Total Amount'}</th>
                  <th className="py-3 px-4">{isFr ? 'Statut' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{isFr ? 'Actions' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.invoice_id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{inv.invoice_number}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">{inv.customer_name}</td>
                    <td className="py-3 px-4 text-slate-300 flex items-center space-x-1">
                      <CountryFlag countryName={inv.destination_country} size="sm" />
                      <span>{inv.destination_country}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{inv.invoice_date}</td>
                    <td className="py-3 px-4 font-mono font-extrabold text-emerald-400">{formatPrice(inv.total_amount, currentCurrency)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                        {inv.status === 'Paid' ? (isFr ? 'Payé' : 'Paid') : (isFr ? 'En Attente' : 'Pending')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-amber-400 text-[11px] font-bold transition"
                      >
                        <Eye className="h-3.5 w-3.5 inline mr-1" />
                        <span>{isFr ? 'Voir / Imprimer' : 'View / Print'}</span>
                      </button>
                      <button
                        onClick={() => handleSendEmail(inv)}
                        className="px-2.5 py-1 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-300 hover:text-white text-[11px] font-bold transition"
                      >
                        <Mail className="h-3.5 w-3.5 inline mr-1" />
                        <span>Email</span>
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(inv.invoice_id, inv.invoice_number)}
                        className="px-2 py-1 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 hover:text-red-200 text-[11px] font-bold transition"
                      >
                        <Trash2 className="h-3.5 w-3.5 inline" />
                      </button>
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
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 print-hide">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{isFr ? 'Annuaire Client CRM' : 'Customer CRM Directory'} ({customers.length})</span>
            </h2>

            <div className="flex items-center space-x-3">
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isFr ? 'Rechercher un client...' : 'Search customers...'}
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                />
              </div>

              <button
                onClick={handleOpenAddCustomer}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition flex items-center space-x-1 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>{isFr ? 'Nouveau Client' : 'New Customer'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(c => (
              <div key={c.customer_id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{c.company_name || c.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                      <CountryFlag countryName={c.country} size="sm" />
                      <span>{c.country}</span>
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'VIP' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-300'}`}>
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800 pt-2">
                  <p><span className="text-slate-500">{isFr ? 'Contact :' : 'Contact:'}</span> {c.name}</p>
                  <p><span className="text-slate-500">Email:</span> {c.email || 'N/A'}</p>
                  <p><span className="text-slate-500">{isFr ? 'Tél :' : 'Phone:'}</span> {c.phone || 'N/A'}</p>
                  <p><span className="text-slate-500">{isFr ? 'Achats Cumulés :' : 'Total Spent:'}</span> <span className="font-mono font-bold text-emerald-400">{formatPrice(c.total_spent, currentCurrency)}</span></p>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button onClick={() => handleOpenEditCustomer(c)} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 transition">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDeleteCustomer(c.customer_id, c.company_name || c.name)} className="p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:text-red-200 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRINTABLE / PREVIEW INVOICE MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-3xl w-full space-y-4 shadow-2xl my-8">
            {/* Modal Top Actions */}
            <div className="flex justify-between items-center print-hide border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{isFr ? 'Aperçu de la Facture & Impression' : 'Invoice Preview & Document Print'}</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadPdf(previewInvoice)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition flex items-center space-x-1"
                >
                  <Printer className="h-4 w-4" />
                  <span>{isFr ? 'Imprimer / PDF' : 'Print / Download PDF'}</span>
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div id="printable-invoice-document" className="bg-white text-slate-900 p-8 rounded-xl space-y-6 shadow-2xl">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-amber-500 pb-4">
                <div className="flex items-center space-x-3">
                  <img src="/ets_fofana_logo.jpg" alt="Logo" className="h-14 w-14 rounded-xl object-cover border border-amber-500/40" />
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">ETS FOFANA CONFISERIE</h1>
                    <p className="text-xs font-bold text-slate-600">{isFr ? 'Importation & Distribution de Confiseries Mali' : 'Import & Distribution Confectionery Mali'}</p>
                    <p className="text-[10px] text-slate-500">{isFr ? 'Dépôt Central Bamako' : 'Bamako Central Depot'} &bull; Tel: +223 70 00 00 00 &bull; Email: info@fofana-confiserie.com</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider inline-block">
                    {isFr ? 'FACTURE' : 'INVOICE'}
                  </span>
                  <p className="font-mono font-extrabold text-sm text-slate-900 mt-1">{previewInvoice.invoice_number}</p>
                  <p className="text-xs text-slate-500">{isFr ? 'Date :' : 'Date:'} {previewInvoice.invoice_date}</p>
                </div>
              </div>

              {/* Billed To & Payment Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">{isFr ? 'FACTURÉ AU CLIENT :' : 'BILLED TO CUSTOMER:'}</p>
                  <p className="font-extrabold text-slate-900 text-sm">{previewInvoice.customer_name}</p>
                  <p className="text-slate-600">{previewInvoice.customer_email || 'client@fofana.com'}</p>
                  <p className="text-slate-600">{previewInvoice.customer_phone || '+223 76 12 34 56'}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">{isFr ? 'DESTINATION & PAIEMENT :' : 'DESTINATION & PAYMENT:'}</p>
                  <p className="font-extrabold text-slate-900">{isFr ? 'Marché de Destination :' : 'Destination Market:'} {previewInvoice.destination_country}</p>
                  <p className="text-slate-600">{isFr ? 'Mode de Paiement :' : 'Payment Terms:'} <span className="font-bold text-amber-700">{previewInvoice.payment_method}</span></p>
                  <p className="text-slate-600">{isFr ? 'Statut du Paiement :' : 'Status:'} <span className={`font-extrabold ${previewInvoice.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>{previewInvoice.status === 'Paid' ? (isFr ? 'Payé / Réglé' : 'Paid') : (isFr ? 'En Attente / Non Payé' : 'Pending')}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs">
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
                <span className="text-slate-700">{isFr ? 'SOLDE TOTAL DÛ :' : 'TOTAL AMOUNT DUE:'}</span>
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
                >
                  {isFr ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md transition"
                >
                  {isFr ? 'Enregistrer Client' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
