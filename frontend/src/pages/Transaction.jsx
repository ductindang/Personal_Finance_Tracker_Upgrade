import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import {Search, RotateCcw, ChevronLeft, ChevronRight, Edit2, Trash2, Plus, X} from 'lucide-react';
import toast from 'react-hot-toast';
import '../css/transactions.css';

function Transaction(){
    // 1. STATE QUẢN LÝ DANH SÁCH VÀ PHÂN TRANG
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 8; // số bản ghi trên mỗi trang

    // 2. STATE CHO BỘ LỌC (FILTERS)
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [categories, setCategories] = useState([]);

    // 3. STATE CHO MODAL THÊM / SỬA
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // add or edit
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [modalData, setModalData] = useState ({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().substring(0, 10) // Mặc định ngày hôm nay
    });

    // 4. LOAD DANH MỤC (CATEGORIES) ĐỂ FILL VÀO SELECCT OPTIONS
    useEffect(() => {
        api.get('/api/finance/categories').then(res => {
            setCategories(res.data);
        }).catch(err => console.error("Error loading categories: ", err));
    }, []);

    // 5. HÀM TẢI DANH SÁCH GIAO DỊCH (có áp dụng bộ lọc và phân trang)
    const loadTransactions = useCallback(async () => {
        try{
            const queryUrl = `/api/finance/transactions?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&type=${filterType}&category=${filterCategory}&dateFrom${dateFrom}&dateTo${dateTo}`;
            const response = await api.get(queryUrl);
            setTransactions(response.data.data);
            setTotal(response.data.total);
        }catch(error){
            console.error("Failed to load transactions: ", error);
            toast.error("Failed to load transactions.");
        }finally{
            setLoading(false);
        }
    }, [page, search, filterType, filterCategory, dateFrom, dateTo]);

    // Gọi lại hàm load dữ liệu khi trang thay đổi hoặc bộ lọc thay đổi
    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    // Debounce tìm kiếm (chờ người dùng gõ xong 400ms mới gọi api)
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setPage(1); // reset về trang 1 khi tìm kiếm
            loadTransactions();
        }, 400);
        
        return () => clearTimeout(delayDebounce);
    }, [search]);

    // reset bộ lọc về mặc định
    const handleResetFilters = () => {
        setSearch('');
        setFilterType('all');
        setFilterCategory('all');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    }

    // 6. XỬ LÝ XÓA GIAO DỊCH
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;

        try{
            await api.delete(`/api/finance/transactions/${id}`);
            toast.success("Transaction deleted successfully");
            loadTransactions();
        }catch(error){
            console.error("Delete error: ", error);
            toast.error("Failed to delete transaction");
        }
    }

    // 7. MỞ MODAL ĐỂ THÊM GIAO DỊCH
    const openAddModal = () => {
        setModalMode('add');
        setSelectedTransactionId(null);
        setModalData({
            description: '',
            amount: '',
            type: 'expense',
            category: categories.find(c => c.type === 'expense')?.name || '',
            date: new Date().toISOString().substring(0, 10)
        })
        setIsModalOpen(true);
    }

    // 8. MỞ MODAL ĐỂ SỬA GIAO DỊCH (lấy dữ liệu cũ đổ vào form)
    const openEditModal = (t) => {
        setModalMode('edit');
        setSelectedTransactionId(t.id);
        setModalData({
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.category,
            date: t.date.substring(0, 10)
        });
        setIsModalOpen(true);
    }

    // Thay đổi trường dữ liệu trong Modal Form
    const handleModalChange = (e) => {
        const {name, value} = e.target;

        setModalData(prev => {
            const updated = {...prev, [name]: value};

             // Nếu người dùng đổi loại (Type) từ Thu Nhập sang Chi Phí, tự động reset Category tương ứng
            if(name === 'type'){
                const firstMatchingCat = categories.find(c => c.type === value)?.name || '';
                updated.category = firstMatchingCat;
            }
            return updated;
        });
    };

    // Gửi form Thêm / Sửa lên backend
    const handleModalSubmit = async (e) => {
        e.preventDefault();

        // Validate dữ liệu cơ bản
        const amountNum = parseFloat(modalData.amount);
        if(isNaN(amountNum) || amountNum <= 0){
            toast.error("Amount must be a valid positive number");
            return;
        }

        const payload = {
            id: selectedTransactionId || 0,
            description: modalData.description,
            amount: amountNum,
            type: modalData.type,
            category: modalData.category,
            date: new Date(modalData.date).toISOString()
        };

        try {
            await api.post('/api/finance/transactions', payload);
            toast.success(modalMode === 'add' ? "Transaction added successfully" : "Transaction updated successfully");
            setIsModalOpen(false);
            loadTransactions();
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save transaction.");
        }
    };

    // Phân tách danh mục theo loại để hiển thị động trong dropdown Modal
    const filteredCategories = categories.filter(c => c.type === modalData.type);

    // Tính toán số hiển thị phân trang
    const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIdx = Math.min(startIdx + transactions.length - 1, total);
    const totalPages = Math.ceil(total / pageSize);
    
    return (
        <div className="dashboard-container">
            <div className="section-header">
                <h2 className="dashboard-title">Transactions Manager</h2>
                <button className="submit-btn" style={{ width: 'auto', marginTop: 0, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openAddModal}>
                    <Plus size={18} /> Add Transaction
                </button>
            </div>
            <section className="glass-card">
                {/* A. BỘ LỌC (FILTERS TOOLBAR) */}
                <div className="filters-toolbar">
                    <div className="filter-group search-bar">
                        <label>Search</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} />
                            <input 
                                type="text" 
                                placeholder="Search description..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Type</label>
                        <select value={filterType} onChange={(e) => { setPage(1); setFilterType(e.target.value); }}>
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Category</label>
                        <select value={filterCategory} onChange={(e) => { setPage(1); setFilterCategory(e.target.value); }}>
                            <option value="all">All Categories</option>
                            {[...new Set(categories.map(c => c.name))].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>From</label>
                        <input type="date" value={dateFrom} onChange={(e) => { setPage(1); setDateFrom(e.target.value); }} />
                    </div>
                    <div className="filter-group">
                        <label>To</label>
                        <input type="date" value={dateTo} onChange={(e) => { setPage(1); setDateTo(e.target.value); }} />
                    </div>
                    <button className="btn-icon" style={{ height: '42px', width: '42px', borderRadius: '8px', border: '1px solid var(--input-border)', background: 'var(--input-bg)' }} onClick={handleResetFilters} title="Reset all filters">
                        <RotateCcw size={18} />
                    </button>
                </div>
                {/* B. BẢNG DANH SÁCH GIAO DỊCH */}
                <div className="table-container">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                        No matching transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => {
                                    const dateStr = new Date(t.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    });
                                    const isIncome = t.type?.toLowerCase() === 'income';
                                    return (
                                        <tr key={t.id}>
                                            <td>{t.description}</td>
                                            <td>
                                                <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>{t.category}</span>
                                            </td>
                                            <td>{dateStr}</td>
                                            <td className={isIncome ? 'amount-income' : 'amount-expense'}>
                                                {isIncome ? '+' : '-'}${t.amount.toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div className="row-actions" style={{ justifyContent: 'center' }}>
                                                    <button className="btn-icon edit-btn" onClick={() => openEditModal(t)} title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="btn-icon delete-btn" onClick={() => handleDelete(t.id)} title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {/* C. PHÂN TRANG (PAGINATION) */}
                <div className="pagination-container">
                    <div className="pagination-info">
                        Showing <span>{startIdx}</span>-<span>{endIdx}</span> of <span>{total}</span> transactions
                    </div>
                    <div className="pagination-buttons">
                        <button 
                            className="btn-nav btn-icon" 
                            disabled={page <= 1} 
                            onClick={() => setPage(prev => prev - 1)}
                            style={{ border: '1px solid var(--glass-border)' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span id="page-num">{page}</span>
                        <button 
                            className="btn-nav btn-icon" 
                            disabled={page >= totalPages || total === 0} 
                            onClick={() => setPage(prev => prev + 1)}
                            style={{ border: '1px solid var(--glass-border)' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </section>
            {/* D. DIALOG MODAL POPUP THÊM / SỬA GIAO DỊCH */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card glass-card">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add New Transaction' : 'Edit Transaction'}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleModalSubmit} className="modal-form">
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label>Transaction Type</label>
                                <div className="toggle-switch-wrapper">
                                    <button
                                        type="button"
                                        className={`toggle-btn ${modalData.type === 'expense' ? 'active-expense' : ''}`}
                                        onClick={() => handleModalChange({ target: { name: 'type', value: 'expense' } })}
                                    >
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        className={`toggle-btn ${modalData.type === 'income' ? 'active-income' : ''}`}
                                        onClick={() => handleModalChange({ target: { name: 'type', value: 'income' } })}
                                    >
                                        Income
                                    </button>
                                </div>
                            </div>
                            
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label>Amount</label>
                                <div className="input-prefix-wrapper">
                                    <span className="currency-prefix modal-currency-prefix">$</span>
                                    <input 
                                        type="number" 
                                        name="amount" 
                                        step="0.01" 
                                        placeholder="0.00" 
                                        value={modalData.amount}
                                        onChange={handleModalChange}
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row" style={{ marginTop: '15px' }}>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select 
                                        name="category" 
                                        value={modalData.category} 
                                        onChange={handleModalChange}
                                        required
                                    >
                                        {filteredCategories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input 
                                        type="date" 
                                        name="date" 
                                        value={modalData.date}
                                        onChange={handleModalChange}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label>Description</label>
                                <input 
                                    type="text" 
                                    name="description" 
                                    placeholder="e.g., Grocery Shopping" 
                                    value={modalData.description}
                                    onChange={handleModalChange}
                                    required 
                                />
                            </div>
                            
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary-outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transaction;