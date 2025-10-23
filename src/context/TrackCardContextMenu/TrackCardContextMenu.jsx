import "./TrackCardContextMenu.css";
import {useEffect, useRef, useCallback} from "react";
import {useTranslation} from "react-i18next";

export default function ContextMenu({
                                        isVisible,
                                        position,
                                        onClose,
                                        menuItems = [],
                                        className = "",
                                        openDirection = "down" // 👈 ДОДАНО
                                    }) {
    const menuRef = useRef(null);
    const {t} = useTranslation();

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isVisible) return;

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                handleClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                handleClose();
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isVisible, handleClose]);

    useEffect(() => {
        if (isVisible && menuRef.current) {
            // Small delay for animation
            setTimeout(() => {
                const firstItem = menuRef.current.querySelector('.menu-item:not([disabled])');
                if (firstItem) {
                    firstItem.focus();
                }
            }, 100);
        }
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;

        const handleKeyDown = (event) => {
            const menuItemsElements = Array.from(
                menuRef.current?.querySelectorAll('.menu-item:not([disabled])') || []
            );

            if (menuItemsElements.length === 0) return;

            const currentIndex = menuItemsElements.findIndex(
                item => item === document.activeElement
            );

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    const nextIndex = (currentIndex + 1) % menuItemsElements.length;
                    menuItemsElements[nextIndex]?.focus();
                    break;

                case 'ArrowUp':
                    event.preventDefault();
                    const prevIndex = currentIndex <= 0
                        ? menuItemsElements.length - 1
                        : currentIndex - 1;
                    menuItemsElements[prevIndex]?.focus();
                    break;

                case 'Enter':
                case ' ':
                    event.preventDefault();
                    document.activeElement?.click();
                    break;

                case 'Home':
                    event.preventDefault();
                    menuItemsElements[0]?.focus();
                    break;

                case 'End':
                    event.preventDefault();
                    menuItemsElements[menuItemsElements.length - 1]?.focus();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isVisible]);

    // 👇 ЛОГІКУ ПОВНІСТЮ ОНОВЛЕНО
    const getAdjustedPosition = useCallback(() => {
        if (!menuRef.current) return position;

        const menu = menuRef.current;
        const menuRect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const margin = 10; // Відступ від країв екрану

        let x = position.x;
        let y = position.y;

        // 1. Розрахунок X (горизонталь)
        // position.x - це 'rect.right' з плеєра.
        // Перевіряємо, чи влізе меню праворуч від точки.
        if (x + menuRect.width > viewportWidth - margin) {
            // Не влізає, ставимо зліва від точки
            // position.x тут це rect.right, нам треба rect.left,
            // але ми не маємо rect.left.
            // Припустимо, що position.x - це точка кліку/кнопки.
            // Найкраще - передавати x як rect.left, а не rect.right
            // Давайте припустимо, що position.x - це лівий край кнопки (rect.left)
            // (Ми це змінимо в BottomPlayer.jsx)

            // Якщо x (лівий край) + ширина меню вилазить,
            // ставимо x так, щоб правий край меню = правий край екрану
            if (x + menuRect.width > viewportWidth - margin) {
                x = viewportWidth - menuRect.width - margin;
            }
        }
        if (x < margin) {
            x = margin;
        }

        // 2. Розрахунок Y (вертикаль)
        if (openDirection === 'up') {
            // position.y - це top кнопки.
            // Ставимо bottom меню на top кнопки.
            y = position.y - menuRect.height;
        }
        // else (openDirection === 'down'), y = position.y (вже вірно)

        // 3. Фінальна перевірка Y (щоб не вилізло за межі)
        if (y + menuRect.height > viewportHeight - margin) {
            y = viewportHeight - menuRect.height - margin;
        }
        if (y < margin) {
            y = margin;
        }

        return {x, y};
    }, [position, openDirection]); // 👈 ДОДАНО openDirection

    if (!isVisible) return null;

    const handleMenuItemClick = (item, event) => {
        event.stopPropagation();
        event.preventDefault();

        if (item.disabled) return;

        if (item.action) {
            setTimeout(() => item.action(), 50);
        }

        handleClose();
    };

    const adjustedPosition = menuRef.current ? getAdjustedPosition() : position;

    return (
        <div
            ref={menuRef}
            className={`context-menu ${className}`}
            style={{
                position: 'fixed',
                left: adjustedPosition.x,
                top: adjustedPosition.y,
                zIndex: 1000
            }}
            role="menu"
            aria-label={t('context_menu_label')}
        >
            {menuItems.map((item, index) => {
                if (item.type === 'separator') {
                    return (
                        <div
                            key={`separator-${index}`}
                            className="menu-separator"
                            role="separator"
                            aria-hidden="true"
                        />
                    );
                }

                return (
                    <div
                        key={item.id || `item-${index}`}
                        className={`menu-item ${item.disabled ? 'disabled' : ''} ${item.variant || ''} ${item.className || ''}`}
                        onClick={(e) => handleMenuItemClick(item, e)}
                        role="menuitem"
                        tabIndex={item.disabled ? -1 : 0}
                        aria-disabled={item.disabled}
                        title={item.tooltip}
                    >
                        {item.icon && (
                            <span className="menu-icon" aria-hidden="true">
                                {item.icon}
                            </span>
                        )}

                        <span className="menu-label">
                            {item.label}
                        </span>

                        {item.shortcut && (
                            <span className="menu-shortcut" aria-label={t('shortcut_label', {shortcut: item.shortcut})}>
                                {item.shortcut}
                            </span>
                        )}

                        {item.badge && (
                            <span className="menu-badge" aria-label={t('badge_label', {badge: item.badge})}>
                                {item.badge}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}