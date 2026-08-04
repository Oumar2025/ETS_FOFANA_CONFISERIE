import React, { useState } from 'react';
import {
  Boxes, Plus, Search, Filter, Trash2, Edit, Sparkles, ChevronRight, TrendingUp, Percent,
  Calendar, AlertTriangle, CheckCircle2, Info, DollarSign, X, ShieldAlert, ArrowRight, Lightbulb
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
  const isFr = currentLanguage === 'fr';

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
  const [simulatedQty, setSimulatedQty] = useState<number>(50);
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

  const handleDeleteProduct = (id: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
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
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Boxes className="h-7 w-7 text-amber-400" />
            <span>{t.inventory}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock tracking, remaining units, expiry monitoring & AI Decision Simulator
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-gold-glow transition shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addNewProduct}</span>
          </button>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search product name, brand, ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setProducts(productService.searchProducts(searchQuery, e.target.value, selectedSupplier, selectedDestination));
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-bold"
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
            <option value="Turkey">Turkey 🇹🇷</option>
            <option value="Morocco">Morocco 🇲🇦</option>
            <option value="Tunisia">Tunisia 🇹🇳</option>
            <option value="Brazil">Brazil 🇧🇷</option>
            <option value="China">China 🇨🇳</option>
            <option value="Thailand">Thailand 🇹🇭</option>
            <option value="Belgium">Belgium (Belgika) 🇧🇪</option>
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
            <option value="Mali">🇲🇱 Mali</option>
            <option value="Burkina Faso">🇧🇫 Burkina Faso</option>
            <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
            <option value="Angola">🇦🇴 Angola</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Layout (Table + AI Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedProduct ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] bg-slate-900/80">
                    <th className="py-3.5 px-4">{t.productName}</th>
                    <th className="py-3.5 px-4">{t.category}</th>
                    <th className="py-3.5 px-4">{t.supplierCountries}</th>
                    <th className="py-3.5 px-4 text-emerald-400 font-extrabold">{isFr ? 'STOCK RESTANT & UNITÉ' : 'REMAINING STOCK & UNIT'}</th>
                    <th className="py-3.5 px-4">{t.costPrice} / {t.sellingPrice}</th>
                    <th className="py-3.5 px-4">{t.expiryDate}</th>
                    <th className="py-3.5 px-4">{t.status}</th>
                    <th className="py-3.5 px-4 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {products.map((p) => {
                    const isSelected = selectedProduct?.product_id === p.product_id;
                    return (
                      <tr
                        key={p.product_id}
                        onClick={() => setSelectedProduct(p)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-amber-500/10 border-l-4 border-l-amber-500' : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-extrabold text-slate-100 hover:text-amber-400 transition">{p.product_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{p.brand} &bull; {p.warehouse}</p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                            <CountryFlag country={p.supplier_country} size="sm" />
                            <span>{p.supplier_country}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-baseline space-x-1">
                            <span className="text-sm font-black text-amber-400 font-mono">{p.quantity.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{p.unit}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className="text-slate-400">{formatPrice(p.cost_price, currentCurrency)}</span>
                          <span className="text-slate-600 mx-1">/</span>
                          <span className="text-amber-300 font-bold">{formatPrice(p.selling_price, currentCurrency)}</span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                          {p.expiry_date}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            p.status === 'In Stock' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            p.status === 'Low Stock' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {p.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={(e) => handleOpenEditModal(p, e)}
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800"
                                  title="Edit Product"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteProduct(p.product_id, p.product_name, e)}
                                  className="p-1.5 rounded-lg bg-slate-900 text-slate-500 hover:text-red-400 border border-slate-800"
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Product Analysis Side Drawer (Matching Screenshots 2, 3, 4) */}
        {selectedProduct && (
          <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-4 shadow-2xl lg:col-span-1 h-fit sticky top-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-sm">AI Product Analysis</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Product Summary Header */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <h4 className="font-extrabold text-amber-400 text-xs">{selectedProduct.product_name}</h4>
              <p className="text-[10px] text-slate-400 font-mono">
                {selectedProduct.quantity.toLocaleString()} {selectedProduct.unit} remaining in {selectedProduct.warehouse}
              </p>
            </div>

            {/* Sub-Tabs */}
            <div className="flex border-b border-slate-800 text-[11px] font-bold">
              <button
                onClick={() => setActiveDrawerTab('analysis')}
                className={`px-2.5 py-1.5 border-b-2 transition ${
                  activeDrawerTab === 'analysis' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400'
                }`}
              >
                Health
              </button>
              <button
                onClick={() => setActiveDrawerTab('explain')}
                className={`px-2.5 py-1.5 border-b-2 transition ${
                  activeDrawerTab === 'explain' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400'
                }`}
              >
                Explainer
              </button>
              <button
                onClick={() => setActiveDrawerTab('promotion')}
                className={`px-2.5 py-1.5 border-b-2 transition ${
                  activeDrawerTab === 'promotion' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400'
                }`}
              >
                Promo
              </button>
              <button
                onClick={() => setActiveDrawerTab('import')}
                className={`px-2.5 py-1.5 border-b-2 transition ${
                  activeDrawerTab === 'import' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400'
                }`}
              >
                Import
              </button>
              <button
                onClick={() => setActiveDrawerTab('simulator')}
                className={`px-2.5 py-1.5 border-b-2 transition ${
                  activeDrawerTab === 'simulator' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400'
                }`}
              >
                Simulator
              </button>
            </div>

            {/* Tab 1: AI Health Analysis */}
            {activeDrawerTab === 'analysis' && (() => {
              const analysis = aiService.analyzeProduct(selectedProduct);
              return (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Health Status</span>
                      <p className="font-bold text-amber-400 text-xs">{analysis.healthStatus}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Days Remaining</span>
                      <p className={`font-bold text-xs ${analysis.daysRemaining <= 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {analysis.daysRemaining} Days
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Profit Margin</span>
                    <div className="flex justify-between items-baseline mt-0.5">
                      <span className="font-bold text-amber-300 text-xs font-mono">
                        {formatPrice(analysis.profitMargin, currentCurrency)} / {selectedProduct.unit}
                      </span>
                      <span className="text-emerald-400 font-bold text-xs">{analysis.profitMarginPercent.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                      <Lightbulb className="h-4 w-4" />
                      <span>AI Executive Recommendation</span>
                    </div>
                    <p className="text-emerald-200 text-xs leading-relaxed">{analysis.recommendation}</p>
                  </div>
                </div>
              );
            })()}

            {/* Tab 2: AI Business Explanation (Matching Screenshot #4) */}
            {activeDrawerTab === 'explain' && (() => {
              const analysis = aiService.analyzeProduct(selectedProduct);
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                      <Lightbulb className="h-4 w-4" />
                      <span>💡 AI Recommendation</span>
                    </div>
                    <p className="text-emerald-200 text-xs font-semibold">{analysis.recommendation}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300">
                    <h5 className="font-extrabold text-amber-400 text-xs flex items-center space-x-1">
                      <span>💬 AI Business Explanation</span>
                    </h5>

                    <div className="space-y-1.5 text-[11px]">
                      <p className="font-bold text-slate-200 uppercase text-[10px]">Why?</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        <li>Expiry urgency with {analysis.daysRemaining} days remaining until shelf limit ({selectedProduct.expiry_date}).</li>
                        <li>High inventory volume ({selectedProduct.quantity} {selectedProduct.unit}) stored in {selectedProduct.warehouse}.</li>
                        <li>Profit margin buffer of {analysis.profitMarginPercent.toFixed(1)}% permits promotional discounting.</li>
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <p className="font-bold text-slate-200 uppercase text-[10px]">Business Impact:</p>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        This action minimizes financial waste loss (up to ${ (selectedProduct.quantity * selectedProduct.cost_price).toLocaleString() }) by converting inventory into immediate cash flow.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-400 uppercase">AI Confidence Score:</span>
                      <span className="font-black text-emerald-400 font-mono text-xs">100%</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Tab 3: Promotion Advisor */}
            {activeDrawerTab === 'promotion' && (() => {
              const promo = aiService.getPromotionAdvice(selectedProduct);
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Suggested Discount</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        {promo.priority} Priority
                      </span>
                    </div>
                    <p className="text-2xl font-black text-amber-400">{promo.suggestedDiscount}% OFF</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Expected Sales Volume Boost</span>
                    <p className="text-base font-extrabold text-emerald-400">+{promo.expectedSalesBoostPercent}% Volume</p>
                  </div>

                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px]">
                    {promo.recommendation}
                  </p>
                </div>
              );
            })()}

            {/* Tab 4: Import Recommendation */}
            {activeDrawerTab === 'import' && (() => {
              const imp = aiService.getImportAdvice(selectedProduct);
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Recommended Import Qty</span>
                    <p className="text-2xl font-black text-blue-400">{imp.recommendedImportQty} {selectedProduct.unit}</p>
                  </div>

                  <div className="space-y-1.5 text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
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

            {/* Tab 5: AI Decision Simulator (Matching Screenshot #2) */}
            {activeDrawerTab === 'simulator' && (() => {
              const sim = aiService.simulateDecision(selectedProduct, simulatedQty);
              return (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">How many cartons do you plan to import?</label>
                    <input
                      type="number"
                      value={simulatedQty}
                      onChange={(e) => setSimulatedQty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold text-xs"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300">
                    <h5 className="font-extrabold text-blue-400 text-xs">Decision Simulation</h5>
                    <ul className="space-y-1.5 text-[11px] list-disc pl-4 text-slate-300">
                      <li><strong>Inventory Impact:</strong> Current stock ({selectedProduct.quantity}) after planned import of {simulatedQty} cartons will reach {sim.newInventoryLevel} {selectedProduct.unit}.</li>
                      <li><strong>Profit Impact:</strong> Projected profit margin remains {sim.projectedProfitMargin.toFixed(1)}%. Total capital required: ${(simulatedQty * selectedProduct.cost_price).toLocaleString()}.</li>
                      <li><strong>Expiry Risk:</strong> Risk evaluation level is {sim.expiryRisk}.</li>
                      <li><strong>Business Advice:</strong> {sim.aiVerdict}</li>
                    </ul>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Final Decision</span>
                        <span className={`font-black text-xs ${sim.overstockRisk === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {sim.overstockRisk === 'High' ? 'Not Recommended' : 'Recommended'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">AI Confidence</span>
                        <span className="font-black text-emerald-400 font-mono text-xs">100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Modal Form: Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
              <Boxes className="h-5 w-5 text-amber-400" />
              <span>{editingProduct ? 'Edit Inventory Product' : t.addNewProduct}</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
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
                    <option value="Turkey">Turkey 🇹🇷</option>
                    <option value="Morocco">Morocco 🇲🇦</option>
                    <option value="Tunisia">Tunisia 🇹🇳</option>
                    <option value="Brazil">Brazil 🇧🇷</option>
                    <option value="China">China 🇨🇳</option>
                    <option value="Thailand">Thailand 🇹🇭</option>
                    <option value="Belgium">Belgium (Belgika) 🇧🇪</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Destination Country</label>
                  <select
                    value={formData.destination_country}
                    onChange={(e) => setFormData({ ...formData, destination_country: e.target.value as DestinationCountry })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="Mali">Mali 🇲🇱</option>
                    <option value="Burkina Faso">Burkina Faso 🇧🇫</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire 🇨🇮</option>
                    <option value="Angola">Angola 🇦🇴</option>
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
                  onChange={(d) => setFormData({ ...formData, manufacture_date: d })}
                />
                <CalendarPicker
                  label={t.expiryDate}
                  value={formData.expiry_date}
                  onChange={(d) => setFormData({ ...formData, expiry_date: d })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase">{t.warehouse}</label>
                <select
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value as WarehouseLocation })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                >
                  <option value="Warehouse A (Bamako Central)">Warehouse A (Bamako Central)</option>
                  <option value="Warehouse B (Kayes Depot)">Warehouse B (Kayes Depot)</option>
                  <option value="Warehouse C (Sikasso Hub)">Warehouse C (Sikasso Hub)</option>
                  <option value="Warehouse D (Bobo Central)">Warehouse D (Bobo Central)</option>
                  <option value="Warehouse E (Ango Depot)">Warehouse E (Ango Depot)</option>
                  <option value="Warehouse F (Abidjan Hub)">Warehouse F (Abidjan Hub)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-gold-glow"
                >
                  {editingProduct ? 'Save Changes' : t.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
