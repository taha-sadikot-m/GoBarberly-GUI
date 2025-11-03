import React, { useState, useEffect } from 'react';
import { useBarbershopServices } from '../hooks/useBarbershopServices';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import styles from './Services.module.css';
import type { BarbershopService } from '../types';

const BarbershopServices: React.FC = () => {
  const {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService
  } = useBarbershopServices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<BarbershopService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices = searchTerm ? 
    services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : services;

  const stats = {
    total: services.length,
    active: services.filter(s => s.is_active).length,
    inactive: services.filter(s => s.is_active === false).length,
    avgPrice: services.length > 0 ? 
      services.reduce((sum, s) => sum + (typeof s.price === 'string' ? parseFloat(s.price) : s.price), 0) / services.length : 0
  };

  const handleOpenModal = (service?: BarbershopService) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: typeof service.price === 'string' ? service.price : service.price.toString(),
        description: service.description || ''
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        price: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: '',
      price: '',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description
    };

    try {
      if (editingService) {
        await updateService(editingService.id, serviceData);
      } else {
        await createService(serviceData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save service:', error);
      alert('Failed to save service. Please try again.');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(id);
      } catch (error) {
        console.error('Failed to delete service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(numAmount);
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'success' : 'danger';
  };

  const columns = [
    {
      key: 'name' as const,
      header: 'Service Name',
      render: (_: any, service: BarbershopService) => (
        <div>
          <div className={styles.serviceName}>{service.name}</div>
          {service.description && (
            <div className={styles.serviceDescription}>{service.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'price' as const,
      header: 'Price',
      render: (_: any, service: BarbershopService) => (
        <span className={styles.servicePrice}>
          {service.formatted_price || formatCurrency(service.price)}
        </span>
      )
    },
    {
      key: 'is_active' as const,
      header: 'Status',
      render: (_: any, service: BarbershopService) => (
        <Badge variant={getStatusBadgeVariant(service.is_active)}>
          {service.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'id' as const,
      header: 'Actions',
      render: (_: any, service: BarbershopService) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(service)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteService(service.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <div>Loading services...</div>;
  if (error) return <div>Error loading services: {error}</div>;

  return (
    <div className={styles.services}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Total Services</h3>
              <p className={styles.statsAmount}>{stats.total}</p>
              <p className={styles.statsCount}>all services</p>
            </div>
            <div className={styles.statsIcon}>🛎️</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Active Services</h3>
              <p className={styles.statsAmount}>{stats.active}</p>
              <p className={styles.statsCount}>available now</p>
            </div>
            <div className={styles.statsIcon}>✅</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Average Price</h3>
              <p className={styles.statsAmount}>{formatCurrency(stats.avgPrice)}</p>
              <p className={styles.statsCount}>per service</p>
            </div>
            <div className={styles.statsIcon}>💰</div>
          </div>
        </Card>
      </div>

      {/* Services Table */}
      <Card>
        <div className={styles.tableHeader}>
          <h2>Services Management</h2>
          <div className="flex" style={{ gap: '1rem' }}>
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              + Add Service
            </Button>
          </div>
        </div>
        
        <Table data={filteredServices} columns={columns} />
        
        {filteredServices.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
            {searchTerm ? 'No services found matching your search' : 'No services created yet'}
          </div>
        )}
      </Card>

      {/* Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingService ? 'Edit Service' : 'Add Service'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <label>
              Service Name
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </label>

            <label>
              Price (₹)
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                step="1"
                required
              />
            </label>

            <label className={styles.fullWidth}>
              Description
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Service description (optional)"
              />
            </label>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingService ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BarbershopServices;