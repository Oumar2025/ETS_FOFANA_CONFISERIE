import { Product, ProductCategory, SupplierCountry, DestinationCountry, WarehouseLocation, ProductStatus } from '../types';
import { dbService } from './DatabaseService';

export class ProductService {
  public getAllProducts(): Product[] {
    return dbService.getProducts();
  }

  public getProductById(id: number): Product | undefined {
    return this.getAllProducts().find(p => p.product_id === id);
  }

  public searchProducts(
    query?: string,
    category?: string,
    supplierCountry?: string,
    destinationCountry?: string
  ): Product[] {
    let products = this.getAllProducts();

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      products = products.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.warehouse.toLowerCase().includes(q) ||
        p.supplier_country.toLowerCase().includes(q) ||
        p.destination_country.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      products = products.filter(p => p.category === category);
    }

    if (supplierCountry && supplierCountry !== 'All') {
      products = products.filter(p => p.supplier_country === supplierCountry);
    }

    if (destinationCountry && destinationCountry !== 'All') {
      products = products.filter(p => p.destination_country === destinationCountry);
    }

    return products;
  }

  public addProduct(product: Omit<Product, 'product_id' | 'status'> & { status?: ProductStatus }): Product {
    const products = this.getAllProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.product_id)) + 1 : 1;

    const status = product.status || this.calculateStatus(product.quantity, product.expiry_date);

    const newProduct: Product = {
      ...product,
      product_id: newId,
      status
    };

    products.push(newProduct);
    dbService.saveProducts(products);
    return newProduct;
  }

  public updateProduct(id: number, updates: Partial<Omit<Product, 'product_id'>>): Product | null {
    const products = this.getAllProducts();
    const index = products.findIndex(p => p.product_id === id);

    if (index === -1) return null;

    const current = products[index];
    const updatedQty = updates.quantity !== undefined ? updates.quantity : current.quantity;
    const updatedExp = updates.expiry_date !== undefined ? updates.expiry_date : current.expiry_date;
    const updatedStatus = this.calculateStatus(updatedQty, updatedExp);

    const updatedProduct: Product = {
      ...current,
      ...updates,
      status: updatedStatus
    };

    products[index] = updatedProduct;
    dbService.saveProducts(products);
    return updatedProduct;
  }

  public deleteProduct(id: number): boolean {
    let products = this.getAllProducts();
    const initialLen = products.length;
    products = products.filter(p => p.product_id !== id);

    if (products.length < initialLen) {
      dbService.saveProducts(products);
      return true;
    }
    return false;
  }

  public calculateStatus(quantity: number, expiryDate: string): ProductStatus {
    const now = new Date();
    const exp = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) {
      return 'Expired';
    }
    if (daysUntilExpiry <= 30) {
      return 'Approaching Expiry';
    }
    if (quantity === 0 || quantity < 50) {
      return 'Critical Stock';
    }
    if (quantity < 200) {
      return 'Low Stock';
    }
    return 'In Stock';
  }

  public getExpiringProducts(daysThreshold: number = 30): Product[] {
    const products = this.getAllProducts();
    const now = new Date();

    return products.filter(p => {
      const exp = new Date(p.expiry_date);
      const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return days <= daysThreshold;
    });
  }

  public getDashboardKPIs() {
    const products = this.getAllProducts();
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.quantity < 200).length;
    const expiringCount = this.getExpiringProducts(30).length;
    const expiringSoonCount = expiringCount;

    const uniqueDestinations = new Set(products.map(p => p.destination_country)).size;
    const uniqueSuppliers = new Set(products.map(p => p.supplier_country)).size;
    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);

    const totalValueCost = products.reduce((acc, p) => acc + (p.quantity * p.cost_price), 0);
    const totalValueSelling = products.reduce((acc, p) => acc + (p.quantity * p.selling_price), 0);
    const totalInventoryValue = totalValueSelling;
    const expectedRevenue = totalValueSelling;
    const expectedProfit = totalValueSelling - totalValueCost;

    let stockHealthStatus: 'Healthy' | 'Needs Attention' | 'Critical' = 'Healthy';
    if (expiringCount > 2 || lowStockCount > 3) {
      stockHealthStatus = 'Needs Attention';
    }
    if (expiringCount > 4 || lowStockCount > 5) {
      stockHealthStatus = 'Critical';
    }

    return {
      totalProducts,
      lowStockCount,
      expiringCount,
      expiringSoonCount,
      uniqueDestinations,
      uniqueSuppliers,
      totalUnits,
      totalInventoryValue,
      totalValueCost,
      totalValueSelling,
      expectedRevenue,
      expectedProfit,
      stockHealthStatus
    };
  }

  public getCategoryDistribution() {
    const products = this.getAllProducts();
    const categoryCounts: Record<string, number> = {};

    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + p.quantity;
    });

    return Object.keys(categoryCounts).map(name => ({
      name,
      value: categoryCounts[name]
    }));
  }

  public getSupplierDistribution() {
    const products = this.getAllProducts();
    const supplierCounts: Record<string, number> = {};

    products.forEach(p => {
      supplierCounts[p.supplier_country] = (supplierCounts[p.supplier_country] || 0) + p.quantity;
    });

    return Object.keys(supplierCounts).map(name => ({
      name,
      value: supplierCounts[name]
    }));
  }
}

export const productService = new ProductService();
