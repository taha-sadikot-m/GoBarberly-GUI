import React, { useState, useEffect } from 'react';
import { useBarbershopHistory } from '../hooks/useBarbershopHistory';
import { type ActivityLog } from '../services/barbershopApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import styles from './Customers.module.css';

const BarbershopHistory: React.FC = () => {
  const {
    loading,
    error,
    history,
    searchHistory
  } = useBarbershopHistory();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filteredData, setFilteredData] = useState<ActivityLog[]>([]);

  useEffect(() => {
    let result = history;
    
    if (search) {
      result = searchHistory(search);
    }
    
    if (filterType !== 'all') {
      result = result.filter(activity => activity.action_type === filterType);
    }
    
    setFilteredData(result);
  }, [history, search, filterType, searchHistory]);

  const handleViewDetail = (activity: ActivityLog) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'add':
        return 'success';
      case 'update':
      case 'edit':
        return 'info';
      case 'delete':
      case 'remove':
        return 'danger';
      default:
        return 'warn';
    }
  };

  const getEntityTypeBadge = (entityType: string) => {
    const badges: { [key: string]: string } = {
      appointment: '📅',
      sale: '💰',
      staff: '👤',
      customer: '🧑‍🤝‍🧑',
      inventory: '📦',
      service: '✂️'
    };
    return badges[entityType.toLowerCase()] || '📄';
  };

  const columns = [
    {
      key: 'created_at' as keyof ActivityLog,
      header: 'Date & Time',
      render: (value: string) => (
        <div className={styles.dateCell}>
          <div className={styles.date}>{formatDate(value)}</div>
        </div>
      )
    },
    {
      key: 'action_type' as keyof ActivityLog,
      header: 'Action',
      render: (value: string) => (
        <Badge variant={getActionBadgeVariant(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'action_type' as keyof ActivityLog,
      header: 'Type',
      render: (value: string) => (
        <div className={styles.entityType}>
          <span className={styles.entityIcon}>{getEntityTypeBadge(value)}</span>
          {value}
        </div>
      )
    },
    {
      key: 'description' as keyof ActivityLog,
      header: 'Description',
      render: (value: string) => (
        <div className={styles.description}>{value}</div>
      )
    },
    {
      key: 'created_at' as keyof ActivityLog,
      header: 'User',
      render: () => (
        <div className={styles.user}>System</div>
      )
    },
    {
      key: 'id' as keyof ActivityLog,
      header: 'Actions',
      render: (_: any, row: ActivityLog) => (
        <Button
          variant="ghost"
          onClick={() => handleViewDetail(row)}
          className={styles.detailButton}
        >
          View Details
        </Button>
      )
    }
  ];

  if (loading) return <div>Loading history...</div>;
  if (error) return <div>Error loading history: {error}</div>;

  return (
    <div className={styles.history}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Activity History</h2>
        <p>Track all activities and changes in your barbershop</p>
      </div>

      {/* Filters */}
      <Card className={styles.filtersCard}>
        <div className={styles.filters}>
          <div className={styles.searchGroup}>
            <Input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All Activities' },
                { value: 'appointment', label: 'Appointments' },
                { value: 'sale', label: 'Sales' },
                { value: 'staff', label: 'Staff' },
                { value: 'customer', label: 'Customers' },
                { value: 'inventory', label: 'Inventory' },
                { value: 'service', label: 'Services' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className={styles.summary}>
        <p>
          Showing {filteredData.length} of {history.length} activities
          {search && ` matching "${search}"`}
          {filterType !== 'all' && ` in ${filterType}`}
        </p>
      </div>

      {/* Activities Table */}
      <Card>
        <Table
          data={filteredData}
          columns={columns}
        />
      </Card>

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <Modal
          isOpen={showDetailModal}
          title="Activity Details"
          onClose={() => setShowDetailModal(false)}
        >
          <div className={styles.activityDetail}>
            <div className={styles.detailHeader}>
              <div className={styles.detailTitle}>
                <span className={styles.entityIcon}>
                  {getEntityTypeBadge(selectedActivity.action_type)}
                </span>
                <Badge variant={getActionBadgeVariant(selectedActivity.action_type)}>
                  {selectedActivity.action_type}
                </Badge>
                <span>{selectedActivity.action_type}</span>
              </div>
              <div className={styles.detailTime}>
                {formatDate(selectedActivity.created_at)}
              </div>
            </div>

            <div className={styles.detailContent}>
              <div className={styles.detailRow}>
                <label>Description:</label>
                <p>{selectedActivity.description}</p>
              </div>

              <div className={styles.detailRow}>
                <label>Action Type:</label>
                <p>{selectedActivity.action_type}</p>
              </div>

              <div className={styles.detailRow}>
                <label>Activity ID:</label>
                <p>{selectedActivity.id}</p>
              </div>

              <div className={styles.detailRow}>
                <label>Timestamp:</label>
                <p>{formatDate(selectedActivity.created_at)}</p>
              </div>
            </div>

            <div className={styles.detailActions}>
              <Button
                variant="ghost"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Empty State */}
      {filteredData.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
            {search || filterType !== 'all' ? (
              <>
                <p>No activities found matching your search criteria.</p>
                <div style={{ marginTop: '1rem' }}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearch('');
                      setFilterType('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </>
            ) : (
              <p>No activity history available yet.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default BarbershopHistory;