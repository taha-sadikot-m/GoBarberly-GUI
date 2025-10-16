import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import styles from './Sales.module.css';
import type { Sale } from '../types';

const Services = [
  { value: 'Haircut', label: 'Haircut - ₹300', price: 300 },
  { value: 'Beard Trim', label: 'Beard Trim - ₹200', price: 200 },
  { value: 'Hair + Beard', label: 'Hair + Beard - ₹450', price: 450 },
  { value: 'Shave', label: 'Shave - ₹250', price: 250 },
  { value: 'Hair Color', label: 'Hair Color - ₹500', price: 500 },
];

const PaymentMethods: ('Cash' | 'UPI' | 'Card' | 'Paytm')[] = ['Cash', 'UPI', 'Card', 'Paytm'];

const Sales: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    customer: '',
    service: '',
    barber: '',
    amount: '',
    payment: 'Cash' as 'Cash' | 'UPI' | 'Card' | 'Paytm'
  });

  // Calculate stats for today, this week, and this month
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Calculate start of week (Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    // Calculate start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = startOfMonth.toISOString().split('T')[0];

    const todaySales = state.data.sales.filter((sale: Sale) => sale.date.split('T')[0] === today);
    const weekSales = state.data.sales.filter((sale: Sale) => sale.date.split('T')[0] >= weekStart);
    const monthSales = state.data.sales.filter((sale: Sale) => sale.date.split('T')[0] >= monthStart);

    return {
      today: {
        amount: todaySales.reduce((sum: number, sale: Sale) => sum + sale.amount, 0),
        count: todaySales.length
      },
      week: {
        amount: weekSales.reduce((sum: number, sale: Sale) => sum + sale.amount, 0),
        count: weekSales.length
      },
      month: {
        amount: monthSales.reduce((sum: number, sale: Sale) => sum + sale.amount, 0),
        count: monthSales.length
      }
    };
  }, [state.data.sales]);

  const handleOpenModal = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      setFormData({
        customer: sale.customer,
        service: sale.service,
        barber: sale.barber,
        amount: sale.amount.toString(),
        payment: sale.payment
      });
    } else {
      setEditingSale(null);
      setFormData({
        customer: '',
        service: '',
        barber: '',
        amount: '',
        payment: 'Cash'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
    setFormData({
      customer: '',
      service: '',
      barber: '',
      amount: '',
      payment: 'Cash'
    });
  };

  const handleServiceChange = (service: string) => {
    setFormData(prev => ({ ...prev, service }));
    
    // Auto-update amount based on service price
    const serviceData = Services.find(s => s.value === service);
    if (serviceData) {
      setFormData(prev => ({ ...prev, amount: serviceData.price.toString() }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const saleData = {
      customer: formData.customer,
      service: formData.service,
      barber: formData.barber,
      amount: parseFloat(formData.amount),
      payment: formData.payment
    };

    if (editingSale) {
      dispatch({
        type: 'UPDATE_SALE',
        payload: {
          id: editingSale.id,
          updates: saleData
        }
      });
    } else {
      dispatch({
        type: 'ADD_SALE',
        payload: saleData
      });
    }

    handleCloseModal();
  };

  const handleDeleteSale = (id: number) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      dispatch({
        type: 'DELETE_SALE',
        payload: id
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getPaymentBadgeVariant = (payment: string) => {
    switch (payment) {
      case 'Cash': return 'success';
      case 'UPI': return 'info';
      case 'Card': return 'warn';
      case 'Paytm': return 'danger';
      default: return 'info';
    }
  };

  const columns = [
    {
      key: 'date' as keyof Sale,
      header: 'Date',
      render: (_: any, sale: Sale) => new Date(sale.date).toLocaleDateString()
    },
    {
      key: 'customer' as keyof Sale,
      header: 'Customer',
      render: (_: any, sale: Sale) => sale.customer
    },
    {
      key: 'service' as keyof Sale,
      header: 'Service',
      render: (_: any, sale: Sale) => sale.service
    },
    {
      key: 'barber' as keyof Sale,
      header: 'Barber',
      render: (_: any, sale: Sale) => sale.barber
    },
    {
      key: 'amount' as keyof Sale,
      header: 'Amount',
      render: (_: any, sale: Sale) => formatCurrency(sale.amount)
    },
    {
      key: 'payment' as keyof Sale,
      header: 'Payment',
      render: (_: any, sale: Sale) => (
        <Badge variant={getPaymentBadgeVariant(sale.payment)}>
          {sale.payment}
        </Badge>
      )
    },
    {
      key: 'id' as keyof Sale,
      header: 'Actions',
      render: (_: any, sale: Sale) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(sale)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteSale(sale.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.sales}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Today's Sales</h3>
              <p className={styles.statsAmount}>{formatCurrency(stats.today.amount)}</p>
              <p className={styles.statsCount}>{stats.today.count} transactions</p>
            </div>
            <div className={styles.statsIcon}>💰</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>This Week</h3>
              <p className={styles.statsAmount}>{formatCurrency(stats.week.amount)}</p>
              <p className={styles.statsCount}>{stats.week.count} transactions</p>
            </div>
            <div className={styles.statsIcon}>📊</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>This Month</h3>
              <p className={styles.statsAmount}>{formatCurrency(stats.month.amount)}</p>
              <p className={styles.statsCount}>{stats.month.count} transactions</p>
            </div>
            <div className={styles.statsIcon}>📈</div>
          </div>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <div className={styles.tableHeader}>
          <h2>Sales Transactions</h2>
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
          >
            + Record Sale
          </Button>
        </div>
        
        <Table data={state.data.sales} columns={columns} />
        
        {state.data.sales.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
            No sales recorded yet
          </div>
        )}
      </Card>

      {/* Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSale ? 'Edit Sale' : 'Record Sale'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <label>
              Customer
              <Input
                value={formData.customer}
                onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                required
              />
            </label>

            <label>
              Service
              <Select
                value={formData.service}
                onChange={(e) => handleServiceChange(e.target.value)}
                options={[
                  { value: '', label: 'Select Service' },
                  ...Services.map(service => ({
                    value: service.value,
                    label: service.label
                  }))
                ]}
                required
              />
            </label>

            <label>
              Barber
              <Select
                value={formData.barber}
                onChange={(e) => setFormData(prev => ({ ...prev, barber: e.target.value }))}
                options={[
                  { value: '', label: 'Select Barber' },
                  ...state.data.staff
                    .filter((staff: any) => staff.role === 'Barber' || staff.role === 'Senior Barber')
                    .map((barber: any) => ({
                      value: barber.name,
                      label: barber.name
                    }))
                ]}
                required
              />
            </label>

            <label>
              Amount (₹)
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                step="1"
                required
              />
            </label>

            <label className={styles.fullWidth}>
              Payment Method
              <Select
                value={formData.payment}
                onChange={(e) => setFormData(prev => ({ ...prev, payment: e.target.value as 'Cash' | 'UPI' | 'Card' | 'Paytm' }))}
                options={PaymentMethods.map(method => ({
                  value: method,
                  label: method
                }))}
                required
              />
            </label>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingSale ? 'Update Sale' : 'Record Sale'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;