import "./OptionsMenu.css";
import {useEffect, useRef, useCallback, useLayoutEffect} from "react";
import {useTranslation} from "react-i18next";

export default function ContextMenu({
                                        isVisible,
                                        position,
                                        onClose,
                                        menuItems = [],
                                        className = "",
                                        openDirection = "down"
                                    }) {
    const menuRef = useRef(null);
    const {t} = useTranslation();


    useLayoutEffect(() => {
        if (isVisible && menuRef.current) {
            const menu = menuRef.current;
            menu.style.left = '0px';
            menu.style.top = '0px';
            menu.style.visibility = 'hidden';

            requestAnimationFrame(() => {
                const menuRect = menu.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const margin = 10;

                let x = position.x;
                let y = position.y;

                if (x + menuRect.width > viewportWidth - margin) {
                    x = viewportWidth - menuRect.width - margin;
                }
                if (x < margin) {
                    x = margin;
                }

                if (openDirection === 'up') {
                    y = position.y - menuRect.height;
                }

                if (y + menuRect.height > viewportHeight - margin) {
                    y = viewportHeight - menuRect.height - margin;
                }
                if (y < margin) {
                    y = margin;
                }

                menu.style.left = `${x}px`;
                menu.style.top = `${y}px`;
                menu.style.visibility = 'visible';

                setTimeout(() => {
                    const firstItem = menu.querySelector('.menu-item:not([disabled])');
                    if (firstItem && document.activeElement !== firstItem) {
                        firstItem.focus();
                    }
                }, 50);
            });

        } else if (menuRef.current) {
            // Ховаємо меню при isVisible = false
            menuRef.current.style.visibility = 'hidden';
        }
    }, [isVisible, position, openDirection]);


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
        if (!isVisible) return;
        const handleKeyDown = (event) => {
            const menuItemsElements = Array.from(menuRef.current?.querySelectorAll('.menu-item:not([disabled])') || []);

            if (menuItemsElements.length === 0) return;

            const currentIndex = menuItemsElements.findIndex(item => item === document.activeElement);

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    const nextIndex = (currentIndex + 1) % menuItemsElements.length;
                    menuItemsElements[nextIndex]?.focus();
                    break;

                case 'ArrowUp':
                    event.preventDefault();
                    const prevIndex = currentIndex <= 0 ? menuItemsElements.length - 1 : currentIndex - 1;
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


    return (<div
        ref={menuRef}
        className={`context-menu ${className}`}
        style={{
            position: 'fixed', zIndex: 1000, left: '-9999px', top: '-9999px', visibility: 'hidden',
        }}
        role="menu"
        aria-label={t('context_menu_label')}
    >
        {menuItems.map((item, index) => {
            if (item.type === 'separator') {
                return (<div
                    key={`separator-${index}`}
                    className="menu-separator"
                    role="separator"
                    aria-hidden="true"
                />);
            }

            return (<div
                key={item.id || `item-${index}`}
                className={`menu-item ${item.disabled ? 'disabled' : ''} ${item.variant || ''} ${item.className || ''}`}
                onClick={(e) => handleMenuItemClick(item, e)}
                role="menuitem"
                tabIndex={item.disabled ? -1 : 0}
                aria-disabled={item.disabled}
                title={item.tooltip}
            >
                {item.icon && (<span className="menu-icon" aria-hidden="true">
                                {item.icon}
                            </span>)}

                <span className="menu-label">
                            {item.label}
                        </span>

                {item.shortcut && (
                    <span className="menu-shortcut" aria-label={t('shortcut_label', {shortcut: item.shortcut})}>
                                {item.shortcut}
                            </span>)}

                {item.badge && (<span className="menu-badge" aria-label={t('badge_label', {badge: item.badge})}>
                                {item.badge}
                            </span>)}
            </div>);
        })}
    </div>);
}