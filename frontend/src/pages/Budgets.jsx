import React, {useState, useEffect} from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {PlusCircle, MinusCircle, Trash2, Info, X, PiggyBank} from 'lucide-react';
import '../css/budgets.css';
import TransactionModal from './modals/TransactionModal';

function Budgets() {
  // Lấy tháng hiện tại định dạng YYYY-MM (ví dụ: 2026-08)
  const currentMonthISO = new Date().toISOString().substring(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthISO);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    id: null,
    category: '',
    limitAmount: '',
    month: currentMonthISO
  });

  // fetch ngân sách theo tháng
  const fetchBudgets = async (month) => {
    try{
      setLoading(true);
      const response = await api.get(`/api/finance/budgets?month=${month}`);
      setBudgets(response.data || []);
      
    }catch(error){
      console.log("Failed to load budgets limits: ", error);
      toast.error("Failed to load budgets limits")
    }finally{
      setLoading(false);
    }
  }

  // fetch danh mục chi tiêu (expense) để đưa vào dropdown của modal
  const fetchExpenseCategories = async () => {
    try{
      setLoading(true);
      const res = await api.get('/api/finance/categories');
      const expenseCats = (res.data || [])
        .filter((c) => c.type === 'expense')
        .map((c) => c.name);
      setCategories(expenseCats);
    }catch(error){
      toast.error("Failed to load categories: ", error);
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBudgets(selectedMonth);
    fetchExpenseCategories();
  }, [selectedMonth])

  // Add budget limit
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const limitNum = parseFloat(modalData.limitAmount);
    if(isNaN(limitNum) || limitNum <= 0){
      toast.error("Please enter a valid limit amount.");
      return;
    }

    const payload = {
      category: modalData.category || categories[0],
      limitAmount: limitNum,
      month: modalData.month
    };

    try{
      await api.post('/api/finance/budgets', payload);
      toast.success('Budget limit updated successfully!');
      setIsModalOpen(false);
      fetchBudgets(selectedMonth);
    }catch(error){
      console.error("Save error: ", error);
      toast.error("Failed to save budget limit.");
    }
  };

  // Delete budget limit
  const handleDeleteBudget = async (id) => {
    if(!window.confirm("Are you sure you want to delete this Budget")) return;

    try{
      await api.delete(`/api/finance/budgets/${id}`);
      toast.success("Budget deleted successfully");
      fetchBudgets(selectedMonth);
    }catch(error){
      console.error("Delete error: ", error);
      toast.error("Failed to delete budget");
    }
  }

  return (
    <div className='budgets-container'>
      {/* Top header bar */}
      <header className='header' style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '2rem' }}>
        <div className='page-title'>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Budgets</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Set monthly spending limits for expense categories.
          </p>
        </div>
        <div className='header-actions'>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsTransactionModalOpen(true)}>
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>Add Transaction
          </button>
        </div>
      </header>

      {/* 2. Control Bar: Budget Month & Set Category Budget */}
      <div className='budgets-header'>
        <div className='month-selector-wrapper'>
          <label className='budget-month-select'>Budget Month:</label>
          <input type='month'
            id="budget-month-select"
            className="month-input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}/>
        </div>
        <button className="btn btn-secondary"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '20px', padding: '0.5rem 1.2rem' }}>
            <PlusCircle size={16}/>Set Category Budget
        </button>
      </div>
      {loading ? (
        <div className='loading-overlay-chill'>
          <div className='spinner'></div>
        </div>
      ) : budgets.length === 0 ? (
        // Trạng thái chưa có ngân sách
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '5rem 1rem' }}>
          <PiggyBank size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            No budget limits configured for this month.
          </p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
            Click "Set Category Budget" to start planning.
          </p>
        </div>
      ) : (
        /* Danh sách các thẻ ngân sách */
        <div className="budget-grid">
          {budgets.map((b) => {
            const spent = b.spent || 0;
            const limit = b.limitAmount || 0;
            const percent = (spent / limit) * 100;
            const percentStr = `${percent.toFixed(0)}%`;
            const progressFillWidth = Math.min(percent, 100);

            // Cấu hình màu sắc theo chi tiêu
            let progressClass = 'progress-green';
            let statusLabel = 'Within Budget';
            let textClass = 'text-green';

            if (percent >= 100) {
              progressClass = 'progress-red';
              statusLabel = 'Exceeded Limit';
              textClass = 'text-red';
            } else if (percent >= 70) {
              progressClass = 'progress-orange';
              statusLabel = 'Approaching Limit';
              textClass = 'text-orange';
            }
            return (
              <div key={b.id} className="glass-card budget-card">
                <div className="budget-card-header">
                  <div className="budget-card-title">
                    <h4>{b.category}</h4>
                    <span className={`budget-warning-text ${textClass}`}>
                      <Info size={14} /> {statusLabel} ({percentStr})
                    </span>
                  </div>
                  <button
                    className="btn-icon delete-btn"
                    title="Delete Budget limit"
                    onClick={() => handleDeleteBudget(b.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div>
                  <div className="progress-bar-container">
                    <div className={`progress-fill ${progressClass}`} style={{ width: `${progressFillWidth}%` }}></div>
                  </div>
                  <div className="budget-amounts">
                    <span className="budget-spent">${spent.toLocaleString()}</span>
                    <span className="budget-limit">of ${limit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-card'>
            <div className='modal-header'>
              <h3>Set Category Budget</h3>
              <button className='btn-close' onClick={() => setIsModalOpen(false)}>
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className='modal-form'>
              <div className='form-group' style={{marginTop: '15px'}}>
                <label>Category</label>
                <select name='category'
                  value={modalData.category || categories[0]}
                  onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
                  required>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
              </div>
              <div className='form-group'>
                <label>Monthly limit</label>
                <div className="input-prefix-wrapper">
                  <span className="currency-prefix">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={modalData.limitAmount}
                    onChange={(e) => setModalData({ ...modalData, limitAmount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Target Month</label>
                <input
                  type="month"
                  value={modalData.month}
                  onChange={(e) => setModalData({ ...modalData, month: e.target.value })}
                  required
                />
              </div>
              <div className='modal-actions'>
                <button type="button" className="btn btn-secondary-outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    Save Budget
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}

      {isTransactionModalOpen && (
        <TransactionModal 
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    onSuccess={() => {
                      fetchBugets(selectedMonth);
                      fetchExpenseCategories();}}
                    initialData={null}/>
      )}
    </div>
  );
}

export default Budgets;
