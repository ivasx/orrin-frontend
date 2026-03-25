import { useState, useRef, useCallback, useEffect } from 'react';

// Snap positions
// Each position is described as a CSS `bottom` value (always the same) plus a
// horizontal anchor.  We store only the *key* in localStorage; the actual pixel
// coordinates are computed at runtime so the pill never goes off-screen on
// different viewport widths.
export const SNAP_POSITIONS = ['left', 'center', 'right'];
const STORAGE_KEY  = 'orrin_mini_player_snap';
const DEFAULT_SNAP = 'right';

// How many pixels the pointer must travel before we treat the gesture as a
// drag rather than a tap/click.
const DRAG_THRESHOLD_PX = 6;

// Spring easing used for snap animation (matches the global player transition).
const SNAP_TRANSITION = '0.32s cubic-bezier(0.4, 0, 0.2, 1)';

// Helpers
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
    } catch { /* quota exceeded — silently ignore */ }
}

/**
 * Compute the CSS `left` value (in px) for each snap position given the
 * current viewport width and the pill's own width.
 */
function snapPositionX(position, pillWidth, viewportWidth, margin = 16) {
    switch (position) {
        case 'left':   return margin;
        case 'center': return (viewportWidth - pillWidth) / 2;
        case 'right':  return viewportWidth - pillWidth - margin;
        default:       return viewportWidth - pillWidth - margin;
    }
}

/**
 * Given the current drag X position, decide which snap bucket it belongs to.
 */
function nearestSnap(currentX, pillWidth, viewportWidth, margin = 16) {
    const positions = {
        left:   snapPositionX('left',   pillWidth, viewportWidth, margin),
        center: snapPositionX('center', pillWidth, viewportWidth, margin),
        right:  snapPositionX('right',  pillWidth, viewportWidth, margin),
    };

    let nearest = DEFAULT_SNAP;
    let minDist = Infinity;
    for (const [key, x] of Object.entries(positions)) {
        const dist = Math.abs(currentX - x);
        if (dist < minDist) { minDist = dist; nearest = key; }
    }
    return nearest;
}

/**
 * Returns:
 *   pillRef      — attach to the pill element
 *   style        — apply directly: { left, bottom, transition }
 *   isDragging   — true while pointer is held and moved beyond threshold
 *   snapPosition — current snap key ('left' | 'center' | 'right')
 */
export function useDraggableSnap({ bottomOffset = 16 } = {}) {
    const pillRef     = useRef(null);
    const [snapPosition, setSnapPosition] = useState(readStoredSnap);

    // Live position during drag — stored in a ref to avoid re-renders every rAF.
    const dragging      = useRef(false);
    const didDrag       = useRef(false);        // crossed DRAG_THRESHOLD_PX?
    const startPointerX = useRef(0);
    const startPillX    = useRef(0);
    const currentRawX   = useRef(null);         // null = use snap-computed value

    // Expose a React-state boolean so consumers can suppress click during drag.
    const [isDragging, setIsDragging] = useState(false);

    const getSnappedLeft = useCallback((snap) => {
        const pill = pillRef.current;
        if (!pill) return 0;
        return snapPositionX(
            snap,
            pill.offsetWidth,
            window.innerWidth,
        );
    }, []);

    // We bypass React state for mid-drag updates (60 fps) to avoid re-renders.
    const applyStyle = useCallback((left, transition = 'none') => {
        const pill = pillRef.current;
        if (!pill) return;
        pill.style.left       = `${left}px`;
        pill.style.transition = transition;
    }, []);

    useEffect(() => {
        // Wait one frame so the pill has been laid out and offsetWidth is known.
        const id = requestAnimationFrame(() => {
            applyStyle(getSnappedLeft(snapPosition), 'none');
        });
        return () => cancelAnimationFrame(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally runs once on mount only

    // Re-snap on viewport resize (e.g. rotation).
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
        // Only primary button / single touch.
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        const pill = pillRef.current;
        if (!pill) return;

        e.currentTarget.setPointerCapture(e.pointerId);

        dragging.current      = true;
        didDrag.current       = false;
        startPointerX.current = e.clientX;
        // Read actual current left (might be mid-transition — grab live value).
        startPillX.current    = pill.getBoundingClientRect().left;
        currentRawX.current   = startPillX.current;
    }, []);

    const onPointerMove = useCallback((e) => {
        if (!dragging.current) return;

        const delta = e.clientX - startPointerX.current;

        if (!didDrag.current) {
            if (Math.abs(delta) < DRAG_THRESHOLD_PX) return; // still a tap
            didDrag.current = true;
            setIsDragging(true);
        }

        const pill = pillRef.current;
        if (!pill) return;

        const rawLeft = startPillX.current + delta;
        // Clamp so the pill never leaves the viewport.
        const maxLeft = window.innerWidth - pill.offsetWidth - 8;
        const clamped = Math.max(8, Math.min(rawLeft, maxLeft));

        currentRawX.current = clamped;
        applyStyle(clamped, 'none'); // no transition while dragging
    }, [applyStyle]);


    const onPointerUp = useCallback(() => {
        if (!dragging.current) return;
        dragging.current = false;

        if (!didDrag.current) {
            // It was a tap — reset isDragging immediately, let click fire.
            setIsDragging(false);
            return;
        }

        // Find nearest snap bucket and animate into place.
        const pill = pillRef.current;
        if (!pill) return;

        const snap = nearestSnap(
            currentRawX.current,
            pill.offsetWidth,
            window.innerWidth,
        );

        applyStyle(getSnappedLeft(snap), SNAP_TRANSITION);
        setSnapPosition(snap);
        writeStoredSnap(snap);

        // Reset isDragging after the snap animation completes so the click
        // event that fires immediately after pointerup is correctly suppressed.
        setTimeout(() => setIsDragging(false), 350);
    }, [applyStyle, getSnappedLeft]);

    // Pointer cancel (e.g. scroll interrupts touch)
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

    // ── Static style (bottom offset only; left managed imperatively) ─────────
    const style = {
        bottom: `${bottomOffset}px`,
        // `left` is written directly to the DOM — not via React state —
        // so we don't include it here.  The DOM node starts invisible until
        // the first rAF sets it correctly (prevents flash at position 0).
    };

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