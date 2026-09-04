import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

function SavingsFundModal({ isOpen, onClose, onSuccess, goal, initialFundType }) {
    const [amount, setAmount] = useState('');
    const [fundType, setFundType] = useState('deposit');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setFundType(initialFundType || 'deposit');
        }
    }, [isOpen, initialFundType]);

    if (!isOpen || !goal) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Please enter a valid price.");
            return;
        }

        if (fundType === 'withdraw' && amountNum > goal.currentAmount) {
            toast.error("The withdrawal amount must not exceed the current balance..");
            return;
        }

        try {
            await api.post(`/api/finance/savings/fund?id=${goal.id}&amount=${amountNum}&type=${fundType}`);
            toast.success(fundType === 'deposit' ? "Added savings to goal!" : "Withdrawn savings from goal.");
            onSuccess();
            onClose();
        } catch (error) {
            // 1. Lấy thông báo lỗi từ Backend trả về (nếu có), nếu không có mới lấy error.message
            const serverMessage = error.response?.data?.message || error.message;
            // 2. Ghép vào thông báo Toast
            const actionText = fundType === 'deposit' ? "Failed to add savings" : "Failed to withdraw savings";
            
            toast.error(`${actionText}: ${serverMessage}`);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h2>{fundType === 'deposit' ? 'Save Money' : 'Withdraw Money'}</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <p id="goal-fund-subtitle" style={{color: 'var(--text-secondary)'}}>
                            {fundType === 'deposit' 
                                ? `Transfer spendable funds into "${goal.title}".` 
                                : `Release funds from "${goal.title}" back into Net Balance.`}
                        </p>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Amount</label>
                        <div className="input-prefix-wrapper">
                            <span className="currency-prefix modal-currency-prefix">$</span>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary-outline" onClick={onClose}>Cancel</button>
                        <button 
                            type="submit" 
                            className={`btn ${fundType === 'deposit' ? 'btn-primary' : 'btn-danger'}`}
                        >
                            {fundType === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SavingsFundModal;