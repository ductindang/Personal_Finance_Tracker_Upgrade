import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Scale, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import '../css/dashboard.css'; // Import the separated CSS file from the css directory!

function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/finance/summary')
            .then((response) => {
                setSummary(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching finance summary: ", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading overview...</div>;
    }

    if (!summary) {
        return (
            <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>
                No data found. Please log in first!
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Financial Overview</h2>
            <section className="summary-grid">
                 
                 {/* Card 1: Net Balance */}
                 <div className="glass-card summary-card">
                    <div 
                      className="icon-wrapper" 
                      style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-color)' }}
                    >
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
        </div>
    );
}

export default Dashboard;