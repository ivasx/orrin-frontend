import {useState, useRef, useEffect} from 'react';
import {ChevronDown, Check} from 'lucide-react';
import './Dropdown.css';

export default function Dropdown({
                                     trigger,
                                     items = [],
                                     selectedValue,
                                     onSelect,
                                     placeholder = 'Оберіть',
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
                dropdownRef.current?.querySelectorAll('.dropdown-item:not(.disabled)') || []
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
        <div className={`dropdown-container ${className}`} ref={dropdownRef}>
            <button
                ref={triggerRef}
                className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {icon && <span className="dropdown-trigger-icon-left">{icon}</span>}
                <span>{displayLabel}</span>
                <ChevronDown size={16} className="dropdown-trigger-icon"/>
            </button>

            {isOpen && (
                <div
                    className="dropdown-menu"
                    role="menu"
                >
                    {items.map((item, index) => {
                        if (item.type === 'separator') {
                            return (
                                <div
                                    key={`separator-${index}`}
                                    className="dropdown-separator"
                                    role="separator"
                                    aria-hidden="true"
                                />
                            );
                        }

                        const isSelected = selectedValue !== undefined && item.value === selectedValue;

                        return (
                            <div
                                key={item.value || `item-${index}`}
                                className={`dropdown-item ${isSelected ? 'selected' : ''} ${item.disabled ? 'disabled' : ''}`}
                                onClick={() => handleItemClick(item)}
                                role="menuitem"
                                tabIndex={item.disabled ? -1 : 0}
                                aria-disabled={item.disabled}
                                aria-current={isSelected ? 'true' : 'false'}
                            >
                                {item.icon && (
                                    <span className="dropdown-item-icon">
                                        {item.icon}
                                    </span>
                                )}

                                <span className="dropdown-item-label">
                                    {item.label}
                                </span>

                                {isSelected && (
                                    <Check size={16} className="dropdown-item-checkmark"/>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}