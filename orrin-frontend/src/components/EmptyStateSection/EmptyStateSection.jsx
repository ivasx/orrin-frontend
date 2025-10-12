import SectionHeader from '../SectionHeader/SectionHeader.jsx';
import './EmptyStateSection.css';

export default function EmptyStateSection({ title, message, onMoreClick }) {
    return (
        <section>
            <SectionHeader title={title} onMoreClick={onMoreClick} />
            <div className="empty-state-container">
                <p className="empty-state-message">{message}</p>
            </div>
        </section>
    );
}