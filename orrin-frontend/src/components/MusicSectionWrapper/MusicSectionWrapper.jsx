import "./MusicSectionWrapper.css";

export default function MusicSectionWrapper({children, spacing = "default"}) {
    return (
        <div className={`music-section-wrapper music-section-wrapper--${spacing}`}>
            {children}
        </div>
    );
}