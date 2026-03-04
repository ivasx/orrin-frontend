import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './Dropdown.module.css';

export default function Dropdown({
                                     trigger,
                                     customTrigger,
                                     items = [],
                                     selectedValue,
                                     onSelect,
                                     placeholder = 'Select',
                                     icon,
                                     className = ''
                                 }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            const menuItems = Array.from(
                dropdownRef.current?.querySelectorAll(`.${styles.dropdownItem}:not(.${styles.disabled})`) || []
            );

            if (menuItems.length === 0) return;

            const currentIndex = menuItems.findIndex(
                item => item === document.activeElement
            );

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    const nextIndex = (currentIndex + 1) % menuItems.length;
                    menuItems[nextIndex]?.focus();
                    break;

                case 'ArrowUp':
                    event.preventDefault();
                    const prevIndex = currentIndex <= 0
                        ? menuItems.length - 1
                        : currentIndex - 1;
                    menuItems[prevIndex]?.focus();
                    break;

                case 'Enter':
                case ' ':
                    event.preventDefault();
                    document.activeElement?.click();
                    break;

                case 'Home':
                    event.preventDefault();
                    menuItems[0]?.focus();
                    break;

                case 'End':
                    event.preventDefault();
                    menuItems[menuItems.length - 1]?.focus();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleItemClick = (item) => {
        if (item.disabled) return;

        if (onSelect) {
            onSelect(item.value);
        }

        if (item.action) {
            item.action();
        }

        setIsOpen(false);
    };

    const selectedItem = items.find(item => item.value === selectedValue);
    const displayLabel = selectedItem?.label || trigger || placeholder;

    return (
        <div className={`${styles.dropdownContainer} ${className}`} ref={dropdownRef}>
            {customTrigger ? (
                <div
                    ref={triggerRef}
                    className={styles.customTriggerWrapper}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    {customTrigger}
                </div>
            ) : (
                <button
                    ref={triggerRef}
                    className={`${styles.dropdownTrigger} ${isOpen ? styles.open : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    {icon && <span className={styles.dropdownTriggerIconLeft}>{icon}</span>}
                    <span>{displayLabel}</span>
                    <ChevronDown size={16} className={styles.dropdownTriggerIcon} />
                </button>
            )}

            {isOpen && (
                <div className={styles.dropdownMenu} role="menu">
                    {items.map((item, index) => {
                        if (item.type === 'header') {
                            return (
                                <div
                                    key={`header-${index}`}
                                    className={`
                                        ${styles.dropdownHeader} 
                                        ${item.action ? styles.clickableHeader : ''}
                                    `}
                                    onClick={() => {
                                        const selection = window.getSelection().toString();
                                        if (selection.length > 0) return;

                                        if (item.action) {
                                            item.action();
                                            setIsOpen(false);
                                        }
                                    }}
                                >
                                    {item.label}
                                </div>
                            );
                        }

                        if (item.type === 'separator') {
                            return (
                                <div
                                    key={`separator-${index}`}
                                    className={styles.dropdownSeparator}
                                    role="separator"
                                    aria-hidden="true"
                                />
                            );
                        }

                        const isSelected = selectedValue !== undefined && item.value === selectedValue;
                        const isDangerItem = item.isDanger;

                        return (
                            <div
                                key={item.value || `item-${index}`}
                                className={`
                                    ${styles.dropdownItem} 
                                    ${isSelected ? styles.selected : ''} 
                                    ${item.disabled ? styles.disabled : ''}
                                `}
                                onClick={() => handleItemClick(item)}
                                role="menuitem"
                                tabIndex={item.disabled ? -1 : 0}
                                aria-disabled={item.disabled}
                                aria-current={isSelected ? 'true' : 'false'}
                                style={isDangerItem ? { color: '#ff4b4b' } : {}}
                            >
                                {item.icon && (
                                    <span className={styles.dropdownItemIcon}>
                                        {item.icon}
                                    </span>
                                )}

                                <span className={styles.dropdownItemLabel}>
                                    {item.label}
                                </span>

                                {isSelected && (
                                    <Check size={16} className={styles.dropdownItemCheckmark} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}