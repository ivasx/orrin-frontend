import React from 'react';
import i18n from '../../../i18n/i18n.js';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Логування помилки в сервіс моніторингу (наприклад, Sentry)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            errorInfo: errorInfo
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            const errorMessage = this.state.error?.message || i18n.t('error_unknown', 'Unknown error');
            const showDetails = this.props.showDetails !== false && process.env.NODE_ENV === 'development';

            return (
                <div className="error-boundary">
                    <div className="error-boundary__content">
                        <h2 className="error-boundary__title">
                            {i18n.t('error_occurred', 'Щось пішло не так')}
                        </h2>
                        <p className="error-boundary__message">{errorMessage}</p>
                        
                        {showDetails && this.state.errorInfo && (
                            <details className="error-boundary__details">
                                <summary>{i18n.t('error_details', 'Деталі помилки')}</summary>
                                <pre className="error-boundary__stack">
                                    {this.state.error?.stack}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="error-boundary__actions">
                            <button 
                                className="error-boundary__button error-boundary__button--primary"
                                onClick={this.handleReload}
                            >
                                {i18n.t('reload_page', 'Перезавантажити сторінку')}
                            </button>
                            {this.props.onReset && (
                                <button 
                                    className="error-boundary__button error-boundary__button--secondary"
                                    onClick={this.handleReset}
                                >
                                    {i18n.t('try_again', 'Спробувати ще раз')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
