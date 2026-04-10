import { ChevronRight } from 'lucide-react';
import styles from './SettingsItem.module.css';

export default function SettingsItem({ label, description, control, onClick }) {
    const Tag = onClick ? 'button' : 'div';

    return (
        <Tag
            className={`${styles.row} ${onClick ? styles.clickable : ''}`}
            onClick={onClick}
            type={onClick ? 'button' : undefined}
        >
            <div className={styles.labelGroup}>
                <span className={styles.label}>{label}</span>
                {description && (
                    <span className={styles.description}>{description}</span>
                )}
            </div>

            <div className={styles.controlSlot}>
                {control && <span className={styles.control}>{control}</span>}
                {onClick && (
                    <ChevronRight size={16} className={styles.chevron} />
                )}
            </div>
        </Tag>
    );
}