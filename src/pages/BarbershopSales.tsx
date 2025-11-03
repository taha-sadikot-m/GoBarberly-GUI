import React, { useState } from 'react';
import { useBarbershopSales } from '../hooks/useBarbershopSales';
import { useBarbershopStaff } from '../hooks/useBarbershopStaff';
import { useServiceOptions } from '../hooks/useServiceOptions';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import styles from './Sales.module.css';
import type { Sale } from '../services/barbershopApi';

const PaymentMethods: ('Cash' | 'UPI' | 'Card' | 'Paytm')[] = ['Cash', 'UPI', 'Card', 'Paytm'];

const BarbershopSales: React.FC = () => {
  const {
    sales,
    loading,
    error,
    createSale,
    updateSale,
    deleteSale,
    getSalesByPeriod
  } = useBarbershopSales();

  const { staff } = useBarbershopStaff();
  const { serviceOptions, getServicePrice } = useServiceOptions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    service: '',
    barber_name: '',
    amount: '',
    payment_method: 'Cash' as 'Cash' | 'UPI' | 'Card' | 'Paytm'
  });

  // Get active barbers from staff data
  const activeBarbers = staff.filter(member => 
    member.status === 'Active' && 
    (member.role.toLowerCase().includes('barber') || member.is_barber)
  );
  
  // Get unique barbers (combine staff data with existing sale barbers)
  const existingBarbers = Array.from(new Set(sales.map(s => s.barber_name).filter(Boolean)));
  const staffBarberNames = activeBarbers.map(barber => barber.name);
  const allBarbers = Array.from(new Set([...staffBarberNames, ...existingBarbers]));
  
  const barberSelectOptions = [
    { value: '', label: 'Select Barber' },
    ...allBarbers.map(barber => ({ value: barber, label: barber }))
  ];

  const salesByPeriod = getSalesByPeriod();
  const filteredSales = searchTerm ? 
    sales.filter(sale => 
      sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.barber_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : sales;

  const stats = {
    today: { amount: salesByPeriod.today, count: sales.filter(s => s.sale_date.startsWith(new Date().toISOString().split('T')[0])).length },
    week: { amount: salesByPeriod.week, count: sales.filter(s => new Date(s.sale_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length },
    month: { amount: salesByPeriod.month, count: sales.filter(s => new Date(s.sale_date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length }
  };

  const handleOpenModal = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      setFormData({
        customer_name: sale.customer_name,
        service: sale.service,
        barber_name: sale.barber_name,
        amount: sale.amount.toString(),
        payment_method: sale.payment_method as 'Cash' | 'UPI' | 'Card' | 'Paytm'
      });
    } else {
      setEditingSale(null);
      setFormData({
        customer_name: '',
        service: '',
        barber_name: '',
        amount: '',
        payment_method: 'Cash'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
    setFormData({
      customer_name: '',
      service: '',
      barber_name: '',
      amount: '',
      payment_method: 'Cash'
    });
  };

  const handleServiceChange = (service: string) => {
    setFormData(prev => ({ ...prev, service }));
    
    // Auto-update amount based on service price
    const price = getServicePrice(service);
    if (price) {
      setFormData(prev => ({ ...prev, amount: price.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const saleData = {
      customer_name: formData.customer_name,
      service: formData.service,
      barber_name: formData.barber_name,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method
    };

    try {
      if (editingSale) {
        await updateSale(editingSale.id, saleData);
      } else {
        await createSale(saleData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save sale:', error);
      alert('Failed to save sale. Please try again.');
    }
  };

  const handleDeleteSale = async (id: number) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale(id);
      } catch (error) {
        console.error('Failed to delete sale:', error);
        alert('Failed to delete sale. Please try again.');
      }
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
      key: 'sale_date' as const,
      header: 'Date',
      render: (_: any, sale: Sale) => new Date(sale.sale_date).toLocaleDateString()
    },
    {
      key: 'customer_name' as const,
      header: 'Customer',
      render: (_: any, sale: Sale) => sale.customer_name
    },
    {
      key: 'service' as const,
      header: 'Service',
      render: (_: any, sale: Sale) => sale.service
    },
    {
      key: 'barber_name' as const,
      header: 'Barber',
      render: (_: any, sale: Sale) => sale.barber_name
    },
    {
      key: 'amount' as const,
      header: 'Amount',
      render: (_: any, sale: Sale) => formatCurrency(sale.amount)
    },
    {
      key: 'payment_method' as const,
      header: 'Payment',
      render: (_: any, sale: Sale) => (
        <Badge variant={getPaymentBadgeVariant(sale.payment_method)}>
          {sale.payment_method}
        </Badge>
      )
    },
    {
      key: 'id' as const,
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

  if (loading) return <div>Loading sales...</div>;
  if (error) return <div>Error loading sales: {error}</div>;

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
          <div className="flex" style={{ gap: '1rem' }}>
            <Input
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              + Record Sale
            </Button>
          </div>
        </div>
        
        <Table data={filteredSales} columns={columns} />
        
        {filteredSales.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
            {searchTerm ? 'No sales found matching your search' : 'No sales recorded yet'}
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
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                required
              />
            </label>

            <label>
              Service
              <Select
                value={formData.service}
                onChange={(e) => handleServiceChange(e.target.value)}
                options={serviceOptions}
                required
              />
            </label>

            <label>
              Barber
              <Select
                value={formData.barber_name}
                onChange={(e) => setFormData(prev => ({ ...prev, barber_name: e.target.value }))}
                options={barberSelectOptions}
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
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value as any }))}
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

export default BarbershopSales;