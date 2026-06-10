import React from 'react';
import i18n from '../../../i18n/i18n.js';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false, error: null, errorInfo: null};
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error};
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        this.setState({errorInfo});
    }

    handleReload = () => window.location.reload();

    handleReset = () => this.setState({hasError: false, error: null, errorInfo: null});

    render() {
        if (!this.state.hasError) return this.props.children;

        const errorMessage = this.state.error?.message || i18n.t('error_unknown');
        const showDetails = this.props.showDetails !== false && process.env.NODE_ENV === 'development';

        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h2 className={styles.title}>{i18n.t('error_occurred')}</h2>
                    <p className={styles.message}>{errorMessage}</p>

                    {showDetails && this.state.errorInfo && (
                        <details className={styles.details}>
                            <summary>{i18n.t('error_details')}</summary>
                            <pre className={styles.stack}>
                                {this.state.error?.stack}
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}

                    <div className={styles.actions}>
                        <button className={styles.btnPrimary} onClick={this.handleReload}>
                            {i18n.t('reload_page')}
                        </button>
                        {this.props.onReset && (
                            <button className={styles.btnSecondary} onClick={this.handleReset}>
                                {i18n.t('try_again')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;