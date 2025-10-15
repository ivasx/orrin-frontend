import './SectionHeader.css';
import {useTranslation} from 'react-i18next';

export default function SectionHeader({title, onMoreClick}) {
    const {t} = useTranslation();

    return (
        <div className="section-header">
            <h3 className="section-title">{title}</h3>
            <button className="section-more" onClick={onMoreClick}>
                {t('more')}
            </button>
        </div>
    );
}