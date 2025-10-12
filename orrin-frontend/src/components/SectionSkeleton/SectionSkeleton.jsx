import SectionHeader from '../SectionHeader/SectionHeader.jsx';
import './SectionSkeleton.css';

export default function SectionSkeleton({ title }) {
    return (
        <section>
            <SectionHeader title={title} />
            <div className="skeleton-container">
                <div className="spinner"></div>
            </div>
        </section>
    );
}