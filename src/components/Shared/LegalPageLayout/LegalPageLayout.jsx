import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import MusicSectionWrapper from '../MusicSectionWrapper/MusicSectionWrapper';
import styles from './LegalPageLayout.module.css';

function SkeletonLoader() {
    return (
        <div className={styles.skeleton}>
            <div className={styles.skeletonTopBar}>
                <div className={styles.skeletonPill} />
            </div>
            <div className={styles.skeletonBody}>
                <aside className={styles.skeletonSidebar}>
                    <div className={styles.skeletonHeading} />
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={styles.skeletonNavItem} style={{ width: `${70 + i * 5}%` }} />
                    ))}
                </aside>
                <div className={styles.skeletonContent}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonMeta} />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={styles.skeletonSection}>
                            <div className={styles.skeletonSectionTitle} />
                            {[1, 2, 3, 4, 5].map((j) => (
                                <div key={j} className={styles.skeletonLine} style={{ width: `${60 + (j * 7) % 40}%` }} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function LegalPageLayout({ isLoading, data, onBack }) {
    const [activeId, setActiveId] = useState(null);
    const observerRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!data || isLoading) return;

        if (data.sections && data.sections.length > 0) {
            setActiveId(data.sections[0].id);
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-10% 0px -75% 0px', threshold: 0 }
        );

        const sections = contentRef.current?.querySelectorAll('section[id]');
        sections?.forEach((s) => observerRef.current.observe(s));

        return () => observerRef.current?.disconnect();
    }, [data, isLoading]);

    const handleNavClick = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (isLoading) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <SkeletonLoader />
            </MusicSectionWrapper>
        );
    }

    if (!data) return null;

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className={styles.root}>
                <div className={styles.topBar}>
                    <button className={styles.backButton} onClick={onBack}>
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                </div>

                <div className={styles.splitView}>
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarInner}>
                            <p className={styles.sidebarLabel}>Contents</p>
                            <nav className={styles.tocNav}>
                                {data.sections.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className={`${styles.tocLink} ${activeId === section.id ? styles.tocLinkActive : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick(section.id);
                                        }}
                                    >
                                        <span className={styles.tocDot} />
                                        {section.title}
                                    </a>
                                ))}
                            </nav>
                            <div className={styles.sidebarMeta}>
                                <span className={styles.sidebarMetaLabel}>Last updated</span>
                                <span className={styles.sidebarMetaValue}>{data.lastUpdated}</span>
                            </div>
                        </div>
                    </aside>

                    <article className={styles.content} ref={contentRef}>
                        <header className={styles.docHeader}>
                            <h1 className={styles.docTitle}>{data.title}</h1>
                            <p className={styles.docMeta}>Effective as of {data.lastUpdated}</p>
                        </header>

                        {data.sections.map((section) => (
                            <section key={section.id} id={section.id} className={styles.section}>
                                <h2 className={styles.sectionTitle}>{section.title}</h2>
                                <div className={styles.sectionBody}>
                                    {section.content.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx} className={styles.paragraph}>
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </article>
                </div>
            </div>
        </MusicSectionWrapper>
    );
}