import { useTranslation } from 'react-i18next';
import SectionHeader from '../../UI/SectionHeader/SectionHeader';
import Spinner from '../../UI/Spinner/Spinner';
import Button from '../../UI/Button/Button';
import styles from './InfoSection.module.css';

export default function InfoSection({
                                        title,
                                        message,
                                        isLoading,
                                        error,
                                        action, // { label: string, onClick: func, variant: string }
                                        onMoreClick
                                    }) {
    const { t } = useTranslation();

    let content;

    if (isLoading) {
        content = <Spinner />;
    } else {
        const textToShow = error
            ? `${t('error_loading_tracks')}:`
            : message;

        const actionButton = action ? (
            <Button
                onClick={action.onClick}
                variant={action.variant || 'secondary'}
                size="medium"
            >
                {action.label || (error ? t('retry') : 'Action')}
            </Button>
        ) : null;

        content = (
            <>
                {textToShow && <p className={styles.text}>{textToShow}</p>}
                {actionButton}
            </>
        );
    }

    return (
        <section>
            <SectionHeader title={title} onMoreClick={onMoreClick} />
            <div className={styles.container}>
                {content}
            </div>
        </section>
    );
}