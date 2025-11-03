import React, { useState } from 'react';
import { useBarbershopInventory } from '../hooks/useBarbershopInventory';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import styles from './Inventory.module.css';
import type { InventoryItem } from '../services/barbershopApi';

const Categories = ['Hair Products', 'Shaving', 'Tools', 'Cleaning', 'Other'];

const BarbershopInventory: React.FC = () => {
  const {
    inventory,
    loading,
    error,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getLowStockItems
  } = useBarbershopInventory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState<{
    name: string;
    category: 'Hair Products' | 'Shaving' | 'Tools' | 'Cleaning' | 'Other';
    quantity: string;
    unit_cost: string;
    selling_price: string;
    min_stock: string;
    supplier: string;
  }>({
    name: '',
    category: 'Hair Products',
    quantity: '',
    unit_cost: '',
    selling_price: '',
    min_stock: '',
    supplier: ''
  });

  const lowStockItems = getLowStockItems();
  const filteredItems = inventory.filter((item: InventoryItem) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity.toString(),
        unit_cost: item.unit_cost?.toString() || '',
        selling_price: item.selling_price?.toString() || '',
        min_stock: item.min_stock.toString(),
        supplier: item.supplier || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'Hair Products',
        quantity: '',
        unit_cost: '',
        selling_price: '',
        min_stock: '',
        supplier: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      name: formData.name,
      category: formData.category as 'Hair Products' | 'Shaving' | 'Tools' | 'Cleaning' | 'Other',
      quantity: parseInt(formData.quantity),
      unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : 0,
      selling_price: formData.selling_price ? parseFloat(formData.selling_price) : 0,
      min_stock: parseInt(formData.min_stock),
      supplier: formData.supplier || undefined
    };

    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, itemData);
      } else {
        await createInventoryItem(itemData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save inventory item:', error);
      alert('Failed to save inventory item. Please try again.');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteInventoryItem(id);
      } catch (error) {
        console.error('Failed to delete inventory item:', error);
        alert('Failed to delete inventory item. Please try again.');
      }
    }
  };

  const getStockBadgeVariant = (item: InventoryItem) => {
    if (item.quantity <= item.min_stock) return 'danger';
    if (item.quantity <= item.min_stock * 1.5) return 'warn';
    return 'success';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const columns = [
    {
      key: 'name' as const,
      header: 'Name',
      render: (_: any, item: InventoryItem) => item.name
    },
    {
      key: 'category' as const,
      header: 'Category',
      render: (_: any, item: InventoryItem) => item.category
    },
    {
      key: 'quantity' as const,
      header: 'Stock',
      render: (_: any, item: InventoryItem) => (
        <Badge variant={getStockBadgeVariant(item)}>
          {item.quantity} (min: {item.min_stock})
        </Badge>
      )
    },
    {
      key: 'supplier' as const,
      header: 'Supplier',
      render: (_: any, item: InventoryItem) => item.supplier || 'N/A'
    },
    {
      key: 'unit_cost' as const,
      header: 'Cost Price',
      render: (_: any, item: InventoryItem) => {
        if (item.unit_cost && !isNaN(Number(item.unit_cost))) {
          return formatCurrency(Number(item.unit_cost));
        }
        return '₹0.00';
      }
    },
    {
      key: 'selling_price' as const,
      header: 'Selling Price',
      render: (value: any) => {
        if (value && !isNaN(Number(value))) {
          return formatCurrency(Number(value));
        }
        return '₹0.00';
      }
    },
    {
      key: 'id' as const,
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
            onClick={() => handleDeleteItem(item.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div>Error loading inventory: {error}</div>;

  return (
    <div className={styles.inventory}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Total Items</h3>
              <p className={styles.statsNumber}>{inventory.length}</p>
              <p className={styles.statsDetail}>In inventory</p>
            </div>
            <div className={styles.statsIcon}>📦</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Low Stock Items</h3>
              <p className={styles.statsNumber}>{lowStockItems.length}</p>
              <p className={styles.statsDetail}>Need reorder</p>
            </div>
            <div className={styles.statsIcon}>⚠️</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Categories</h3>
              <p className={styles.statsNumber}>{Categories.length}</p>
              <p className={styles.statsDetail}>Product types</p>
            </div>
            <div className={styles.statsIcon}>🏷️</div>
          </div>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <div className={styles.tableHeader}>
          <h2>Inventory Management</h2>
          <div className="flex" style={{ gap: '1rem' }}>
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...Categories.map(cat => ({ value: cat, label: cat }))
              ]}
            />
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              + Add Item
            </Button>
          </div>
        </div>
        
        <Table data={filteredItems} columns={columns} />
        
        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
            {searchTerm || filterCategory !== 'all' ? 'No items found matching your search' : 'No inventory items added yet'}
          </div>
        )}
      </Card>

      {/* Inventory Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <label>
              Item Name
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </label>

            <label>
              Category
              <Select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'Hair Products' | 'Shaving' | 'Tools' | 'Cleaning' | 'Other' }))}
                options={Categories.map(cat => ({
                  value: cat,
                  label: cat
                }))}
                required
              />
            </label>

            <label>
              Quantity
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
              />
            </label>

            <label>
              Unit Cost (₹)
              <Input
                type="number"
                value={formData.unit_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: e.target.value }))}
                step="0.01"
                placeholder="Cost per unit"
              />
            </label>

            <label>
              Selling Price (₹)
              <Input
                type="number"
                value={formData.selling_price}
                onChange={(e) => setFormData(prev => ({ ...prev, selling_price: e.target.value }))}
                step="0.01"
                placeholder="Selling price per unit"
              />
            </label>

            <label>
              Minimum Stock
              <Input
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, min_stock: e.target.value }))}
                required
              />
            </label>

            <label>
              Supplier
              <Input
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                placeholder="Optional"
              />
            </label>
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

export default BarbershopInventory;