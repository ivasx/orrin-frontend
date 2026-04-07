import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './SidebarItem.module.css';

const SidebarItem = ({ icon: Icon, label, path, onClick, isCollapsed, badge }) => {
    const hasBadge = badge != null && badge > 0;

    return (
        <li className={styles.item}>
            <NavLink
                to={path}
                onClick={onClick}
                className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.activeLink : ''}`
                }
            >
                <span className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                    {hasBadge && isCollapsed && (
                        <span className={styles.badgeDot} aria-hidden="true" />
                    )}
                </span>

                <span className={`${styles.label} ${isCollapsed ? styles.labelHidden : ''}`}>
                    {label}
                </span>

                {hasBadge && !isCollapsed && (
                    <span className={styles.badge} aria-label={`${badge} unread`}>
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </NavLink>
        </li>
    );
};

SidebarItem.propTypes = {
    icon:        PropTypes.elementType.isRequired,
    label:       PropTypes.string.isRequired,
    path:        PropTypes.string.isRequired,
    onClick:     PropTypes.func,
    isCollapsed: PropTypes.bool,
    badge:       PropTypes.number,
};

export default SidebarItem;