import { useBarbershopDashboard } from '../../../hooks/useBarbershopDashboard';
import { Card } from '../../../components/ui';

const BarbershopStatsCards: React.FC = () => {
  const { stats, loading, error } = useBarbershopDashboard();

  if (loading) {
    return (
      <div className="grid stats">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <div className="stat-row">
              <div className="stat-title">Loading...</div>
            </div>
            <div className="stat-value">--</div>
            <div className="kicker">Loading data...</div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid stats">
        <Card>
          <div className="stat-row">
            <div className="stat-title">Error</div>
          </div>
          <div className="stat-value">!</div>
          <div className="kicker">{error}</div>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid stats">
        <Card>
          <div className="stat-row">
            <div className="stat-title">No Data</div>
          </div>
          <div className="stat-value">--</div>
          <div className="kicker">No statistics available</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid stats">
      {/* Today's Revenue Card */}
      <Card>
        <div className="stat-row">
          <div className="stat-title">Today's Revenue</div>
          <div className="pill">₹</div>
        </div>
        <div className="stat-value">
          ₹{stats.today_sales.toLocaleString('en-IN')}
        </div>
        <div className="kicker">Revenue earned today</div>
      </Card>

      {/* Total Revenue Card */}
      <Card>
        <div className="stat-row">
          <div className="stat-title">Total Revenue</div>
          <div className="pill">₹</div>
        </div>
        <div className="stat-value">
          ₹{stats.total_sales.toLocaleString('en-IN')}
        </div>
        <div className="kicker">All time revenue</div>
      </Card>

      {/* Today's Appointments Card */}
      <Card>
        <div className="stat-row">
          <div className="stat-title">Today's Appointments</div>
        </div>
        <div className="stat-value">{stats.today_appointments}</div>
        <div className="kicker">
          {stats.completed_appointments} completed • {stats.pending_appointments} pending • {stats.cancelled_appointments} cancelled
        </div>
      </Card>

      {/* Staff & Customers Card */}
      <Card>
        <div className="stat-row">
          <div className="stat-title">Active Staff</div>
        </div>
        <div className="stat-value">{stats.active_staff}</div>
        <div className="kicker">
          {stats.total_customers} total customers • {stats.low_stock_items} low stock items
        </div>
      </Card>
    </div>
  );
};

export default BarbershopStatsCards;