import { useState } from 'react';
import { Card, Select } from '../../../components/ui';
import { ORG } from '../../../data/initialData';
import { useAppointments, useSales } from '../../../hooks';

const StatsCards: React.FC = () => {
  const { getTotalRevenue, getSalesCount } = useSales();
  const { getAppointmentStats } = useAppointments();
  const [satisfactionFilter, setSatisfactionFilter] = useState('top5');
  const [showTop5Chart, setShowTop5Chart] = useState(false);

  const revenue = getTotalRevenue();
  const salesCount = getSalesCount();
  const appointmentStats = getAppointmentStats();

  // Calculate satisfaction based on filter - matching original HTML
  const getSatisfactionData = () => {
    if (satisfactionFilter === 'overall') {
      return {
        value: '4.7/5',
        details: 'Based on all customer feedback'
      };
    }
    return {
      value: '4.9/5',
      details: 'Average rating for top performers'
    };
  };

  const satisfaction = getSatisfactionData();

  const satisfactionOptions = [
    { value: 'overall', label: 'Overall' },
    { value: 'top5', label: 'Top 5 Barbers' }
  ];

  return (
    <div className="grid stats">
      {/* Total Revenue Card - exactly matching original */}
      <Card>
        <div className="stat-row">
          <div className="stat-title">Total Revenue</div>
          <div className="pill">
            {ORG.currencySymbol} <span id="currencyCode">{ORG.currencyCode}</span>
          </div>
        </div>
        <div className="stat-value">
          {ORG.currencySymbol}<span id="revenueValue">{revenue.toLocaleString()}</span>
        </div>
        <div className="kicker" id="revenueKicker">Sum of paid sales in range</div>
      </Card>

      {/* Total Sales Card - exactly matching original */}
      <Card>
        <div className="stat-row">
          <div className="stat-title">Total Sales (Txns)</div>
        </div>
        <div className="stat-value" id="salesCountValue">{salesCount}</div>
        <div className="kicker"># of transactions in range</div>
      </Card>

      {/* Total Appointments Card - exactly matching original */}
      <Card>
        <div className="stat-row">
          <div className="stat-title">Total Appointments</div>
        </div>
        <div className="stat-value" id="appointmentValue">{appointmentStats.total}</div>
        <div className="kicker" id="appointmentDetails">
          {appointmentStats.completed + appointmentStats.confirmed} completed • {appointmentStats.pending} pending • {appointmentStats.cancelled} cancelled
        </div>
      </Card>

      {/* Customer Satisfaction Card - exactly matching original */}
      <Card>
        <div className="between">
          <div className="stat-title">Customer Satisfaction</div>
          <Select
            id="satisfactionFilter"
            value={satisfactionFilter}
            onChange={(e) => {
              setSatisfactionFilter(e.target.value);
              setShowTop5Chart(e.target.value === 'top5');
            }}
            options={satisfactionOptions}
          />
        </div>
        <div className="stat-value" id="satisfactionValue">{satisfaction.value}</div>
        <div className="kicker" id="satisfactionDetails">{satisfaction.details}</div>
        {showTop5Chart && (
          <div className="chartwrap" id="top5ChartWrap">
            <canvas id="top5BarbersChart"></canvas>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StatsCards;