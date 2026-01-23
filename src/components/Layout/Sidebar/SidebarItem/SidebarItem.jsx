import React from 'react';
import {NavLink} from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './SidebarItem.module.css';

const SidebarItem = ({icon: Icon, label, path, onClick, isCollapsed}) => {
    return (
        <li className={styles.item}>
            <NavLink
                to={path}
                onClick={onClick}
                className={({isActive}) =>
                    `${styles.link} ${isActive ? styles.activeLink : ''}`
                }
            >
                <Icon className={styles.icon}/>
                <span
                    className={`${styles.label} ${isCollapsed ? styles.labelHidden : ''}`}
                >
                    {label}
                </span>
            </NavLink>
        </li>
    );
};

SidebarItem.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    isCollapsed: PropTypes.bool
};

export default SidebarItem;