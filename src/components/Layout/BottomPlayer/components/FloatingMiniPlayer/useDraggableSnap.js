import {useState, useRef, useCallback, useEffect} from 'react';

export const SNAP_POSITIONS = ['left', 'center', 'right'];

const STORAGE_KEY = 'orrin_mini_player_snap';
const DEFAULT_SNAP = 'right';
const DRAG_THRESHOLD_PX = 6;
const SNAP_TRANSITION = '0.32s cubic-bezier(0.4, 0, 0.2, 1)';

function readStoredSnap() {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        return SNAP_POSITIONS.includes(v) ? v : DEFAULT_SNAP;
    } catch {
        return DEFAULT_SNAP;
    }
}

function writeStoredSnap(position) {
    try {
        localStorage.setItem(STORAGE_KEY, position);
    } catch { /* quota exceeded */
    }
}

function snapPositionX(position, pillWidth, viewportWidth, margin = 16) {
    switch (position) {
        case 'left':
            return margin;
        case 'center':
            return (viewportWidth - pillWidth) / 2;
        case 'right':
            return viewportWidth - pillWidth - margin;
        default:
            return viewportWidth - pillWidth - margin;
    }
}

function nearestSnap(currentX, pillWidth, viewportWidth, margin = 16) {
    const positions = {
        left: snapPositionX('left', pillWidth, viewportWidth, margin),
        center: snapPositionX('center', pillWidth, viewportWidth, margin),
        right: snapPositionX('right', pillWidth, viewportWidth, margin),
    };

    let nearest = DEFAULT_SNAP;
    let minDist = Infinity;

    for (const [key, x] of Object.entries(positions)) {
        const dist = Math.abs(currentX - x);
        if (dist < minDist) {
            minDist = dist;
            nearest = key;
        }
    }

    return nearest;
}

export function useDraggableSnap({bottomOffset = 16} = {}) {
    const pillRef = useRef(null);
    const [snapPosition, setSnapPosition] = useState(readStoredSnap);

    const dragging = useRef(false);
    const didDrag = useRef(false);
    const startPointerX = useRef(0);
    const startPillX = useRef(0);
    const currentRawX = useRef(null);

    const [isDragging, setIsDragging] = useState(false);

    const getSnappedLeft = useCallback((snap) => {
        const pill = pillRef.current;
        if (!pill) return 0;
        return snapPositionX(snap, pill.offsetWidth, window.innerWidth);
    }, []);

    const applyStyle = useCallback((left, transition = 'none') => {
        const pill = pillRef.current;
        if (!pill) return;
        pill.style.left = `${left}px`;
        pill.style.transition = transition;
    }, []);

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            applyStyle(getSnappedLeft(snapPosition), 'none');
        });
        return () => cancelAnimationFrame(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const onResize = () => {
            if (!dragging.current) {
                applyStyle(getSnappedLeft(snapPosition), SNAP_TRANSITION);
            }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [snapPosition, applyStyle, getSnappedLeft]);

    const onPointerDown = useCallback((e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        const pill = pillRef.current;
        if (!pill) return;

        e.currentTarget.setPointerCapture(e.pointerId);

        dragging.current = true;
        didDrag.current = false;
        startPointerX.current = e.clientX;
        startPillX.current = pill.getBoundingClientRect().left;
        currentRawX.current = startPillX.current;
    }, []);

    const onPointerMove = useCallback((e) => {
        if (!dragging.current) return;

        const delta = e.clientX - startPointerX.current;

        if (!didDrag.current) {
            if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
            didDrag.current = true;
            setIsDragging(true);
        }

        const pill = pillRef.current;
        if (!pill) return;

        const rawLeft = startPillX.current + delta;
        const maxLeft = window.innerWidth - pill.offsetWidth - 8;
        const clamped = Math.max(8, Math.min(rawLeft, maxLeft));

        currentRawX.current = clamped;
        applyStyle(clamped, 'none');
    }, [applyStyle]);

    const onPointerUp = useCallback(() => {
        if (!dragging.current) return;
        dragging.current = false;

        if (!didDrag.current) {
            setIsDragging(false);
            return;
        }

        const pill = pillRef.current;
        if (!pill) return;

        const snap = nearestSnap(currentRawX.current, pill.offsetWidth, window.innerWidth);

        applyStyle(getSnappedLeft(snap), SNAP_TRANSITION);
        setSnapPosition(snap);
        writeStoredSnap(snap);

        setTimeout(() => setIsDragging(false), 350);
    }, [applyStyle, getSnappedLeft]);

    const onPointerCancel = useCallback(() => {
        if (!dragging.current) return;
        dragging.current = false;

        const snap = nearestSnap(
            currentRawX.current ?? getSnappedLeft(snapPosition),
            pillRef.current?.offsetWidth ?? 0,
            window.innerWidth,
        );
        applyStyle(getSnappedLeft(snap), SNAP_TRANSITION);
        setIsDragging(false);
    }, [applyStyle, getSnappedLeft, snapPosition]);

    const style = {bottom: `${bottomOffset}px`};

    return {
        pillRef,
        style,
        isDragging,
        snapPosition,
        pointerHandlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel,
        },
    };
}