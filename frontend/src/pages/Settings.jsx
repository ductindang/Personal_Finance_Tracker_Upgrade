import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Tags, Database, Trash2, Lock, Plus, FileDown, UploadCloud, AlertTriangle } from 'lucide-react';
import '../css/settings.css';
import AlertModal from '../components/AlertModal';
import { useCurrency } from '../context/CurrencyContext';

function Settings() {
    // 1. STATE QUẢN LÝ TIỀN TỆ (CURRENCY) — dùng global context
    const { currency, setCurrency } = useCurrency();


    // 2. STATE QUẢN LÝ DANH MỤC (CATEGORIES)
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [newCatType, setNewCatType] = useState('expense');
    const [submittingCat, setSubmittingCat] = useState(false);

    // 3. STATE CHO POPUP XÁC NHẬN (ALERT MODAL)
    const [alert, setAlert] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        actionType: null, // 'delete-category' | 'purge' | 'import'
        data: null
    });

    // 4. FETCH CATEGORIES
    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/finance/categories');
            setCategories(res.data || []);
        } catch (error) {
            console.error("Failed to load categories: ", error);
            toast.error("Failed to load categories.");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 5. THAY ĐỔI BASE CURRENCY
    const handleCurrencyChange = (e) => {
        const val = e.target.value;
        setCurrency(val); // context tự lưu vào localStorage
        toast.success(`Base currency updated to "${val}"`);
    };


    // 6. THÊM CATEGORY MỚI
    const handleAddCategory = async (e) => {
        e.preventDefault();
        const trimmedName = newCatName.trim();
        if (!trimmedName) {
            toast.error("Category name cannot be empty.");
            return;
        }

        // Kiểm tra xem tên danh mục đã tồn tại trong cùng type chưa
        const exists = categories.some(
            c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.type.toLowerCase() === newCatType.toLowerCase()
        );
        if (exists) {
            toast.error(`Category "${trimmedName}" already exists for ${newCatType}.`);
            return;
        }

        try {
            setSubmittingCat(true);
            const res = await api.post('/api/finance/categories', {
                name: trimmedName,
                type: newCatType
            });

            if (res.data?.success) {
                toast.success(`Added category "${trimmedName}"!`);
                setNewCatName('');
                fetchCategories();
            } else {
                toast.error(res.data?.message || "Failed to add category.");
            }
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.message;
            toast.error(`Failed to add category: ${serverMessage}`);
        } finally {
            setSubmittingCat(false);
        }
    };

    // 7. XOÁ CATEGORY (CÓ XÁC NHẬN)
    const triggerDeleteCategory = (category) => {
        setAlert({
            isOpen: true,
            type: 'confirm',
            title: 'Delete Category',
            message: `Are you sure you want to delete category "${category.name}"? Transactions using this category may be affected.`,
            actionType: 'delete-category',
            data: category.id
        });
    };

    const confirmDeleteCategory = async (catId) => {
        try {
            const res = await api.delete(`/api/finance/categories/${catId}`);
            if (res.data?.success) {
                setAlert({
                    isOpen: true,
                    type: 'success',
                    title: 'Deleted',
                    message: 'Category deleted successfully.',
                    actionType: null,
                    data: null
                });
                fetchCategories();
            } else {
                toast.error(res.data?.message || "Failed to delete category.");
            }
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.message;
            setAlert({
                isOpen: true,
                type: 'danger',
                title: 'Error',
                message: `Failed to delete category: ${serverMessage}`,
                actionType: null,
                data: null
            });
        }
    };

    // 8. EXPORT DỮ LIỆU BACKUP (FILE JSON)
    const handleExportData = async () => {
        try {
            const response = await api.get('/api/finance/backup/export', {
                responseType: 'blob'
            });
            // Tạo link tải file tạm thời trên trình duyệt
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const dateStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
            link.setAttribute('download', `finance_backup_${dateStr}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Backup file exported successfully!");
        } catch (error) {
            console.error("Export error: ", error);
            toast.error("Failed to export backup file.");
        }
    };

    // 9. IMPORT DỮ LIỆU BACKUP
    const handleFileImportChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input để lần sau chọn lại cùng 1 file vẫn trigger event onChange
        e.target.value = '';

        setAlert({
            isOpen: true,
            type: 'confirm',
            title: 'Import Backup File',
            message: `Are you sure you want to restore from "${file.name}"? This will replace all existing transactions, budgets, and savings goals!`,
            actionType: 'import',
            data: file
        });
    };

    const confirmImport = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/api/finance/backup/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data?.success) {
                setAlert({
                    isOpen: true,
                    type: 'success',
                    title: 'Import Completed',
                    message: 'Financial database restored successfully.',
                    actionType: null,
                    data: null
                });
                fetchCategories();
            } else {
                toast.error(res.data?.message || "Failed to import backup file.");
            }
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.message;
            setAlert({
                isOpen: true,
                type: 'danger',
                title: 'Import Failed',
                message: `Failed to restore database: ${serverMessage}`,
                actionType: null,
                data: null
            });
        }
    };

    // 10. PURGE DỮ LIỆU
    const triggerPurge = () => {
        setAlert({
            isOpen: true,
            type: 'confirm',
            title: 'Purge Entire Database',
            message: 'WARNING: This action will PERMANENTLY ERASE all your transactions, budgets, recurring items, and savings goals! Are you sure you want to continue?',
            actionType: 'purge',
            data: null
        });
    };

    const confirmPurge = async () => {
        try {
            const res = await api.post('/api/finance/backup/purge');
            if (res.data?.success) {
                setAlert({
                    isOpen: true,
                    type: 'success',
                    title: 'Database Purged',
                    message: 'All application records have been cleared.',
                    actionType: null,
                    data: null
                });
                fetchCategories();
            } else {
                toast.error(res.data?.message || "Failed to purge database.");
            }
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.message;
            setAlert({
                isOpen: true,
                type: 'danger',
                title: 'Error',
                message: `Failed to purge: ${serverMessage}`,
                actionType: null,
                data: null
            });
        }
    };

    // Điều phối hành động khi bấm Confirm trong AlertModal
    const handleConfirmAlert = () => {
        if (alert.actionType === 'delete-category') {
            confirmDeleteCategory(alert.data);
        } else if (alert.actionType === 'import') {
            confirmImport(alert.data);
        } else if (alert.actionType === 'purge') {
            confirmPurge();
        } else {
            setAlert(prev => ({ ...prev, isOpen: false }));
        }
    };

    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    return (
        <div className="view-panel active">
            {/* Header đồng bộ format */}
            <header className="header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '2rem' }}>
                <div className="page-title">
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                        Manage application configurations, categories, and data backups.
                    </p>
                </div>
            </header>

            <div className="settings-grid">
                {/* 1. General Preferences Card */}
                <section className="card settings-card">
                    <h3>
                        <SettingsIcon size={20} /> General Preferences
                    </h3>
                    <div className="setting-item">
                        <div>
                            <h4>Base Currency</h4>
                            <p>Set the currency symbol used across the app.</p>
                        </div>
                        <select
                            value={currency}
                            onChange={handleCurrencyChange}
                            className="select-input"
                        >
                            <option value="$">US Dollar ($)</option>
                            <option value="€">Euro (€)</option>
                            <option value="£">British Pound (£)</option>
                            <option value="¥">Japanese Yen / Yuan (¥)</option>
                            <option value="₫">Vietnamese Dong (₫)</option>
                        </select>
                    </div>
                </section>

                {/* 2. Category Management Card */}
                <section className="card settings-card">
                    <h3>
                        <Tags size={20} /> Category Management
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-8px' }}>
                        Manage transaction categories for your income and expenses.
                    </p>

                    <div className="category-manager-container">
                        {/* Income Categories */}
                        <div>
                            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.95rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.4rem' }}>
                                Income Categories
                            </h4>
                            <div className="category-list-box">
                                {incomeCategories.length === 0 ? (
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No income categories.</span>
                                ) : (
                                    incomeCategories.map(cat => (
                                        <div key={cat.id} className="category-item-row">
                                            <span>{cat.name}</span>
                                            {cat.name !== 'Others' ? (
                                                <button
                                                    className="btn-icon delete-btn"
                                                    title="Delete Category"
                                                    onClick={() => triggerDeleteCategory(cat)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            ) : (
                                                <span title="System Category" style={{ opacity: 0.5 }}>
                                                    <Lock size={15} />
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Expense Categories */}
                        <div>
                            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.95rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.4rem' }}>
                                Expense Categories
                            </h4>
                            <div className="category-list-box">
                                {expenseCategories.length === 0 ? (
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No expense categories.</span>
                                ) : (
                                    expenseCategories.map(cat => (
                                        <div key={cat.id} className="category-item-row">
                                            <span>{cat.name}</span>
                                            {cat.name !== 'Others' ? (
                                                <button
                                                    className="btn-icon delete-btn"
                                                    title="Delete Category"
                                                    onClick={() => triggerDeleteCategory(cat)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            ) : (
                                                <span title="System Category" style={{ opacity: 0.5 }}>
                                                    <Lock size={15} />
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Add Category Form */}
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.2rem', marginTop: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.8rem' }}>Add New Category</h4>
                        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Freelance, Coffee"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                style={{
                                    flexGrow: 2,
                                    height: '40px',
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--text-primary)',
                                    borderRadius: '8px',
                                    padding: '0 0.8rem',
                                    outline: 'none',
                                    fontFamily: 'var(--font-main)'
                                }}
                            />
                            <select
                                value={newCatType}
                                onChange={(e) => setNewCatType(e.target.value)}
                                style={{
                                    height: '40px',
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--text-primary)',
                                    borderRadius: '8px',
                                    padding: '0 0.8rem',
                                    outline: 'none',
                                    fontFamily: 'var(--font-main)',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                            <button
                                type="submit"
                                className="btn btn-secondary"
                                disabled={submittingCat}
                                style={{ height: '40px', padding: '0 1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Plus size={16} /> Add
                            </button>
                        </form>
                    </div>
                </section>

                {/* 3. Backup & Storage Card */}
                <section className="card settings-card">
                    <h3>
                        <Database size={20} /> Backup & Storage
                    </h3>

                    {/* Export */}
                    <div className="setting-item">
                        <div>
                            <h4>Export Financial Data</h4>
                            <p>Download a file of all transactions, budgets, and savings goals in JSON format.</p>
                        </div>
                        <button className="btn btn-primary-outline" onClick={handleExportData}>
                            <FileDown size={16} /> Export Data
                        </button>
                    </div>

                    {/* Import */}
                    <div className="setting-item">
                        <div>
                            <h4>Import Financial Data</h4>
                            <p>Restore your data from a previously exported JSON backup file.</p>
                        </div>
                        <label className="btn btn-secondary-outline import-label">
                            <UploadCloud size={16} /> Choose Backup File
                            <input
                                type="file"
                                accept=".json"
                                style={{ display: 'none' }}
                                onChange={handleFileImportChange}
                            />
                        </label>
                    </div>

                    {/* Purge */}
                    <div className="setting-item warning-zone">
                        <div>
                            <h4 className="text-danger" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertTriangle size={18} /> Purge Application Data
                            </h4>
                            <p>This action permanently clears all database transactions, budgets, and goals. This cannot be undone.</p>
                        </div>
                        <button className="btn btn-danger" onClick={triggerPurge}>
                            <Trash2 size={16} /> Purge All Data
                        </button>
                    </div>
                </section>
            </div>

            {/* Alert Confirm Popup */}
            <AlertModal
                isOpen={alert.isOpen}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onConfirm={alert.type === 'confirm' ? handleConfirmAlert : () => setAlert(prev => ({ ...prev, isOpen: false }))}
                onCancel={() => setAlert(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

export default Settings;