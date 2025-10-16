import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    category: 'Hair Products' | 'Shaving' | 'Tools' | 'Cleaning' | 'Other';
    quantity: string;
    minStock: string;
  }>({
    name: '',
    category: 'Hair Products',
    quantity: '',
    minStock: ''
  });

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity.toString(),
        minStock: item.minStock.toString()
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'Hair Products',
        quantity: '',
        minStock: ''
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
      minStock: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData: InventoryItem = {
      id: editingItem?.id || Date.now(),
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      minStock: Number(formData.minStock)
    };

    if (editingItem) {
      dispatch({
        type: 'UPDATE_INVENTORY_ITEM',
        payload: itemData
      });
    } else {
      dispatch({
        type: 'ADD_INVENTORY_ITEM',
        payload: itemData
      });
    }

    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      dispatch({
        type: 'DELETE_INVENTORY_ITEM',
        payload: id
      });
    }
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock) {
      return <Badge variant="danger">Low</Badge>;
    }
    return <Badge variant="success">OK</Badge>;
  };

  const inventoryColumns = [
    { key: 'name' as keyof InventoryItem, header: 'Item' },
    { key: 'category' as keyof InventoryItem, header: 'Category' },
    { key: 'quantity' as keyof InventoryItem, header: 'Qty' },
    { key: 'minStock' as keyof InventoryItem, header: 'Min' },
    {
      key: 'quantity' as keyof InventoryItem, // Using quantity as key for status
      header: 'Status',
      render: (_: any, item: InventoryItem) => getStockStatus(item.quantity, item.minStock)
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
      <Card>
        <div className={styles.tableHeader}>
          <h2>Inventory Management</h2>
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
          >
            + Add Item
          </Button>
        </div>
        
        <Table
          columns={inventoryColumns}
          data={state.data.inventory}
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
                value={formData.minStock}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  minStock: e.target.value
                }))}
                required
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