import React, { useState } from 'react';
import { useBarbershopStaff } from '../hooks/useBarbershopStaff';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import styles from './Staff.module.css';
import type { Staff } from '../services/barbershopApi';
import StaffAvailabilityGrid from '../components/StaffAvailabilityGrid';

const Roles: ('Barber' | 'Senior Barber' | 'Manager' | 'Receptionist')[] = [
  'Barber', 'Senior Barber', 'Manager', 'Receptionist'
];

const StatusOptions: ('Active' | 'Inactive' | 'On Leave')[] = ['Active', 'Inactive', 'On Leave'];

const BarbershopStaff: React.FC = () => {
  const {
    staff,
    loading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffByRole,
    getStaffByStatus
  } = useBarbershopStaff();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: 'Barber' as 'Barber' | 'Senior Barber' | 'Manager' | 'Receptionist',
    phone: '',
    email: '',
    status: 'Active' as 'Active' | 'Inactive' | 'On Leave',
    salary: ''
  });

  const stats = {
    total: staff.length,
    active: getStaffByStatus('Active').length,
    inactive: getStaffByStatus('Inactive').length,
    barbers: getStaffByRole('Barber').length + getStaffByRole('Senior Barber').length,
    support: getStaffByRole('Manager').length + getStaffByRole('Receptionist').length + getStaffByRole('Cleaner').length
  };
  const filteredStaff = searchTerm ? 
    staff.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
    ) : staff;

  const handleOpenModal = (staffMember?: Staff) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        role: staffMember.role as any,
        phone: staffMember.phone,
        email: staffMember.email || '',
        status: staffMember.status,
        salary: staffMember.salary ? (typeof staffMember.salary === 'string' ? staffMember.salary : staffMember.salary.toString()) : ''
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        role: 'Barber',
        phone: '',
        email: '',
        status: 'Active',
        salary: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData({
      name: '',
      role: 'Barber',
      phone: '',
      email: '',
      status: 'Active',
      salary: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const staffData = {
      name: formData.name,
      role: formData.role,
      phone: formData.phone,
      email: formData.email && formData.email.trim() !== '' ? formData.email.trim() : null,
      status: formData.status,
      salary: formData.salary && formData.salary.trim() !== '' ? parseFloat(formData.salary) : null,
      schedule: 'To be set via availability grid', // Default message - will be managed via availability grid
      join_date: new Date().toISOString().split('T')[0] // Use today's date for new staff
    };

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, staffData);
      } else {
        await createStaff(staffData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save staff member:', error);
      alert('Failed to save staff member. Please try again.');
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
      } catch (error) {
        console.error('Failed to delete staff member:', error);
        alert('Failed to delete staff member. Please try again.');
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'success' : 'danger';
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Manager': return 'danger';
      case 'Senior Barber': return 'warn';
      case 'Barber': return 'success';
      case 'Receptionist': return 'info';
      case 'Cleaner': return 'info';
      default: return 'info';
    }
  };

  const formatCurrency = (amount?: string | number | null) => {
    console.log('DEBUG formatCurrency: input amount =', amount, 'type =', typeof amount);
    
    if (amount === null || amount === undefined || amount === '') {
      console.log('DEBUG formatCurrency: returning "Not set" for null/undefined/empty');
      return 'Not set';
    }
    
    // Convert string to number if needed
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    console.log('DEBUG formatCurrency: converted to number =', numAmount);
    
    if (isNaN(numAmount)) {
      console.log('DEBUG formatCurrency: returning "Not set" for NaN');
      return 'Not set';
    }
    if (numAmount === 0) return '₹0';
    
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(numAmount);
    
    console.log('DEBUG formatCurrency: final formatted =', formatted);
    return formatted;
  };

  const columns = [
    {
      key: 'name' as const,
      header: 'Name',
      render: (_: any, staff: Staff) => staff.name
    },
    {
      key: 'role' as const,
      header: 'Role',
      render: (_: any, staff: Staff) => (
        <Badge variant={getRoleBadgeVariant(staff.role)}>
          {staff.role}
        </Badge>
      )
    },
    {
      key: 'phone' as const,
      header: 'Phone',
      render: (_: any, staff: Staff) => staff.phone
    },
    {
      key: 'email' as const,
      header: 'Email',
      render: (_: any, staff: Staff) => {
        console.log(`DEBUG email render for ${staff.name}:`, staff.email, 'type:', typeof staff.email);
        return staff.email && staff.email.trim() !== '' ? staff.email : 'Not provided';
      }
    },
    {
      key: 'salary' as const,
      header: 'Monthly Salary',
      render: (_: any, staff: Staff) => formatCurrency(staff.salary)
    },
    {
      key: 'join_date' as const,
      header: 'Join Date',
      render: (_: any, staff: Staff) => {
        console.log(`DEBUG join_date render for ${staff.name}:`, staff.join_date, 'type:', typeof staff.join_date);
        if (!staff.join_date) return 'Not set';
        const date = new Date(staff.join_date);
        return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString('en-IN');
      }
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (_: any, staff: Staff) => (
        <Badge variant={getStatusBadgeVariant(staff.status)}>
          {staff.status}
        </Badge>
      )
    },
    {
      key: 'id' as const,
      header: 'Actions',
      render: (_: any, staff: Staff) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(staff)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteStaff(staff.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <div>Loading staff...</div>;
  if (error) return <div>Error loading staff: {error}</div>;

  return (
    <div className={styles.staff}>
      {/* Staff Statistics */}
      <div className={styles.statsGrid}>
        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Total Staff</h3>
              <p className={styles.statsNumber}>{stats.total}</p>
              <p className={styles.statsDetail}>{stats.active} active, {stats.inactive} inactive</p>
            </div>
            <div className={styles.statsIcon}>👥</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Barbers</h3>
              <p className={styles.statsNumber}>{stats.barbers}</p>
              <p className={styles.statsDetail}>Service providers</p>
            </div>
            <div className={styles.statsIcon}>✂️</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Support Staff</h3>
              <p className={styles.statsNumber}>{stats.support}</p>
              <p className={styles.statsDetail}>Managers & receptionists</p>
            </div>
            <div className={styles.statsIcon}>🏢</div>
          </div>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <div className={styles.tableHeader}>
          <h2>Staff Management</h2>
          <div className="flex" style={{ gap: '1rem' }}>
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              + Add Staff Member
            </Button>
          </div>
        </div>
        
        <Table data={filteredStaff} columns={columns} />
        
        {filteredStaff.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
            {searchTerm ? 'No staff members found matching your search' : 'No staff members added yet'}
          </div>
        )}
      </Card>

      {/* Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
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
              Role
              <Select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                options={Roles.map(role => ({
                  value: role,
                  label: role
                }))}
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

            <label>
              Email
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Optional"
              />
            </label>

            <label>
              Monthly Salary (₹)
              <Input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                step="1000"
                placeholder="Optional"
              />
            </label>

            <label>
              Status
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                options={StatusOptions.map(status => ({
                  value: status,
                  label: status
                }))}
                required
              />
            </label>
          </div>

          <div style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            background: 'var(--slate-50)', 
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: 'var(--slate-600)'
          }}>
            📅 <strong>Schedule Management:</strong> Staff schedules are managed through the Staff Availability Grid below. Add the staff member first, then set their availability using the interactive schedule grid.
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Staff Availability Grid */}
      <StaffAvailabilityGrid staff={staff} />
    </div>
  );
};

export default BarbershopStaff;