import { useState, useEffect, useRef } from 'react';

export function useMarquee(dependency) {
    const [isScrolling, setIsScrolling] = useState(false);
    const containerRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        setIsScrolling(false);

        const checkScrolling = () => {
            if (containerRef.current && contentRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const contentWidth = contentRef.current.scrollWidth;
                setIsScrolling(contentWidth > containerWidth);
            }
        };

        const timeoutId = setTimeout(checkScrolling, 150);

        return () => clearTimeout(timeoutId);
    }, [dependency]);

    return { isScrolling, containerRef, contentRef };
}