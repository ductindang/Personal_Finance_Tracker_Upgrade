import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import {Search, RotateCcw, ChevronLeft, ChevronRight, Edit2, Trash2, Plus, X} from 'lucide-react';
import toast from 'react-hot-toast';
import '../css/transactions.css';
import TransactionModal from '../pages/modals/TransactionModal.jsx';
import AlertModal from '../components/AlertModal.jsx';

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
    // const [modalMode, setModalMode] = useState('add'); // add or edit
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [modalData, setModalData] = useState(null);

    // State cho alert popup
    const [alert, setAlert] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        idToDelete: null
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
            const queryUrl = `/api/finance/transactions?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&type=${filterType}&category=${encodeURIComponent(filterCategory)}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
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

    const triggerDelete = (id) => {
        setAlert({
            isOpen: true,
            type: 'confirm',
            title: 'Delete Transaction',
            message: 'Are you sure you want to delete this transaction?',
            idToDelete: id
        })
    }

    const confirmDelete = async() => {
        const id = alert.idToDelete;
        try{
            await api.delete(`/api/finance/transactions/${id}`);
            setAlert({
                isOpen: true,
                type: 'success',
                title: 'Deleted',
                message: 'Transaction deleted successfully',
                idToDelete: null
            })

            loadTransactions();
        }catch(error){
            console.error('Delete error: ', error);
            setAlert({
                isOpen: true,
                type: 'danger',
                title: 'Error',
                message: 'Failed to delete transaction.',
                idToDelete: null
            });
        }
    }

    // 7. MỞ MODAL ĐỂ THÊM GIAO DỊCH
    const openAddModal = () => {
        setModalData(null)
        setIsModalOpen(true);
    }

    // 8. MỞ MODAL ĐỂ SỬA GIAO DỊCH (lấy dữ liệu cũ đổ vào form)
    const openEditModal = (t) => {
        const formattedData = { ...t, date: t.date.substring(0, 10) };
        setModalData(formattedData);
        setIsModalOpen(true);
    }

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
                                                    <button className="btn-icon delete-btn" onClick={() => triggerDelete(t.id)} title="Delete">
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
                <TransactionModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={loadTransactions}
                    initialData={modalData}/>
            )}

            <AlertModal 
                isOpen={alert.isOpen}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onConfirm={alert.type === 'confirm' ? confirmDelete : () => setAlert({ ...alert, isOpen: false })}
                onCancel={() => setAlert({...alert, isOpen: false})}/>
        </div>
    );
}

export default Transaction;