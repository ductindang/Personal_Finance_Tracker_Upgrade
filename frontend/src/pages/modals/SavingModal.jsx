import React, {useState, useEffect} from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {X} from 'lucide-react';

function SavingModal({isOpen, onClose, onSuccess, initialData}){
    const [categories, setCategories] = useState([]);

    const [modalData, setModalData] = useState({
        title: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: new Date().toISOString().substring(0, 10)
    })

    useEffect(() => {
        if (isOpen){
            if(initialData){
                setModalData(initialData);
            }else{
                setModalData({
                    title: '',
                    targetAmount: '',
                    currentAmount: '',
                    targetDate: new Date().toISOString().substring(0, 10)
                });
            }
        }
    }, [initialData, isOpen]);

    if(!isOpen) return null;

    const handleModalChange = (e) => {
        const {name, value} = e.target;
        setModalData(prev => ({...prev, [name]: value}));
    }

    const handleModelSubmit = async (e) => {
        e.preventDefault();
        const targetAmountNum = parseFloat(modalData.targetAmount);
        const currentAmountNum = parseFloat(modalData.currentAmount || 0);
        if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
            toast.error("Target Amount must be a positive number.");
            return;
        }
        const payload = {
            id: initialData?.id || 0,
            title: modalData.title,
            targetAmount: targetAmountNum,
            currentAmount: currentAmountNum,
            targetDate: new Date(modalData.targetDate).toISOString()
        };

        try{
            await api.post('/api/finance/savings', payload);
            toast.success(initialData ? "Updated saving goal successfully" : "Added saving goal successfully");
            onSuccess();
            onClose();
        }catch(error){
            // 1. Lấy thông báo lỗi từ Backend trả về (nếu có), nếu không có mới lấy error.message
            const serverMessage = error.response?.data?.message || error.message;
            // 2. Ghép vào thông báo Toast
            const actionText = "Failed to add new savings";
            
            toast.error(`${actionText}: ${serverMessage}`);
        }
    }
    

    return(
        <div className='modal-overlay'>
            <div className='modal-card flass-card'>
                <div className='modal-header'>
                    <h3>{initialData ? "Edit Saving Goal" : "Add New Saving Goal"}</h3>
                    <button className='btn-close' onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>

                <form className='modal-form' onSubmit={handleModelSubmit}>
                    <div className='form-group' style={{marginTop: '15px'}}>
                        <label>Title</label>
                        <input 
                            type='text'
                            name='title'
                            placeholder='e.g., Buy a new car, Travel...'
                            value={modalData.title}
                            onChange={handleModalChange}
                            required/>
                    </div>
                    <div className='form-row'>
                        <div className='form-group'>
                            <label>Target amount</label>
                            <div className='input-prefix-wrapper'>
                                <span className='currency-prefix modal-currency-prefix'>$</span>
                                <input 
                                    type='number'
                                    name='targetAmount'
                                    step='0.01'
                                    placeholder='0.00'
                                    value={modalData.targetAmount}
                                    onChange={handleModalChange}
                                    required/>
                            </div>
                        </div>

                        {/* Chỉ cho phép nhập current amount khi tạo mới */}
                        {!initialData && (
                            <div className='form-group'>
                                <label>Current Amount</label>
                                <div className='input-prefix-wrapper'>
                                    <span className='currency-prefix modal-currency-prefix'>$</span>
                                    <input 
                                        type='number'
                                        name="currentAmount"
                                        step='0.01'
                                        placeholder='0.00'
                                        value={modalData.currentAmount}
                                        onChange={handleModalChange}/>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='form-group'>
                        <label>Target Date</label>
                        <input 
                            type='date'
                            name='targetDate'
                            value={modalData.targetDate}
                            onChange={handleModalChange}
                            required/>
                    </div>

                    <div className='modal-actions'>
                        <button type='button' className='btn btn-secondary-outline' onClick={onClose}>Cancel</button>
                        <button type='submit' className='btn btn-primary'>Save Goal</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SavingModal;