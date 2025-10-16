import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const openAppointmentModal = () => {
    // TODO: Implement appointment modal
    console.log('Opening appointment modal...');
    navigate('/appointments');
  };

  const openSaleModal = () => {
    // TODO: Implement sale modal  
    console.log('Opening sale modal...');
    navigate('/sales');
  };

  return (
    <div className="grid actions" style={{ margin: '0.5rem 0 1rem' }}>
      {/* New Appointment Action - exactly matching original HTML */}
      <div className="action" onClick={openAppointmentModal}>
        📅
        <div>
          <strong>New Appointment</strong>
        </div>
      </div>

      {/* Record Sale Action - exactly matching original HTML */}
      <div className="action" onClick={openSaleModal}>
        💰
        <div>
          <strong>Record Sale</strong>
        </div>
      </div>

      {/* Manage Staff Action - exactly matching original HTML */}
      <div className="action" onClick={() => navigate('/staff')}>
        👥
        <div>
          <strong>Manage Staff</strong>
        </div>
      </div>

      {/* View Reports Action - exactly matching original HTML */}
      <div className="action" onClick={() => navigate('/reports')}>
        📊
        <div>
          <strong>View Reports</strong>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;