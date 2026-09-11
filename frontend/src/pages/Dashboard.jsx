import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Scale, ArrowUpRight, ArrowDownRight, Trash2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import '../css/dashboard.css';
import TransactionModal from './modals/TransactionModal';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import AlertModal from '../components/AlertModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DONUT_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'
];

function Dashboard() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [cashflowData, setCashflowData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [inactiveCategories, setInactiveCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // Lấy tháng (1-12) và năm hiện tại làm mặc định
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // State quản lý bộ lọc cho Pie Chart
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // State lưu danh sách tất cả giao dịch để lọc lại khi người dùng đổi tháng/năm
    const [allTransactions, setAllTransactions] = useState([]);

    // State alert
    const [alert, setAlert] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        idToDelete: null
    })

    const fetchDashboardData = async () => {
        try {
            const [summaryRes, recentRes, allTransRes] = await Promise.all([
                api.get('/api/finance/summary'),
                api.get('/api/finance/transactions/recent'),
                api.get('/api/finance/transactions?pagesize=1000')
            ]);

            setSummary(summaryRes.data);
            setRecentTransactions(recentRes.data);

            const transList = allTransRes.data.data || [];
            setAllTransactions(transList);

            // Process chart data
            processChartsData(allTransRes.data.data);
            updateCategoryChartData(transList, currentMonth, currentYear);
        }catch (error){
            console.error("Error loading dashboard data: ", error);
            toast.error("Failed to load financial overview");
        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const processChartsData = (transactions) => {
        // if(!transactions || transactions.length === 0) return;

        // ------ A. CASH FLOW CHART (LAST 6 MONTHS) ------
        const monthlyDataMap = {};
        for(let i = 5; i >= 0; i--){
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toISOString().substring(0, 7);
            const monthLabel = d.toLocaleDateString('en-US', {month:'short'});

            monthlyDataMap[key] = {month: monthLabel, Income: 0, Expense: 0};
        };

        // Chỉ lặp qua giao dịch để cộng dồn nếu danh sách giao dịch không rỗng
        if (transactions && transactions.length > 0) {
            transactions.forEach(t => {
                const key = t.date.substring(0, 7); // Lấy YYYY-MM
                if (monthlyDataMap[key]) {
                    if (t.type === 'income') {
                        monthlyDataMap[key].Income += t.amount;
                    } else {
                        monthlyDataMap[key].Expense += t.amount;
                    }
                }
            });
        }
        setCashflowData(Object.values(monthlyDataMap));
        // --- B. BIỂU ĐỒ TRÒN (CHI TIÊU THEO CATEGORY) ---
        const expensesMap = {};
        if (transactions && transactions.length > 0) {
            transactions.forEach(t => {
                if (t.type === 'expense') {
                    expensesMap[t.category] = (expensesMap[t.category] || 0) + t.amount;
                }
            });
        }
        const formattedCategories = Object.keys(expensesMap)
            .map(name => ({ name, value: expensesMap[name] }))
            .filter(item => item.value > 0);
        setCategoryData(formattedCategories);
    }

    const updateCategoryChartData = (transactionsList, month, year) => {
        const expensesMap = {};

        if(transactionsList && transactionsList.length > 0){
            transactionsList.forEach(t => {
                const tDate = new Date(t.date);
                const tMonth = tDate.getMonth() + 1;
                const tYear = tDate.getFullYear();

                // Nếu chọn 'all', bỏ qua điều kiện tMonth
                const isMonthMatch = month === 'all' || tMonth === Number(month);
                const isYearMatch = tYear === Number(year);

                if(t.type === 'expense' && isMonthMatch && isYearMatch){
                    expensesMap[t.category] = (expensesMap[t.category] || 0) + t.amount;
                }
            });
        }

        const formattedCategories = Object.keys(expensesMap)
            .map(name => ({name, value: expensesMap[name]}))
            .filter(item => item.value > 0);
        
        setCategoryData(formattedCategories);
    };

    // Khi đổi Tháng hoặc Năm trên giao diện
    const handleFilterChange = (newMonth, newYear) => {
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
        updateCategoryChartData(allTransactions, newMonth, newYear);
    };

    // Khi bấm nút Reset -> đưa về Tháng/Năm hiện tại
    const handleResetFilter = () => {
        const nowM = new Date().getMonth() + 1;
        const nowY = new Date().getFullYear();
        setSelectedMonth(nowM);
        setSelectedYear(nowY);
        updateCategoryChartData(allTransactions, nowM, nowY);
    };

    const triggerDelete = (id) => {
        setAlert({
            isOpen: true,
            type: 'confirm',
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this transaction?',
            idToDelete: id
        })
    }

    const confirmDelete = async() =>{
        const id = alert.idToDelete;
        try{
            await api.delete(`/api/finance/transactions/${id}`);
            setAlert({
                isOpen: true,
                type: 'success',
                title: 'Deleted',
                messaage: 'Transaction deleted successfully!',
                idToDelete: null
            });
            fetchDashboardData();

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


    // if (!summary) {
    //     return (
    //         <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>
    //             No data found. Please log in first!
    //         </div>
    //     );
    // }

    const formatNumber = (num) => {
        const val = parseFloat(num) || 0;
        return val.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatNetBalance = (num) => {
        const val = parseFloat(num) || 0;
        const formatted = Math.abs(val).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return val < 0 ? `-$${formatted}` : `$${formatted}`;
    };

    return (
        <div className="dashboard-container">
            <header className="header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '2.5rem' }}>
                <div className="page-title">
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>Welcome back! Check your financial summary.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsTransactionModalOpen(true)}>
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Add Transaction
                    </button>
                </div>
            </header>
            
            <section className="summary-grid">
                {/* Card 1: Net Balance */}
                <div className="glass-card summary-card card-balance">
                    <div className="icon-wrapper">
                        <Scale size={24} />
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Net Balance</h3>
                        <p className="card-amount">{formatNetBalance(summary?.balance)}</p>
                    </div>
                </div>

                {/* Card 2: Total Income */}
                <div className="glass-card summary-card card-income">
                    <div className="icon-wrapper">
                        <ArrowUpRight size={24} />
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Total Income</h3>
                        <p className="card-amount">
                        ${formatNumber(summary?.income)}
                        </p>
                    </div>
                </div>

                {/* Card 3: Total Expense */}
                <div className="glass-card summary-card card-expense">
                    <div className="icon-wrapper">
                        <ArrowDownRight size={24} />
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Total Expense</h3>
                        <p className="card-amount">
                        ${formatNumber(summary?.expense)}
                        </p>
                    </div>
                </div>
            </section>
                 
            {/* B. CHARTS SECTION */}
            <section className='charts-section'>
                {/* Cash flow chart for cashflow */}
                <div className='glass-card chart-container-card'>
                    <h3>Monthly Cash Flow</h3>
                    <div className='chart-wrapper'>
                        <Bar 
                            data={{
                                labels: cashflowData.map(d => d.month),
                                datasets: [
                                    {
                                        label: 'Income',
                                        data: cashflowData.map(d => d.Income),
                                        backgroundColor: 'rgba(16, 185, 129, 0.75)',
                                        borderRadius: 6,
                                    },
                                    {
                                        label: 'Expense',
                                        data: cashflowData.map(d => d.Expense),
                                        backgroundColor: 'rgba(239, 68, 68, 0.75)',
                                        borderRadius: 6,
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        labels: { color: '#9ca3af', font: { family: 'Outfit', size: 12 } }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => `${context.dataset.label}: $${context.raw.toLocaleString()}`
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                                        ticks: { color: '#9ca3af', font: { family: 'Outfit', size: 12 } }
                                    },
                                    y: {
                                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                                        ticks: { 
                                            color: '#9ca3af', 
                                            font: { family: 'Outfit', size: 12 },
                                            callback: (value) => value.toLocaleString()
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Pie chart for expense analysis */}
                <div className='glass-card chart-container-card'>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem'}}>
                        <h3>Expenses by Category</h3>

                        {/* Khung chứa các ô chọn lọc */}
                        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                            {/* Chọn tháng */}
                            <select value={selectedMonth}
                                onChange={(e) => handleFilterChange(e.target.value, selectedYear)}
                                style={{background: '#161929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem'}}>
                                <option value="all">All Months</option>
                                {Array.from({length: 12}, (_,i) => {
                                    const monthName = new Date(2000, i, 1).toLocaleString('en-US', { month: 'short' });
                                    return (
                                        <option key={i + 1} value={i + 1}>{monthName}</option>
                                    );
                                })}
                            </select>

                            {/* Chọn Năm */}
                            <select 
                                value={selectedYear} 
                                onChange={(e) => handleFilterChange(selectedMonth, e.target.value)}
                                style={{ background: '#161929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            {/* Nút Reset */}
                            <button 
                                onClick={handleResetFilter}
                                style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                                Reset
                            </button>
                        </div>
                    </div>
                    <div className='chart-wrapper'>
                        {categoryData.length === 0 ? (
                            <Doughnut
                                data={{
                                    labels: ['No Expense Data'],
                                    datasets: [{ data: [1], backgroundColor: ['rgba(156, 163, 175, 0.2)'] }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { 
                                            position: 'right', 
                                            labels: { color: '#9ca3af', font: { family: 'Outfit', size: 13 } } 
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <Doughnut
                                data={{
                                    labels: categoryData.map(c => c.name),
                                    datasets: [{
                                        data: categoryData.map(c => c.value),
                                        backgroundColor: DONUT_COLORS.slice(0, categoryData.length),
                                        borderWidth: 0
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { 
                                            position: 'right', 
                                            labels: { 
                                                color: '#9ca3af', 
                                                font: { family: 'Outfit', size: 13 },
                                                usePointStyle: false,
                                                boxWidth: 14,
                                                padding: 14
                                            } 
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => ` $${context.raw.toLocaleString()}`
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* C. RECENT TRANSACTIONS */}
            <section className="recent-transactions-section glass-card">
                <div className="section-header">
                    <h3>Recent Transactions</h3>
                    <Link to="/transactions" className="btn-text">
                        View All <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                    </Link>
                </div>
                <div className="table-container">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No transactions recorded. Go to Transactions page to start.
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((t) => {
                                    const dateStr = new Date(t.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    });
                                    const isIncome = t.type === 'income';
                                    return (
                                        <tr key={t.id}>
                                            <td>{t.description}</td>
                                            <td>
                                                <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>{t.category}</span>
                                            </td>
                                            <td>{dateStr}</td>
                                            <td className={isIncome ? 'amount-income' : 'amount-expense'}>
                                                {isIncome ? '+' : '-'}${formatNumber(t.amount)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    className="btn-icon delete-btn" 
                                                    title="Delete" 
                                                    onClick={() => triggerDelete(t.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            {isTransactionModalOpen && (
                <TransactionModal 
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    onSuccess={fetchDashboardData}
                    initialData={null}
                />
            )}
            <AlertModal 
                isOpen={alert.isOpen}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onConfirm={alert.type === 'confirm' ? confirmDelete : () => setAlert({...alert, isOpen: false})}
                onCancel={() => setAlert({...alert, isOpen: false})}
            />
        </div>
    );
}

export default Dashboard;