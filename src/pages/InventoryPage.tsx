import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Percent,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  DollarSign,
  X,
  ShieldAlert
} from 'lucide-react';
import { Product, ProductCategory, SupplierCountry, DestinationCountry, WarehouseLocation, ProductUnit, UserSession, LanguageCode, CurrencyCode } from '../types';
import { productService } from '../services/ProductService';
import { aiService } from '../services/AIService';
import { CalendarPicker } from '../components/CalendarPicker';
import { translations, formatPrice } from '../i18n/translations';
import { CountryFlag } from '../components/CountryFlag';

interface InventoryPageProps {
  userSession: UserSession;
  currentLanguage: LanguageCode;
  currentCurrency: CurrencyCode;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ userSession, currentLanguage, currentCurrency }) => {
  const t = translations[currentLanguage];
  const [products, setProducts] = useState<Product[]>(productService.getAllProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [selectedDestination, setSelectedDestination] = useState<string>('All');

  // Selected product for AI Details Drawer
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'analysis' | 'explain' | 'promotion' | 'import' | 'simulator'>('analysis');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Decision Simulator state
  const [simulatedQty, setSimulatedQty] = useState<number>(500);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  const isAdmin = userSession.role === 'Super Administrator' || userSession.role === 'General Manager' || userSession.role === 'Inventory Manager' || (userSession.role as string) === 'Administrator';

  // Form State
  const [formData, setFormData] = useState({
    product_name: '',
    category: 'Biscuits' as ProductCategory,
    brand: '',
    supplier_country: 'Turkey' as SupplierCountry,
    destination_country: 'Mali' as DestinationCountry,
    quantity: 300,
    unit: 'Cartons' as ProductUnit,
    cost_price: 20.0,
    selling_price: 30.0,
    manufacture_date: '2026-03-01',
    expiry_date: '2027-03-01',
    warehouse: 'Warehouse A (Bamako Central)' as WarehouseLocation
  });

  const refreshProducts = () => {
    const list = productService.searchProducts(searchQuery, selectedCategory, selectedSupplier, selectedDestination);
    setProducts(list);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setProducts(productService.searchProducts(query, selectedCategory, selectedSupplier, selectedDestination));
  };

  const handleFilterCategory = (cat: string) => {
    setSelectedCategory(cat);
    setProducts(productService.searchProducts(searchQuery, cat, selectedSupplier, selectedDestination));
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      category: 'Biscuits',
      brand: '',
      supplier_country: 'Turkey',
      destination_country: 'Mali',
      quantity: 300,
      unit: 'Cartons',
      cost_price: 20.0,
      selling_price: 30.0,
      manufacture_date: '2026-03-01',
      expiry_date: '2027-03-01',
      warehouse: 'Warehouse A (Bamako Central)'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      category: product.category,
      brand: product.brand,
      supplier_country: product.supplier_country,
      destination_country: product.destination_country,
      quantity: product.quantity,
      unit: product.unit,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      manufacture_date: product.manufacture_date,
      expiry_date: product.expiry_date,
      warehouse: product.warehouse
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setAdminNotice(null);

    if (!isAdmin) {
      setAdminNotice('Access Denied: Only Administrators are permitted to delete product records.');
      setTimeout(() => setAdminNotice(null), 4000);
      return;
    }

    if (window.confirm('Are you sure you want to permanently delete this inventory record?')) {
      productService.deleteProduct(id);
      if (selectedProduct?.product_id === id) setSelectedProduct(null);
      refreshProducts();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      productService.updateProduct(editingProduct.product_id, formData);
    } else {
      productService.addProduct(formData);
    }
    setIsModalOpen(false);
    refreshProducts();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t.inventory}</h1>
          <p className="text-xs text-slate-400 mt-1">Product records, AI health analysis, decision simulator & promo advisor</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-gold-glow transition active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{t.addNewProduct}</span>
        </button>
      </div>

      {adminNotice && (
        <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{adminNotice}</span>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => handleFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="All">{t.allCategories}</option>
            <option value="Biscuits">Biscuits</option>
            <option value="Chocolates">Chocolates</option>
            <option value="Candy">Candy</option>
            <option value="Dates">Dates</option>
            <option value="Packaged Confectionery">Packaged Confectionery</option>
          </select>

          <select
            value={selectedSupplier}
            onChange={(e) => {
              setSelectedSupplier(e.target.value);
              setProducts(productService.searchProducts(searchQuery, selectedCategory, e.target.value, selectedDestination));
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-bold"
          >
            <option value="All">{t.allSuppliers}</option>
            <option value="Turkey">Turkey</option>
            <option value="Morocco">Morocco</option>
            <option value="Tunisia">Tunisia</option>
            <option value="Brazil">Brazil</option>
            <option value="China">China</option>
            <option value="Thailand">Thailand</option>
            <option value="Belgium">Belgium (Belgika)</option>
          </select>

          <select
            value={selectedDestination}
            onChange={(e) => {
              setSelectedDestination(e.target.value);
              setProducts(productService.searchProducts(searchQuery, selectedCategory, selectedSupplier, e.target.value));
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-bold"
          >
            <option value="All">{t.allDestinations}</option>
            <option value="Mali">Mali</option>
            <option value="Burkina Faso">Burkina Faso</option>
            <option value="Côte d'Ivoire">Côte d'Ivoire</option>
            <option value="Angola">Angola</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedProduct ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3.5 px-4">{t.productName}</th>
                    <th className="py-3.5 px-4">{t.category}</th>
                    <th className="py-3.5 px-4">{t.originMarket}</th>
                    <th className="py-3.5 px-4">{t.qtyUnit}</th>
                    <th className="py-3.5 px-4">{t.price}</th>
                    <th className="py-3.5 px-4">{t.expiryDate}</th>
                    <th className="py-3.5 px-4">{t.status}</th>
                    <th className="py-3.5 px-4 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {products.map((p) => {
                    const isSelected = selectedProduct?.product_id === p.product_id;

                    return (
                      <tr
                        key={p.product_id}
                        onClick={() => setSelectedProduct(p)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-500/10 text-amber-200' : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-100 max-w-[200px] truncate">
                          {p.product_name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-semibold">
                          <div className="inline-flex items-center space-x-1.5">
                            <CountryFlag country={p.supplier_country} size="sm" />
                            <span>{p.supplier_country}</span>
                            <span className="text-slate-500 mx-1">&rarr;</span>
                            <CountryFlag country={p.destination_country} size="sm" />
                            <span>{p.destination_country}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          <div className="font-extrabold text-amber-400 font-mono text-xs">{p.quantity} <span className="text-[10px] font-normal text-slate-300 uppercase">{p.unit} remaining</span></div>
                          <div className="text-[10px] text-slate-500">{p.warehouse || 'Warehouse A'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                          {formatPrice(p.selling_price, currentCurrency)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono">
                          {p.expiry_date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'Approaching Expiry' || p.status === 'Expired'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : p.status === 'Critical Stock' || p.status === 'Low Stock'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={(e) => handleOpenEditModal(p, e)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 transition"
                            title={t.editProduct}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={(e) => handleDeleteProduct(p.product_id, e)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                              title="Delete Product (Admin Only)"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Product AI Drawer */}
        {selectedProduct && (
          <div className="lg:col-span-1 glass-card rounded-2xl p-5 border border-slate-800 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{t.aiAnalysisPanel}</span>
                <h3 className="font-bold text-white text-sm truncate max-w-[220px]">{selectedProduct.product_name}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* AI Drawer Tabs */}
            <div className="flex border-b border-slate-800 gap-1 overflow-x-auto text-[11px] font-semibold">
              <button
                onClick={() => setActiveDrawerTab('analysis')}
                className={`px-3 py-1.5 border-b-2 transition ${
                  activeDrawerTab === 'analysis' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400'
                }`}
              >
                {t.healthTab}
              </button>
              <button
                onClick={() => setActiveDrawerTab('explain')}
                className={`px-3 py-1.5 border-b-2 transition ${
                  activeDrawerTab === 'explain' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400'
                }`}
              >
                {t.explainerTab}
              </button>
              <button
                onClick={() => setActiveDrawerTab('promotion')}
                className={`px-3 py-1.5 border-b-2 transition ${
                  activeDrawerTab === 'promotion' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400'
                }`}
              >
                {t.promoTab}
              </button>
              <button
                onClick={() => setActiveDrawerTab('import')}
                className={`px-3 py-1.5 border-b-2 transition ${
                  activeDrawerTab === 'import' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400'
                }`}
              >
                {t.importTab}
              </button>
              <button
                onClick={() => setActiveDrawerTab('simulator')}
                className={`px-3 py-1.5 border-b-2 transition ${
                  activeDrawerTab === 'simulator' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400'
                }`}
              >
                {t.simulateTab}
              </button>
            </div>

            {/* Tab 1: AI Health Analysis */}
            {activeDrawerTab === 'analysis' && (() => {
              const analysis = aiService.analyzeProduct(selectedProduct);
              return (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Health Status</span>
                      <p className="font-bold text-amber-400 text-sm">{analysis.healthStatus}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Days Remaining</span>
                      <p className={`font-bold text-sm ${analysis.daysRemaining <= 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {analysis.daysRemaining} Days
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Profit Margin</span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-amber-300 text-sm font-mono">
                        {formatPrice(analysis.profitMargin, currentCurrency)} / {selectedProduct.unit}
                      </span>
                      <span className="text-emerald-400 font-bold">{analysis.profitMarginPercent}%</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Executive Recommendation</span>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed">{analysis.recommendation}</p>
                  </div>
                </div>
              );
            })()}

            {/* Tab 2: Explain Recommendation */}
            {activeDrawerTab === 'explain' && (() => {
              const analysis = aiService.analyzeProduct(selectedProduct);
              return (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-300 font-bold border-b border-slate-800 pb-1">Comprehensive Rationale:</p>
                  <div className="space-y-2 text-slate-400">
                    <p><strong className="text-slate-200">Condition:</strong> {analysis.explanation.inventoryCondition}</p>
                    <p><strong className="text-slate-200">Expiry:</strong> {analysis.explanation.expirySituation}</p>
                    <p><strong className="text-slate-200">Profitability:</strong> {analysis.explanation.profitability}</p>
                    <p><strong className="text-slate-200">Risks:</strong> {analysis.explanation.businessRisks}</p>
                  </div>
                </div>
              );
            })()}

            {/* Tab 3: Promotion Advisor */}
            {activeDrawerTab === 'promotion' && (() => {
              const promo = aiService.getPromotionAdvice(selectedProduct);
              return (
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Suggested Discount</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        {promo.priority} Priority
                      </span>
                    </div>
                    <p className="text-2xl font-black text-amber-400">{promo.suggestedDiscount}% OFF</p>
                  </div>

                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {promo.recommendation}
                  </p>
                </div>
              );
            })()}

            {/* Tab 4: Import Recommendation */}
            {activeDrawerTab === 'import' && (() => {
              const imp = aiService.getImportAdvice(selectedProduct);
              return (
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Recommended Import Qty</span>
                    <p className="text-2xl font-black text-blue-400">{imp.recommendedImportQty} {selectedProduct.unit}</p>
                  </div>

                  <div className="space-y-2 text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <p className="flex items-center space-x-1.5">
                      <strong className="text-slate-200">Preferred Supplier:</strong>
                      <CountryFlag country={imp.preferredSupplierCountry} size="sm" />
                      <span>{imp.preferredSupplierCountry}</span>
                    </p>
                    <p><strong className="text-slate-200">Timing:</strong> {imp.recommendedPurchaseTiming}</p>
                    <p className="mt-1 text-slate-400">{imp.procurementStrategy}</p>
                  </div>
                </div>
              );
            })()}

            {/* Tab 5: AI Decision Simulator */}
            {activeDrawerTab === 'simulator' && (() => {
              const sim = aiService.simulateDecision(selectedProduct, simulatedQty);
              return (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Simulate Import Quantity ({selectedProduct.unit}):</label>
                    <input
                      type="number"
                      value={simulatedQty}
                      onChange={(e) => setSimulatedQty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-bold text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block">New Level</span>
                      <strong className="text-slate-200 text-xs">{sim.newInventoryLevel} {selectedProduct.unit}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block">Stock Coverage</span>
                      <strong className="text-slate-200 text-xs">{sim.projectedStockAvailabilityDays} days</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    <p className="font-bold text-blue-400 mb-1">AI Verdict:</p>
                    <p className="leading-relaxed">{sim.aiVerdict}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-white text-base">
                {editingProduct ? t.editProduct : t.registerNewItem}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase">{t.productName}</label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g. Oreo Original Biscuits"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">{t.category}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  >
                    <option value="Biscuits">Biscuits</option>
                    <option value="Chocolates">Chocolates</option>
                    <option value="Candy">Candy</option>
                    <option value="Dates">Dates</option>
                    <option value="Packaged Confectionery">Packaged Confectionery</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Supplier Country</label>
                  <select
                    value={formData.supplier_country}
                    onChange={(e) => setFormData({ ...formData, supplier_country: e.target.value as SupplierCountry })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="Turkey">Turkey</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Brazil">Brazil</option>
                    <option value="China">China</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Belgium">Belgium (Belgika)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Destination Country</label>
                  <select
                    value={formData.destination_country}
                    onChange={(e) => setFormData({ ...formData, destination_country: e.target.value as DestinationCountry })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="Mali">Mali</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Angola">Angola</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">{t.unit}</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="Cartons">{t.cartons}</option>
                    <option value="Boxes">{t.boxes}</option>
                    <option value="Pallets">{t.pallets}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">{t.costPrice} ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">{t.sellingPrice} ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CalendarPicker
                  label={t.manufactureDate}
                  value={formData.manufacture_date}
                  onChange={(dateStr) => setFormData({ ...formData, manufacture_date: dateStr })}
                />

                <CalendarPicker
                  label={t.expiryDate}
                  value={formData.expiry_date}
                  onChange={(dateStr) => setFormData({ ...formData, expiry_date: dateStr })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase">{t.warehouse}</label>
                <select
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value as WarehouseLocation })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                >
                  <option value="Warehouse A (Bamako Central)">Warehouse A (Bamako Central)</option>
                  <option value="Warehouse B (Kayes Depot)">Warehouse B (Kayes Depot)</option>
                  <option value="Warehouse C (Sikasso Hub)">Warehouse C (Sikasso Hub)</option>
                  <option value="Warehouse D (Bobo Central)">Warehouse D (Bobo Central)</option>
                  <option value="Warehouse E (Ango Depot)">Warehouse E (Ango Depot)</option>
                  <option value="Warehouse F (Abidjan Hub)">Warehouse F (Abidjan Hub)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-gold-glow"
                >
                  {t.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
