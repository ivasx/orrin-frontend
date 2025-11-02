// src/components/SectionSkeleton/SectionSkeleton.jsx
import SectionHeader from '../SectionHeader/SectionHeader.jsx';
import Spinner from '../Spinner/Spinner.jsx';
import './SectionSkeleton.css';
import { useTranslation } from 'react-i18next';

export default function SectionSkeleton({
                                            title,
                                            isError = false,
                                            error = null,
                                            onRetry = null,
                                            errorMessageKey = 'error_loading_tracks' // Додано новий пропс для кастомізації повідомлення
                                        }) {
    const { t } = useTranslation();

    return (
        <section>
            <SectionHeader title={title} onMoreClick={() => console.log('More clicked on skeleton')} />
            <div className="skeleton-container">
                {isError ? (
                    <div className="skeleton-error">
                        <p className="error-title">{t(errorMessageKey)}:</p>
                        {error && <pre className="error-details">{error.message || 'Невідома помилка'}</pre>}
                        {onRetry && (
                            <button onClick={onRetry} className="retry-button">
                                {t('retry', 'Спробувати ще')}
                            </button>
                        )}
                    </div>
                ) : (
                    <Spinner />
                )}
            </div>
        </section>
    );
}