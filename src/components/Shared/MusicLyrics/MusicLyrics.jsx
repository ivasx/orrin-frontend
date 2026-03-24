import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './MusicLyrics.module.css';

const SCROLL_OFFSET = 0.35;
const USER_SCROLL_RESUME_DELAY = 3000;

function SyncedLyrics({ lines, currentTime, onLineClick }) {
    const containerRef = useRef(null);
    const lineRefs = useRef([]);
    const activeIndexRef = useRef(-1);
    const isUserScrollingRef = useRef(false);
    const userScrollTimerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    const findActiveIndex = useCallback((time) => {
        let idx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (time >= lines[i].time) {
                idx = i;
            } else {
                break;
            }
        }
        return idx;
    }, [lines]);

    const scrollToLine = useCallback((index) => {
        if (isUserScrollingRef.current) return;
        const container = containerRef.current;
        const lineEl = lineRefs.current[index];
        if (!container || !lineEl) return;

        const targetScrollTop =
            lineEl.offsetTop
            - container.clientHeight * SCROLL_OFFSET
            + lineEl.offsetHeight / 2;

        container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const newIndex = findActiveIndex(currentTime);
        if (newIndex !== activeIndexRef.current) {
            activeIndexRef.current = newIndex;
            setActiveIndex(newIndex);
            if (newIndex >= 0) scrollToLine(newIndex);
        }
    }, [currentTime, findActiveIndex, scrollToLine]);

    const handleScroll = useCallback(() => {
        isUserScrollingRef.current = true;
        clearTimeout(userScrollTimerRef.current);
        userScrollTimerRef.current = setTimeout(() => {
            isUserScrollingRef.current = false;
            if (activeIndexRef.current >= 0) scrollToLine(activeIndexRef.current);
        }, USER_SCROLL_RESUME_DELAY);
    }, [scrollToLine]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(userScrollTimerRef.current);
        };
    }, [handleScroll]);

    return (
        <div className={`${styles.container} ${styles.containerSynced}`} ref={containerRef}>
            <div className={styles.syncedList}>
                {lines.map((line, index) => (
                    <p
                        key={index}
                        ref={(el) => { lineRefs.current[index] = el; }}
                        className={`${styles.syncedLine} ${index === activeIndex ? styles.active : ''}`}
                        onClick={() => onLineClick(line.time)}
                    >
                        {line.text}
                    </p>
                ))}
                <div className={styles.endSpacer} aria-hidden="true" />
            </div>
        </div>
    );
}

export default function MusicLyrics({ lyricsData, currentTime, onLineClick }) {
    if (!lyricsData || lyricsData.type === 'none') {
        return (
            <div className={`${styles.container} ${styles.flexCenter}`}>
                <p className={styles.placeholder}>Lyrics not available</p>
            </div>
        );
    }

    if (lyricsData.type === 'static') {
        return (
            <div className={styles.container}>
                <div className={styles.lyricsText}>{lyricsData.content}</div>
            </div>
        );
    }

    if (lyricsData.type === 'synced') {
        return (
            <SyncedLyrics
                lines={lyricsData.content}
                currentTime={currentTime}
                onLineClick={onLineClick}
            />
        );
    }

    return null;
}