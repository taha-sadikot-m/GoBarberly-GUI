import { useState, useEffect } from 'react';
import { inventoryService } from '../services/barbershopApi';
import type { InventoryItem } from '../types';

interface UseInventoryResult {
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  lowStockItems: InventoryItem[];
  // CRUD operations
  createItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'is_low_stock' | 'stock_status'>) => Promise<void>;
  updateItem: (id: number, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  // Data fetching
  fetchInventory: (params?: { category?: string; stock_status?: 'low_stock' | 'out_of_stock' }) => Promise<void>;
  fetchLowStockAlerts: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useInventory = (): UseInventoryResult => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch inventory items
  const fetchInventory = async (params?: { category?: string; stock_status?: 'low_stock' | 'out_of_stock' }) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📦 Fetching inventory with params:', params);
      const response = await inventoryService.getAll(params);
      
      console.log('✅ Inventory API Response:', response);
      
      // Handle paginated response
      if (response.results) {
        setInventory(response.results);
        setTotalCount(response.count || response.results.length);
      } else if (Array.isArray(response)) {
        // Handle non-paginated response
        setInventory(response);
        setTotalCount(response.length);
      } else {
        console.warn('⚠️ Unexpected inventory response format:', response);
        setInventory([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error('❌ Error fetching inventory:', err);
      setError(err.message || 'Failed to fetch inventory');
      setInventory([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch low stock alerts
  const fetchLowStockAlerts = async () => {
    try {
      console.log('🚨 Fetching low stock alerts...');
      const alerts = await inventoryService.getLowStockAlerts();
      console.log('✅ Low stock alerts:', alerts);
      setLowStockItems(alerts);
    } catch (err: any) {
      console.error('❌ Error fetching low stock alerts:', err);
    }
  };

  // Create new inventory item
  const createItem = async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'is_low_stock' | 'stock_status'>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('➕ Creating inventory item:', itemData);
      const newItem = await inventoryService.create(itemData);
      console.log('✅ Created inventory item:', newItem);
      
      // Add to local state
      setInventory(prev => [...prev, newItem]);
      setTotalCount(prev => prev + 1);
      
      // Refresh low stock alerts in case this affects them
      await fetchLowStockAlerts();
    } catch (err: any) {
      console.error('❌ Error creating inventory item:', err);
      setError(err.message || 'Failed to create inventory item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update inventory item
  const updateItem = async (id: number, updates: Partial<InventoryItem>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('✏️ Updating inventory item:', { id, updates });
      const updatedItem = await inventoryService.update(id, updates);
      console.log('✅ Updated inventory item:', updatedItem);
      
      // Update local state
      setInventory(prev => 
        prev.map(item => item.id === id ? updatedItem : item)
      );
      
      // Refresh low stock alerts in case this affects them
      await fetchLowStockAlerts();
    } catch (err: any) {
      console.error('❌ Error updating inventory item:', err);
      setError(err.message || 'Failed to update inventory item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete inventory item
  const deleteItem = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Deleting inventory item:', id);
      await inventoryService.delete(id);
      console.log('✅ Deleted inventory item:', id);
      
      // Remove from local state
      setInventory(prev => prev.filter(item => item.id !== id));
      setTotalCount(prev => prev - 1);
      
      // Remove from low stock alerts if present
      setLowStockItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      console.error('❌ Error deleting inventory item:', err);
      setError(err.message || 'Failed to delete inventory item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([
      fetchInventory(),
      fetchLowStockAlerts()
    ]);
  };

  // Load data on hook mount
  useEffect(() => {
    refreshData();
  }, []);

  return {
    inventory,
    lowStockItems,
    loading,
    error,
    totalCount,
    createItem,
    updateItem,
    deleteItem,
    fetchInventory,
    fetchLowStockAlerts,
    refreshData,
  };
};