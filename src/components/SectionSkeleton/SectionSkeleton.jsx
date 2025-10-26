// src/components/SectionSkeleton/SectionSkeleton.jsx
import SectionHeader from '../SectionHeader/SectionHeader.jsx';
import Spinner from '../Spinner/Spinner.jsx'; // <-- Імпортуємо новий компонент
import './SectionSkeleton.css';

export default function SectionSkeleton({title}) {
    return (
        <section>
            <SectionHeader title={title} onMoreClick={() => console.log('More clicked on skeleton')}/>
            <div className="skeleton-container">
                <Spinner />
            </div>
        </section>
    );
}