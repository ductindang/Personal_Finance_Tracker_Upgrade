import React, { useState, useEffect } from 'react';
import {useNavigate, Link} from 'react-router-dom';
import api from '../services/api';
import { Scale, ArrowUpRight, ArrowDownRight, Trash2, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import '../css/dashboard.css';

const DONUT_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

function Dashboard() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [cashflowData, setCashflowData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, recentRes, allTransRes] = await Promise.all([
                    api.get('/api/finance/summary'),
                    api.get('/api/finance/transactions/recent'),
                    api.get('/api/finance/transactions?pagesize=1000')
                ]);

                setSummary(summaryRes.data);
                setRecentTransactions(recentRes.data);

                // Process chart data
                processChartsData(allTransRes.data.data);
            }catch (error){
                console.error("Error loading dashboard data: ", error);
                toast.error("Failed to load financial overview");
            }finally {
                setLoading(false);
            }
        }

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

        // Function for quickly deleting transactions
        const handleDeleteTransaction = async (id) => {
            if(!window.confirm("Are you sure you want to delete this transactions?")) return;

            try{
                await api.delete(`/api/finance/transactions/${id}`);
                toast.success("Transaction deleted successfully");

                // load data after delete
                const [summaryRes, recentRes, allTransRes] = await Promise.all([
                    api.get('/api/finance/summary'),
                    api.get('/api/finance/transacction/recent'),
                    api.get('/api/finance/transactions?pageSize=1000')
                ]);
                setSummary(summaryRes.data);
                setRecentTransactions(recentRes.data);
                processChartsData(allTransRes.data.data);
            }catch (error){
                console.error("Failed to delete transaction: ", error);
                toast.error("Failed to delete transaction");
            }
        }

    }

    // if (!summary) {
    //     return (
    //         <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>
    //             No data found. Please log in first!
    //         </div>
    //     );
    // }

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Financial Overview</h2>
            <section className="summary-grid">
                {/* Card 1: Net Balance */}
                <div className="glass-card summary-card">
                    <div className="icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-color)' }}>
                        <Scale size={24} />
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Net Balance</h3>
                        <p className="card-amount">${(summary?.balance ?? 0).toFixed(2)}</p>
                    </div>
                </div>

                {/* Card 2: Total Income */}
                <div className="glass-card summary-card">
                    <div 
                    className="icon-wrapper" 
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-income)' }}
                    >
                        <ArrowUpRight size={24} />
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Total Income</h3>
                        <p className="card-amount" style={{ color: 'var(--color-income)' }}>
                        +${(summary?.income ?? 0).toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Card 3: Total Expense */}
                <div className="glass-card summary-card">
                    <div 
                    className="icon-wrapper" 
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-expense)' }}
                    >
                        <ArrowDownRight size={24} />
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Total Expense</h3>
                        <p className="card-amount" style={{ color: 'var(--color-expense)' }}>
                        -${(summary?.expense ?? 0).toFixed(2)}
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
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cashflowData} margin={{top:10, right: 10, left: -20, bottom: 0}}>
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                <XAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                                <tooltip contentStyle={{background: '#161929', border:'1px solid rgba(255,255,255,0.08', borderRadius: '8px', color:'#fff'}}/>
                                <legend wrapperStyle={{fontSize: '12px', marginTop:'10px'}}/>
                                <Bar dataKey="Income" fill="#10b981" radius={[4,4,0,0]}/>
                                <Bar dataKey="Expense" fill='#ef4444' radius={[4,4,0,0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie chart for expense analysis */}
                <div className='glass-card chart-container-card'>
                    <h3>Expenses by Category</h3>
                    <div className='chart-wrapper'>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData.length > 0 ? categoryData : [{name: 'No Data', value: 1}]}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                >
                                    {categoryData.length > 0 ? (
                                        categoryData.map((entry, index) => (
                                            <Cell key={`cell=${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                        ))
                                    ) : (
                                        <Cell fill="rgba(156,163,175,0.2)" />
                                    )}
                                </Pie>

                                <Tooltip contentStyle={{background: '#161929', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff'}}/>
                                <Legend layout='vertical' align="right" verticalAlign="middle" wrapperStyle={{fontSize: '12px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
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
                                                {isIncome ? '+' : '-'}${t.amount.toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    className="btn-icon delete-btn" 
                                                    title="Delete" 
                                                    onClick={() => handleDeleteTransaction(t.id)}
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
                
        </div>
    );
}

export default Dashboard;