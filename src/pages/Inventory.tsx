import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import styles from './Inventory.module.css';
import type { InventoryItem } from '../types';

const Categories = ['Hair Products', 'Shaving', 'Tools', 'Cleaning', 'Other'];

const Inventory: React.FC = () => {
  const {
    inventory,
    lowStockItems,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    fetchInventory
  } = useInventory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('');
  const [formData, setFormData] = useState<{
    name: string;
    category: 'Hair Products' | 'Shaving' | 'Tools' | 'Cleaning' | 'Other';
    quantity: string;
    min_stock: string;
    unit_cost: string;
    supplier: string;
  }>({
    name: '',
    category: 'Hair Products',
    quantity: '',
    min_stock: '',
    unit_cost: '',
    supplier: ''
  });

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity.toString(),
        min_stock: item.min_stock.toString(),
        unit_cost: item.unit_cost?.toString() || '',
        supplier: item.supplier || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'Hair Products',
        quantity: '',
        min_stock: '',
        unit_cost: '',
        supplier: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Hair Products',
      quantity: '',
      min_stock: '',
      unit_cost: '',
      supplier: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity),
        min_stock: Number(formData.min_stock),
        unit_cost: formData.unit_cost ? Number(formData.unit_cost) : undefined,
        supplier: formData.supplier || undefined
      };

      if (editingItem) {
        await updateItem(editingItem.id, itemData);
      } else {
        await createItem(itemData);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Failed to save inventory item:', error);
      // You could add a toast notification here
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteItem(id);
      } catch (error) {
        console.error('Failed to delete inventory item:', error);
        // You could add a toast notification here
      }
    }
  };



  const inventoryColumns = [
    { key: 'name' as keyof InventoryItem, header: 'Name' },
    { key: 'category' as keyof InventoryItem, header: 'Category' },
    { 
      key: 'quantity' as keyof InventoryItem, 
      header: 'Stock',
      render: (_: any, item: InventoryItem) => `${item.quantity} (min: ${item.min_stock})`
    },
    { key: 'supplier' as keyof InventoryItem, header: 'Supplier', render: (value: any) => value || '-' },
    {
      key: 'unit_cost' as keyof InventoryItem,
      header: 'Cost',
      render: (value: any) => {
        if (value && !isNaN(Number(value))) {
          return `₹${Number(value).toFixed(2)}`;
        }
        return '₹0.00';
      }
    },
    {
      key: 'unit_cost' as keyof InventoryItem,
      header: 'Selling Price', 
      render: (value: any) => {
        // For now, assuming selling price is cost + 20% markup
        if (value && !isNaN(Number(value))) {
          const sellingPrice = Number(value) * 1.2;
          return `₹${sellingPrice.toFixed(2)}`;
        }
        return '₹0.00';
      }
    },
    {
      key: 'id' as keyof InventoryItem,
      header: 'Actions',
      render: (_: any, item: InventoryItem) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(item)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(item.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.inventory}>
      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>
              🚨 Low Stock Alerts ({lowStockItems.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="danger">
                  {item.name} ({item.quantity} left)
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}
      
      <Card>
        <div className={styles.tableHeader}>
          <h2>Inventory Management</h2>
          <div className={styles.headerActions}>
            <div className={styles.filters}>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  fetchInventory({ 
                    category: e.target.value || undefined, 
                    stock_status: selectedStockStatus as 'low_stock' | 'out_of_stock' | undefined
                  });
                }}
                options={[
                  { value: '', label: 'All Categories' },
                  ...Categories.map(cat => ({ value: cat, label: cat }))
                ]}
              />
              <Select
                value={selectedStockStatus}
                onChange={(e) => {
                  setSelectedStockStatus(e.target.value);
                  fetchInventory({ 
                    category: selectedCategory || undefined, 
                    stock_status: e.target.value as 'low_stock' | 'out_of_stock' | undefined
                  });
                }}
                options={[
                  { value: '', label: 'All Stock Levels' },
                  { value: 'low_stock', label: 'Low Stock' },
                  { value: 'out_of_stock', label: 'Out of Stock' }
                ]}
              />
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              + Add Item
            </Button>
          </div>
        </div>
        
        {loading && <p>Loading inventory...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        
        <Table
          columns={inventoryColumns}
          data={inventory}
        />
      </Card>

      {/* Add/Edit Inventory Item Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div>
              <label>Item</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                required
              />
            </div>
            
            <div>
              <label>Category</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  category: e.target.value as typeof formData.category
                }))}
                options={Categories.map(cat => ({
                  value: cat,
                  label: cat
                }))}
                required
              />
            </div>
            
            <div>
              <label>Quantity</label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  quantity: e.target.value
                }))}
                required
              />
            </div>
            
            <div>
              <label>Minimum Stock</label>
              <Input
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  min_stock: e.target.value
                }))}
                required
              />
            </div>
            
            <div>
              <label>Unit Cost (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  unit_cost: e.target.value
                }))}
                placeholder="Optional"
              />
            </div>
            
            <div>
              <label>Supplier</label>
              <Input
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  supplier: e.target.value
                }))}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;