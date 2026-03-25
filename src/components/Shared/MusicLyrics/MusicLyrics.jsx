import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './MusicLyrics.module.css';

const SCROLL_BLOCK_POSITION = 'center'; // native scrollIntoView block value
const USER_SCROLL_RESUME_DELAY = 3000;  // ms before auto-scroll resumes after user interaction

// SyncedLyrics
function SyncedLyrics({ lines, currentTime, onLineClick }) {
    const containerRef = useRef(null);
    const lineRefs = useRef([]);
    const activeIndexRef = useRef(-1);
    const isUserScrollingRef = useRef(false);
    const userScrollTimerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    const findActiveIndex = useCallback(
        (time) => {
            let idx = -1;
            for (let i = 0; i < lines.length; i++) {
                if (time >= lines[i].time) idx = i;
                else break;
            }
            return idx;
        },
        [lines],
    );

    /**
     * Scroll the active line into view using getBoundingClientRect() math so
     * that the result is correct regardless of the CSS positioning context of
     * any ancestor (fixes the mobile `offsetTop` breakage when the parent
     * switches from `position:sticky` → `position:static`).
     *
     * Strategy:
     *   1. Measure where the line sits *relative to the scroll container*
     *      via:  lineRect.top - containerRect.top + container.scrollTop
     *   2. Offset so the line ends up vertically centred inside the container.
     *
     * Fallback: if the container ref is not available we call the native
     * `scrollIntoView({ block: 'center' })` on the line element, which lets
     * the browser figure out the closest scrollable ancestor on its own.
     */
    const scrollToLine = useCallback((index) => {
        if (isUserScrollingRef.current) return;

        const lineEl = lineRefs.current[index];
        if (!lineEl) return;

        const container = containerRef.current;

        if (!container) {
            // Ultimate fallback — browser handles everything.
            lineEl.scrollIntoView({ behavior: 'smooth', block: SCROLL_BLOCK_POSITION });
            return;
        }

        // getBoundingClientRect values are relative to the viewport, so
        // subtracting the container's top gives us the position relative to
        // the container's visible area. Adding scrollTop converts that into a
        // position relative to the container's full scrollable height.
        const containerRect = container.getBoundingClientRect();
        const lineRect = lineEl.getBoundingClientRect();

        const lineTopRelativeToContainer =
            lineRect.top - containerRect.top + container.scrollTop;

        const targetScrollTop =
            lineTopRelativeToContainer
            - container.clientHeight / 2
            + lineRect.height / 2;

        container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth',
        });
    }, []);

    // Sync active line when currentTime changes
    useEffect(() => {
        const newIndex = findActiveIndex(currentTime);
        if (newIndex !== activeIndexRef.current) {
            activeIndexRef.current = newIndex;
            setActiveIndex(newIndex);
            if (newIndex >= 0) scrollToLine(newIndex);
        }
    }, [currentTime, findActiveIndex, scrollToLine]);

    // Detect user scroll and temporarily pause auto-scroll
    const handleScroll = useCallback(() => {
        isUserScrollingRef.current = true;
        clearTimeout(userScrollTimerRef.current);

        userScrollTimerRef.current = setTimeout(() => {
            isUserScrollingRef.current = false;
            // Resume by re-centering the current active line.
            if (activeIndexRef.current >= 0) {
                scrollToLine(activeIndexRef.current);
            }
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
        <div
            className={`${styles.container} ${styles.containerSynced}`}
            ref={containerRef}
        >
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
                {/* Bottom spacer so the last line can scroll into the centre */}
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