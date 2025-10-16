import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import styles from './Customers.module.css';
import type { Customer } from '../types';

const Customers: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData: Customer = {
      id: editingCustomer?.id || Date.now(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      notes: formData.notes || undefined,
      lastVisit: editingCustomer?.lastVisit || new Date().toISOString().slice(0, 10),
      visits: editingCustomer?.visits || 1
    };

    if (editingCustomer) {
      dispatch({
        type: 'UPDATE_CUSTOMER_ITEM',
        payload: customerData
      });
    } else {
      dispatch({
        type: 'ADD_CUSTOMER_ITEM',
        payload: customerData
      });
    }

    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      dispatch({
        type: 'DELETE_CUSTOMER_ITEM',
        payload: id
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const customerColumns = [
    { key: 'name' as keyof Customer, header: 'Name' },
    { key: 'phone' as keyof Customer, header: 'Phone' },
    { 
      key: 'email' as keyof Customer, 
      header: 'Email',
      render: (value: any) => value || '-'
    },
    { key: 'visits' as keyof Customer, header: 'Visits' },
    {
      key: 'lastVisit' as keyof Customer,
      header: 'Last Visit',
      render: (value: any) => formatDate(value || new Date().toISOString())
    },
    {
      key: 'id' as keyof Customer,
      header: 'Actions',
      render: (_: any, customer: Customer) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(customer)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(customer.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.customers}>
      <Card>
        <div className={styles.tableHeader}>
          <h2>Customer Management</h2>
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
          >
            + Add Customer
          </Button>
        </div>
        
        <Table
          columns={customerColumns}
          data={state.data.customers}
        />
      </Card>

      {/* Add/Edit Customer Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div>
              <label>Name</label>
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
              <label>Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
                required
              />
            </div>
            
            <div className={styles.fullWidth}>
              <label>Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
              />
            </div>
            
            <div className={styles.fullWidth}>
              <label>Notes</label>
              <textarea
                className={styles.textarea}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                rows={3}
                placeholder="Preferred styles, allergies, etc."
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;