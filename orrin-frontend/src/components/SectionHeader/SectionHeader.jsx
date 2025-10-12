import './SectionHeader.css';

export default function SectionHeader({ title, onMoreClick }) {
    return (
        <div className="section-header">
            <h3 className="section-title">{title}</h3>
            <button className="section-more" onClick={onMoreClick}>
                Більше
            </button>
        </div>
    );
}