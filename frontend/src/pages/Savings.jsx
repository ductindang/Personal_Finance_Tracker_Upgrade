import React, {useState, useEffect} from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {PlusCircle, Plus, Trash2, Info, X, PiggyBank, Calendar, ArrowDownCircle, ArrowUpCircle, Minus } from 'lucide-react';
import '../css/saving.css';
import TransactionModal from './modals/TransactionModal';
import AlertModal from '../components/AlertModal';
import SavingModal from './modals/SavingModal';
import SavingsFundModal from './modals/SavingsFundModal';

function Savings() {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    id: null,
    title: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: new Date().toISOString().substring(0, 10)
  });
  const [loading, setLoading] = useState(false);
  const [savingGoals, setSavingGoals] = useState([]);
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    idToDelete: null
  });

  const [selectedGoal, setSelectedGoal] = useState(null);

  const fetchSavingGoals = async () => {
    try{
      setLoading(true);
      const res = await api.get('/api/finance/savings');
      setSavingGoals(res.data || []);
    }catch(error){
      console.error("Failed to load saving goals: ", error);
      toast.error("Failed to load saving goals");
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSavingGoals();
  }, []);

  const formatCurrency = (value) => {
    return "$" + parseFloat(value).toFixed(2);
  };

  const [fundTypeToOpen, setFundTypeToOpen] = useState('deposit');

  const openFundModal = (goal, type) => {
    setSelectedGoal(goal);
    setFundTypeToOpen(type);
    setIsFundModalOpen(true);
  }

  const triggerDelete = (id) => {
    setAlert({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Saving Goal',
      message: 'Are you sure you want to delete this saving?',
      idToDelete: id
    });
  }

  const confirmDelete = async () => {
    const id = alert.idToDelete;
    try{
      await api.delete(`/api/finance/savings/${id}`);

      setAlert({
        isOpen: true,
        type: 'success',
        title: 'Deleted',
        message: 'Saving deleted successfully',
        idToDelete: null
      });

      fetchSavingGoals();
    }catch (error){
      console.log("Delete error: ", error);

      setAlert({
        isOpen: true,
        type: 'danger',
        title: 'Error',
        message: 'Failed to delete saving goal.',
        idToDelete: null
      })
    }
  }

  return (
    <div className='view-panel active'>
      <header className='header' style={{borderBottom: 'none', paddingBottom: 0, marginBottom: '2rem'}}>
        <div className='page-title'>
          <h1 style={{fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)'}}>Savings Goals</h1>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem'}}>
            Create savings targets and track your accumulation progress.
          </p>
        </div>
        <div className='header-actions'>
          <button className='btn btn-primary' style={{display: 'flex', alignItems: 'center', gap: '8px'}} onClick={() => setIsTransactionModalOpen(true)}>
            <span style={{fontSize: '1.2rem', lineHeight: 1}}>+</span>Add Transaction
          </button>
        </div>
      </header>

      <div className='savings-header'>
        <h2>Saving Trackers</h2>
        <button className='btn btn-secondary'
          onClick={() => setIsGoalModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '20px', padding: '0.5rem 1.2rem' }}>
            <PlusCircle size={16}/>Create Saving Goals
        </button>
      </div>
      {loading ? (
        <div className='loading-overlay-chill'>
          <div className='spinner'></div>
        </div>
      ) : (
        <div className='savings-grid' id='savings-grid-container'>
          {savingGoals.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
              <p>No savings goals created.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                  Click "Create Savings Goal" to start saving.
              </p>
            </div>
          ) : (
            savingGoals.map(item => {
                let percent = 0;
                if (item.targetAmount > 0) {
                    percent = (item.currentAmount / item.targetAmount) * 100;
                }
                const progressFillWidth = Math.min(percent, 100);
                const percentStr = percent.toFixed(0) + '%';
                
                const dateObj = new Date(item.targetDate);
                const dateStr = dateObj.toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                });
                return (
                    <div key={item.id} className="glass-card goal-card">
                        <div className="goal-progress-percentage">{percentStr}</div>
                        <div className="goal-info">
                            <h4>{item.title}</h4>
                            <span className="goal-date">
                                <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> 
                                Target: {dateStr}
                            </span>
                        </div>
                        <div>
                            <div className="progress-bar-container">
                                <div className="progress-fill progress-green" style={{ width: `${progressFillWidth}%` }}></div>
                            </div>
                            <div className="goal-progress-details">
                                <span className="goal-current-amount">{formatCurrency(item.currentAmount)}</span>
                                <span className="goal-target-amount">of {formatCurrency(item.targetAmount)}</span>
                            </div>
                        </div>
                        <div className="goal-actions">
                            <button className="btn btn-secondary deposit-btn" title="Add savings" onClick={() => openFundModal(item, 'deposit')}>
                                <Plus size={14} style={{ display: 'inline', marginRight: '2px', marginBottom: '-2px'}} /> Save
                            </button>
                            <button className="btn btn-secondary-outline withdraw-btn" title="Withdraw savings" onClick={() => openFundModal(item, 'withdraw')}>
                                <Minus size={14} style={{ display: 'inline', marginRight: '2px', marginBottom: '-2px'}} /> Use
                            </button>
                            <button className="btn-icon delete-btn" title="Delete Goal" onClick={() => triggerDelete(item.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })
          )}
        </div>
      )}
      

      <TransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={() => fetchSavingGoals()}
        initialData={null}/>
      
      <SavingModal 
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSuccess={() => fetchSavingGoals()}
        initialData={null}/>
      
      <SavingsFundModal 
        isOpen={isFundModalOpen} 
        onClose={() => setIsFundModalOpen(false)} 
        onSuccess={() => fetchSavingGoals()}
        goal={selectedGoal}
        initialFundType={fundTypeToOpen}
      />

      <AlertModal 
        isOpen={alert.isOpen}
        type={alert.type}
        message={alert.message}
        onConfirm={alert.type === 'confirm' ? confirmDelete : () => setAlert({...alert, isOpen: false})}
        onCancel={() => setAlert({...alert, isOpen: false})}/>
    </div>
  );
}

export default Savings;
