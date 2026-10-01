import React, {useState, useEffect} from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {X} from 'lucide-react';


function RecurringModal({isOpen, onClose, onSuccess, initialData}){
    const [categories, setCategories] = useState([]);

    // State quản lý dữ liệu form
    const [modalData, setModalData] = useState({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        frequency: 'Daily',
        startDate: new Date().toISOString().substring(0, 10),
        executionTime: '00:00',
        endDate: '',
        isActive: true
    });

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/finance/categories'); 
            setCategories(res.data || []);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    useEffect( () => {
         if(isOpen){
            fetchCategories();

            if(initialData){
                setModalData({
                    id: initialData.id,
                    description: initialData.description || '',
                    amount: initialData.amount || '',
                    type: initialData.type || 'expense',
                    category: initialData.category || '',
                    frequency: initialData.frequency || 'Daily',
                    startDate: initialData.startDate
                        ? new Date(initialData.startDate).toISOString().substring(0, 10)
                        : new Date().toISOString().substring(0, 10),
                    executionTime: initialData.executionTime || '00:00',
                    endDate: initialData.endDate
                        ? new Date(initialData.endDate).toISOString().substring(0, 10)
                        : '',
                    isActive: initialData.isActive !== undefined ? initialData.isActive : true
                });
            }else{
                setModalData({
                    description: '',
                    amount: '',
                    type: 'expense',
                    category: '',
                    frequency: 'Daily',
                    startDate: new Date().toISOString().substring(0, 10),
                    executionTime: '00:00',
                    endDate: '',
                    isActive: true
                });
            }
        }
    }, [initialData, isOpen]);

    if(!isOpen) return null;
    
    const handleModalChange = (e) =>{
        const {name, value, type, checked} = e.target;

        setModalData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Nếu người dùng đổi type, tự động rết category khớp với type mới
            if(name === 'type'){
                const firstMatchingCat = categories.find(c => c.type === value)?.name || '';
                updated.category = firstMatchingCat;
            }
            return updated;
        });
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();

        const amountNum = parseFloat(modalData.amount);
        if(isNaN(amountNum) || amountNum <= 0){
            toast.error("Amount must be a positive number");
            return;
        }

        const payload = {
            id: initialData?.id || 0,
            description: modalData.description,
            amount: amountNum,
            type: modalData.type,
            category: modalData.category || (categories.find(c => c.type === modalData.type)?.name || 'Others'),
            frequency: modalData.frequency,
            startDate: new Date(modalData.startDate).toISOString(),
            executionTime: modalData.executionTime || '00:00',
            endDate: modalData.endDate ? new Date(modalData.endDate).toISOString() : null,
            isActive: modalData.isActive
        };
        try {
            await api.post('/api/finance/recurring', payload);
            toast.success(initialData ? "Updated recurring transaction successfully" : "Added recurring transaction successfully");
            onSuccess();
            onClose();
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.message;
            const actionText = initialData ? "Failed to update configuration" : "Failed to add configuration";
            toast.error(`${actionText}: ${serverMessage}`);
        }

    }

    const filterCategories = categories.filter(c => c.type === modalData.type);

    return(
        <div className='modal-overlay'>
            <div className='modal-card glass-card'>
                <div className='modal-header'>
                    <h3>{initialData ? "Edit Recurring Transaction" : "Add Recurring Transaction"}</h3>
                    <button className='btn-close' onClick={onClose} type='button'>
                        <X size={20}/>
                    </button>
                </div>

                {/* Modal form */}
                <form className='modal-form' onSubmit={handleModalSubmit}>
                    <div className='form-group' style={{marginTop: '15px'}}>
                        <label>Transaction Type</label>
                        <div className='toggle-switch-wrapper'>
                            <button 
                                type='button'
                                className={`toggle-btn ${modalData.type === 'expense' ? 'active-expense' : ''}`}
                                onClick={() => handleModalChange({target: {name: 'type', value: 'expense'}})}>
                                    Expense
                            </button>
                            <button 
                                type='button'
                                className={`toggle-btn ${modalData.type === 'income' ? 'active-income' : ''}`}
                                onClick={() => handleModalChange({target: {name: 'type', value: 'income'}})}>
                                    Income
                            </button>
                        </div>
                    </div>
                    <div className='form-group'>
                        <label>Amount</label>
                        <div className='input-prefix-wrapper'>
                            <span className='currency-prefix modal-currency-prefix'>$</span>
                            <input 
                                type='number'
                                name='amount'
                                step={0.01}
                                placeholder='0.00'
                                value={modalData.amount}
                                onChange={handleModalChange}
                                required/>
                        </div>
                    </div>

                    <div className='form-row'>
                        <div className='form-group'>
                            <label>Category</label>
                            <select 
                                name='category'
                                value={modalData.category}
                                onChange={handleModalChange}
                                required>
                                    {filterCategories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                            </select>
                        </div>
                        <div className='form-group'>
                            <label>Frequency</label>
                            <select
                                name='frequency'
                                value={modalData.frequency}
                                onChange={handleModalChange}
                                required>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className='form-row'>
                        <div className='form-group'>
                            <label>Start Date</label>
                            <input 
                                type='date'
                                name='startDate'
                                value={modalData.startDate}
                                onChange={handleModalChange}
                                required/>
                        </div>
                        <div className='form-group'>
                            <label>Excution time</label>
                            <input 
                                type='time'
                                name='executionTime'
                                value={modalData.executionTime}
                                onChange={handleModalChange}
                                required/>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label>End Date (Optional)</label>
                        <input
                            type='date'
                            name='endDate'
                            value={modalData.endDate}
                            onChange={handleModalChange}
                        />
                    </div>

                    <div className='form-group'>
                        <label>Description</label>
                        <input
                            type='text'
                            name='description'
                            placeholder='e.g., Netflix Subscription, Apartment Rent'
                            value={modalData.description}
                            onChange={handleModalChange}
                            required/>
                    </div>

                    <div className='form-group'>
                        <label className='checkbox-container'>
                            <input 
                                type='checkbox'
                                name='isActive'
                                checked={modalData.isActive}
                                onChange={handleModalChange}/>
                            <span>Is Active</span>
                        </label>
                    </div>

                    <div className='modal-actions'>
                        <button type='button' className='btn btn-secondary-outline' onClick={onClose}>
                            Cancel
                        </button>
                        <button type='submit' className='btn btn-primary'>
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RecurringModal;