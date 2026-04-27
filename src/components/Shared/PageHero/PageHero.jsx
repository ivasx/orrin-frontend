import {useState, useRef, useCallback} from 'react';
import {MoreHorizontal} from 'lucide-react';
import ContextMenu from '../../UI/OptionsMenu/OptionsMenu.jsx';
import styles from './PageHero.module.css';

export default function PageHero({
                                     backgroundImage,
                                     avatar,
                                     avatarAlt = '',
                                     avatarShape = 'circle',
                                     badge,
                                     eyebrow,
                                     title,
                                     meta,
                                     stats,
                                     actions,
                                     menuItems,
                                     children,
                                 }) {
    const moreButtonRef = useRef(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});

    const handleMoreClick = useCallback((e) => {
        e.stopPropagation();
        const rect = moreButtonRef.current?.getBoundingClientRect();
        if (rect) setMenuPosition({x: rect.left, y: rect.bottom + 6});
        setMenuVisible((v) => !v);
    }, []);

    return (
        <div
            className={styles.hero}
            style={backgroundImage ? {'--hero-bg-image': `url(${backgroundImage})`} : {}}
            data-has-bg={!!backgroundImage}
        >
            <div className={styles.heroOverlay}/>

            <div className={styles.heroContent}>
                {avatar && (
                    <div className={styles.avatarBlock}>
                        <img
                            src={avatar}
                            alt={avatarAlt}
                            className={`${styles.avatar} ${styles[`avatar--${avatarShape}`]}`}
                        />
                        {badge && <span className={styles.badge}>{badge}</span>}
                    </div>
                )}

                <div className={styles.meta}>
                    {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
                    <h1 className={styles.title}>{title}</h1>

                    {meta && <div className={styles.metaSlot}>{meta}</div>}

                    {stats && stats.length > 0 && (
                        <div className={styles.stats}>
                            {stats.map((stat, i) => (
                                <span key={stat.label} className={styles.statGroup}>
                                    {i > 0 && <span className={styles.statDivider}/>}
                                    <span className={styles.stat}>
                                        <strong>{stat.value}</strong>
                                        {stat.label}
                                    </span>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className={styles.actions}>
                        {actions}

                        {menuItems?.length > 0 && (
                            <button
                                ref={moreButtonRef}
                                className={styles.moreBtn}
                                onClick={handleMoreClick}
                                aria-label="More options"
                                aria-expanded={menuVisible}
                                aria-haspopup="menu"
                            >
                                <MoreHorizontal size={18}/>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {children}

            {menuItems?.length > 0 && (
                <ContextMenu
                    isVisible={menuVisible}
                    position={menuPosition}
                    onClose={() => setMenuVisible(false)}
                    menuItems={menuItems}
                    openDirection="down"
                />
            )}
        </div>
    );
}