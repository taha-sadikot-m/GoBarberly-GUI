import React, { useState } from 'react';
import { useBarbershopCustomers } from '../hooks/useBarbershopCustomers';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import styles from './Customers.module.css';
import type { Customer } from '../services/barbershopApi';

const BarbershopCustomers: React.FC = () => {
  const {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useBarbershopCustomers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined
    };

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData);
      } else {
        await createCustomer(customerData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
      } catch (error) {
        console.error('Failed to delete customer:', error);
        alert('Failed to delete customer. Please try again.');
      }
    }
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
      render: (_: any, customer: Customer) => customer.name
    },
    {
      key: 'phone' as const,
      header: 'Phone',
      render: (_: any, customer: Customer) => customer.phone
    },
    {
      key: 'email' as const,
      header: 'Email',
      render: (_: any, customer: Customer) => customer.email || 'N/A'
    },
    {
      key: 'total_visits' as const,
      header: 'Visits',
      render: (_: any, customer: Customer) => customer.total_visits
    },
    {
      key: 'total_spent' as const,
      header: 'Total Spent',
      render: (_: any, customer: Customer) => formatCurrency(customer.total_spent)
    },
    {
      key: 'last_visit_date' as const,
      header: 'Last Visit',
      render: (_: any, customer: Customer) => new Date(customer.last_visit_date).toLocaleDateString()
    },
    {
      key: 'id' as const,
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
            onClick={() => handleDeleteCustomer(customer.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <div>Loading customers...</div>;
  if (error) return <div>Error loading customers: {error}</div>;

  return (
    <div className={styles.customers}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Total Customers</h3>
              <p className={styles.statsNumber}>{customers.length}</p>
              <p className={styles.statsDetail}>Registered customers</p>
            </div>
            <div className={styles.statsIcon}>👥</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Total Revenue</h3>
              <p className={styles.statsNumber}>
                {formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0))}
              </p>
              <p className={styles.statsDetail}>From all customers</p>
            </div>
            <div className={styles.statsIcon}>💰</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Average Spent</h3>
              <p className={styles.statsNumber}>
                {customers.length > 0 ? 
                  formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length) : 
                  '₹0'
                }
              </p>
              <p className={styles.statsDetail}>Per customer</p>
            </div>
            <div className={styles.statsIcon}>📊</div>
          </div>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <div className={styles.tableHeader}>
          <h2>Customer Management</h2>
          <div className="flex" style={{ gap: '1rem' }}>
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              + Add Customer
            </Button>
          </div>
        </div>
        
        <Table data={filteredCustomers} columns={columns} />
        
        {filteredCustomers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
            {searchTerm ? 'No customers found matching your search' : 'No customers registered yet'}
          </div>
        )}
      </Card>

      {/* Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <label>
              Name
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </label>

            <label>
              Phone
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </label>

            <label className={styles.fullWidth}>
              Email
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Optional"
              />
            </label>
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

export default BarbershopCustomers;