import React from 'react';
import {X, AlertCircle, CheckCircle, Info} from 'lucide-react';

function AlertModal({isOpen, type = 'info', title, message, onConfirm, onCancel}){
    if(!isOpen) return null;

    // Tự động chọn icon và màu sắc dựa vào biến "type" (success, danger, confirm, info)
    let Icon = Info;
    let colorHex = '#3b82f6';
    let isConfirmMode = (type === 'confirm');

    if(type === 'danger' || type === 'confirm'){
        Icon = AlertCircle;
        colorHex = '#ef4444';
    }else if(type === 'success'){
        Icon = CheckCircle;
        colorHex = '#10b981';
    }

    return (
        <div className='modal-overlay'>
            <div className='modal-card glass-card' style={{maxWidth:'400px'}}>
                <div className="modal modal-alert alert-type-danger">
                    <div className="modal-content alert-content" style={{ textAlign: 'center', maxWidth: '380px' }}>
                        
                        <div className="alert-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                            <AlertCircle size={48} color="#ef4444" strokeWidth={1.5} />
                        </div>
                        
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>{title}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '0.95rem' }}>
                            {message}
                        </p>
                        
                        <div className="modal-actions alert-actions" style={{ display: 'flex', justifyContent: 'center', gap: '10px', width: '100%' }}>
                            {isConfirmMode && (
                                <button className="btn btn-secondary-outline" onClick={onCancel} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            )}
                            <button className="btn btn-primary" 
                                onClick={onConfirm} 
                                style={{ flex: 1, background: colorHex, borderColor: colorHex  }}>
                                OK
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AlertModal;