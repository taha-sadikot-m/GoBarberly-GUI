import { useState, useEffect, useCallback } from 'react';
import { inventoryService, type InventoryItem } from '../services/barbershopApi';

export const useBarbershopInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchInventory = useCallback(async (params?: {
    category?: string;
    stock_status?: 'low_stock' | 'out_of_stock';
    page?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getAll(params);
      
      // Debug logging to check received data
      console.log('📦 Raw inventory API response:', data);
      console.log('📦 Inventory items received:', data.results);
      if (data.results && data.results.length > 0) {
        console.log('📦 First inventory item structure:', data.results[0]);
        console.log('📦 Supplier field value:', data.results[0].supplier);
        console.log('📦 Unit cost field value:', data.results[0].unit_cost);
        console.log('📦 All fields in first item:', Object.keys(data.results[0]));
      } else {
        console.log('📦 No inventory items found in response');
      }
      
      setInventory(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  const createInventoryItem = useCallback(async (itemData: Omit<InventoryItem, 'id'>) => {
    try {
      const newItem = await inventoryService.create(itemData);
      setInventory(prev => [newItem, ...prev]);
      setTotalCount(prev => prev + 1);
      return newItem;
    } catch (err) {
      console.error('Error creating inventory item:', err);
      throw err;
    }
  }, []);

  const updateInventoryItem = useCallback(async (id: number, updates: Partial<InventoryItem>) => {
    try {
      const updatedItem = await inventoryService.update(id, updates);
      setInventory(prev => 
        prev.map(item => item.id === id ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      console.error('Error updating inventory item:', err);
      throw err;
    }
  }, []);

  const deleteInventoryItem = useCallback(async (id: number) => {
    try {
      await inventoryService.delete(id);
      setInventory(prev => prev.filter(item => item.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      throw err;
    }
  }, []);

  const getLowStockAlerts = useCallback(async () => {
    try {
      return await inventoryService.getLowStockAlerts();
    } catch (err) {
      console.error('Error fetching low stock alerts:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Computed values
  const getLowStockItems = useCallback(() => {
    return inventory.filter(item => item.quantity <= item.min_stock);
  }, [inventory]);

  const getOutOfStockItems = useCallback(() => {
    return inventory.filter(item => item.quantity === 0);
  }, [inventory]);

  const getInventoryByCategory = useCallback((category: string) => {
    return inventory.filter(item => item.category === category);
  }, [inventory]);

  const getTotalValue = useCallback(() => {
    return inventory.reduce((total, item) => total + (item.quantity * (item.unit_cost || 0)), 0);
  }, [inventory]);

  const getCategories = useCallback(() => {
    const categories = [...new Set(inventory.map(item => item.category))];
    return categories.sort();
  }, [inventory]);

  return {
    inventory,
    loading,
    error,
    totalCount,
    fetchInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getLowStockAlerts,
    // Computed values
    getLowStockItems,
    getOutOfStockItems,
    getInventoryByCategory,
    getTotalValue,
    getCategories,
  };
};