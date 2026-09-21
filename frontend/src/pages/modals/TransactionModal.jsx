import React, {useState, useEffect} from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

function TransactionModal({isOpen, onClose, onSuccess, initialData}){
    const [categories, setCategories] = useState([]);

    const [modalData, setModalData] = useState({
        description: '',
        amount: '',
        type: 'expense',
        category: categories.find(c => c.type === 'expense')?.name || '',
        date: new Date().toISOString().substring(0, 10)
    })

    // const openAddTransModal = async () => {
    //     setTransactionId(null);
    //     console.info(modalData);
    // }

    useEffect(() => {
        if(isOpen){
            if(initialData){
                setModalData(initialData);
            }else{
                setModalData({  
                    description: '',
                    amount: '',
                    type: 'expense',
                    category: categories.find(c => c.type === 'expense')?.name || '',
                    date: new Date().toISOString().substring(0, 10)
                });
            }

            api.get('/api/finance/categories')
                .then(res => {
                    const fetchedCategories = res.data || [];
                    setCategories(fetchedCategories);
                    // Nếu là tạo mới (không có initialData), gán category đầu tiên khớp với type hiện tại
                    if (!initialData) {
                        setModalData(prev => {
                            const defaultCat = fetchedCategories.find(c => c.type === prev.type)?.name || '';
                            return {
                                ...prev,
                                category: defaultCat
                            };
                        });
                    }
                })
                .catch(err => {
                    console.error("Failed to load categories:", err);
                });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null; // Nếu isOpen = false thì ẩn modal
    const handleModalChange = (e) =>{
        const {name, value} = e.target;

        setModalData(prev => {
            const updated = {...prev, [name]: value};
            if(name === 'type'){
                const firstMatchingCat = categories.find(c => c.type === value)?.name || '';
                updated.category = firstMatchingCat;
            }
            return updated;
        })
    }

    const handleModalSubmit = async (e) => {
        e.preventDefault();

        // Validate basic data
        const amountNum = parseFloat(modalData.amount);
        if(isNaN(amountNum) || amountNum <= 0){
            toast.error("Amount must be a valid positive number");
            return;
        }

        if (!modalData.category) {
            toast.error("Please select a category");
            return;
        }
        
        const payload = {
            id: initialData?.id || 0,
            description: modalData.description,
            amount: modalData.amount,
            type: modalData.type,
            category: modalData.category,
            date: new Date(modalData.date).toISOString()
        }

        try{
            await api.post('/api/finance/transactions', payload);
            toast.success(initialData ? "Updated transaction successfully" : "Added new transaction successfully");
            onSuccess(); 
            onClose();  
        }catch(error){
            toast.error("Failed to save transaction.");
        }
    }

    const filterCategories = categories.filter(c => c.type === modalData.type);

    return(
        <div className='modal-overlay'>
            <div className='modal-card flass-card'>
                <div className='modal-header'>
                    <h3>{initialData ? "Edit Transaction" : "Add New Transaction"}</h3>
                    <button className='btn-close' onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>

                <form className='modal-form' onSubmit={handleModalSubmit}>
                    <div className='form-group' style={{marginTop:'15px'}}>
                        <label>Transaction Type</label>
                        <div className='toggle-switch-wrapper'>
                            <button type='button'
                                className={`toggle-btn ${modalData.type === 'expense' ? 'active-expense' : ''}`}
                                onClick={() => handleModalChange({target: {name: 'type', value: 'expense'}})}>Expense</button>
                            <button type='button'
                                className={`toggle-btn ${modalData.type === 'income' ? 'active-income' : ''}`}
                                onClick={() => handleModalChange({target: {name: 'type', value: 'income'}})}>Income</button>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label>Amount</label>
                        <div className='input-prefix-wrapper'>
                            <span className='currency-prefix modal-currency-prefix'>$</span>
                            <input 
                                type='number'
                                name='amount'
                                step='0.01'
                                placeholder='0.00'
                                value={modalData.amount}
                                onChange={handleModalChange}
                                required/>
                        </div>
                    </div>

                    <div className='form-row'>
                        <div className='form-group'>
                            <label>Category</label>
                            <select name='category'
                                value={modalData.category}
                                onChange={handleModalChange}
                                required>
                                {filterCategories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className='form-group'>
                            <label>Date</label>
                            <input 
                                type='date'
                                name='date'
                                value={modalData.date}
                                onChange={handleModalChange}
                                required/>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label>Description</label>
                        <input
                            type='text'
                            name='description'
                            placeholder='e.g., Grocery Shopping'
                            value={modalData.description}
                            onChange={handleModalChange}
                            required/>
                    </div>

                    <div className='modal-actions'>
                        <button type='button' className='btn btn-secondary-outline' onClick={onClose}>Cancel</button>
                        <button type='submit' className='btn btn-primary'>Save Transactions</button>
                    </div>
                </form>
            </div>
        </div>
        
    )
}

export default TransactionModal;