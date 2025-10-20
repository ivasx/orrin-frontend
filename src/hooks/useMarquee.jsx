import { useState, useEffect, useRef } from 'react';

export function useMarquee(dependency) {
    const [isScrolling, setIsScrolling] = useState(false);
    const containerRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        // Скидаємо скролінг при зміні треку
        setIsScrolling(false);

        const checkScrolling = () => {
            if (containerRef.current && contentRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const contentWidth = contentRef.current.scrollWidth;
                setIsScrolling(contentWidth > containerWidth);
            }
        };

        // Невелика затримка, щоб DOM встиг оновитися
        const timeoutId = setTimeout(checkScrolling, 150);

        return () => clearTimeout(timeoutId);
    }, [dependency]); // Залежність від ID треку або іншого унікального значення

    return { isScrolling, containerRef, contentRef };
}