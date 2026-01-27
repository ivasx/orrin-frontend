import {createContext, useContext, useState, useCallback} from 'react';
import {X, CheckCircle, AlertCircle, Info} from 'lucide-react';
import styles from './ToastContext.module.css';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({children}) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, {id, message, type}]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{showToast}}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`${styles.toast} ${styles[toast.type]}`}
                        role="alert"
                    >
                        <div className={styles.icon}>
                            {toast.type === 'success' && <CheckCircle size={20}/>}
                            {toast.type === 'error' && <AlertCircle size={20}/>}
                            {toast.type === 'info' && <Info size={20}/>}
                        </div>
                        <div className={styles.message}>{toast.message}</div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className={styles.closeButton}
                        >
                            <X size={16}/>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};