import React, {useEffect, useState, useCallback} from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {Plus, Edit2, Trash2, RefreshCw, TrendingUp, TrendingDown} from 'lucide-react';
import RecurringModal from './modals/RecurringModal';
import '../css/recurring.css';
import AlertModal from '../components/AlertModal.jsx';

function Recurring() {
  const [recurrings, setRecurrings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [initialData, setInitialData] = useState(null)

  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    idToDelete: null
  });

  const loadRecurrings = async () => {
    try{
      const response = await api.get('/api/finance/recurring');
      setRecurrings(response.data || []);
    }catch(error){
      console.error("Failed to load recurrings: ", error);
      toast.error("Failed to load recurrings.");
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecurrings();
  }, [loadRecurrings]);

  let activeCount = 0;
  let totalInflow = 0;
  let totalOutflow = 0;
  recurrings.forEach(rec => {
      if (rec.isActive) {
          activeCount++;
          // Quy đổi tần suất sang ước tính theo tháng (Monthly factor)
          let monthlyFactor = 1;
          switch (rec.frequency) {
              case 'Daily':
                  monthlyFactor = 30;
                  break;
              case 'Weekly':
                  monthlyFactor = 4.33; // ~52 tuần / 12 tháng
                  break;
              case 'Monthly':
                  monthlyFactor = 1;
                  break;
              case 'Yearly':
                  monthlyFactor = 1 / 12.0;
                  break;
              default:
                  monthlyFactor = 1;
          }
          if (rec.type === 'income') {
              totalInflow += rec.amount * monthlyFactor;
          } else {
              totalOutflow += rec.amount * monthlyFactor;
          }
      }
  });


  const openAddRecurringModal = () => {
    setIsRecurringModalOpen(true);
    setInitialData(null);
  }

  const openEditModal = (item) => {
    setInitialData(item);
    setIsRecurringModalOpen(true);
  };

  const triggerDelete = (id) => {
      setAlert({
          isOpen: true,
          type: 'confirm',
          title: 'Delete Recurring Transaction',
          message: 'Are you sure you want to delete this recurring configuration?',
          idToDelete: id
      });
  };

  const confirmDelete = async () => {
      const id = alert.idToDelete;
      if (!id) return;
      try {
          await api.delete(`/api/finance/recurring/${id}`);
          setAlert({
              isOpen: true,
              type: 'success',
              title: 'Deleted',
              message: 'Recurring configuration deleted successfully.',
              idToDelete: null
          });
          loadRecurrings();
      } catch (error) {
          console.error("Delete error:", error);
          setAlert({
              isOpen: true,
              type: 'danger',
              title: 'Error',
              message: 'Failed to delete recurring configuration.',
              idToDelete: null
          });
      }
  };

  // Helper format thời gian Next Run
  const formatNextRun = (dateString, isActive) => {
    if (!isActive || !dateString) return '-';
    const dateObj = new Date(dateString);
    const dateStr = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
    return `${dateStr} ${timeStr}`;
  };

  return (
    <div className='dashboard-container'>
      <div className='section-header'>
        <div>
          <h2>Recurring Transactions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Set up and manage automated scheduled income and expenses.
          </p>
        </div>
        <button className='submit-btn'
          style={{width: "auto", marginTop: 0, padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px"}}
          onClick={openAddRecurringModal}>
            <Plus size={18}/> Add Recuring
        </button>
      </div>
      
      {/* Summary Metrics Cards */}
      <div className="recurring-metrics-grid">
          {/* Active Configurations */}
          <div className="recurring-metric-card">
              <div className="recurring-metric-header">
                  <span className="recurring-metric-title">Active Configs</span>
                  <div className="recurring-metric-icon active">
                      <RefreshCw size={18} />
                  </div>
              </div>
              <div className="recurring-metric-value">{activeCount}</div>
          </div>
          {/* Monthly Est. Income */}
          <div className="recurring-metric-card">
              <div className="recurring-metric-header">
                  <span className="recurring-metric-title">Monthly Est. Income</span>
                  <div className="recurring-metric-icon income">
                      <TrendingUp size={18} />
                  </div>
              </div>
              <div className="recurring-metric-value income">
                  ${totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
          </div>
          {/* Monthly Est. Outflow */}
          <div className="recurring-metric-card">
              <div className="recurring-metric-header">
                  <span className="recurring-metric-title">Monthly Est. Outflow</span>
                  <div className="recurring-metric-icon expense">
                      <TrendingDown size={18} />
                  </div>
              </div>
              <div className="recurring-metric-value expense">
                  ${totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
          </div>
      </div>

      {/* Management table */}
      <section className='glass-card'>
        <div className='card-header-actions'>
          <h2>Recurring Configuration</h2>
        </div>

        <div className='recurring-table-container'>
          <table className='recurring-table'>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Frequency</th>
                <th>Amount</th>
                <th>Next run</th>
                <th>Status</th>
                <th style={{textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading? (
                <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                        <div className='loading-overlay-chill' style={{marginTop: '0px'}}>
                          <div className='spinner'></div>
                        </div>
                    </td>
                </tr>
              ): recurrings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', color: 'var(--text-secondary', padding: '2rem'}}>
                    No recurring configurations found.
                  </td>
                </tr>
              ) : (
                recurrings.map((rec) => {
                  const isIncome = rec.type?.toLowerCase() === 'income';
                  return(
                    <tr key={rec.id}>
                      <td style={{fontWeight: 500}}>{rec.description}</td>
                      <td>
                        <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>
                          {rec.category}
                        </span>
                      </td>
                      <td>
                        <span className='frequency-pill'>{rec.frequency}</span>
                      </td>
                      <td className={isIncome ? 'amount-income' : 'amount-expense'}>
                        {isIncome ? '+' : '-'}${rec.amount.toFixed(2)}
                      </td>
                      <td>{formatNextRun(rec.nextOccurrence, rec.isActive)}</td>
                      <td>
                          <span className={`badge ${rec.isActive ? 'badge-active' : 'badge-inactive'}`}>
                              {rec.isActive ? 'Active' : 'Inactive'}
                          </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                          <div className="row-actions" style={{ justifyContent: 'center' }}>
                              <button
                                  className="btn-icon edit-btn"
                                  onClick={() => openEditModal(rec)}
                                  title="Edit"
                              >
                                  <Edit2 size={16} />
                              </button>
                              <button
                                  className="btn-icon delete-btn"
                                  onClick={() => triggerDelete(rec.id)}
                                  title="Delete"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <RecurringModal 
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSuccess={loadRecurrings}
        initialData={initialData}/>
      <AlertModal
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
      />
    </div>
    

  );
}

export default Recurring;
