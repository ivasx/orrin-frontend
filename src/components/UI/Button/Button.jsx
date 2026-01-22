import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';
import Spinner from '../Spinner/Spinner';

const Button = ({
                    children,
                    onClick,
                    type = 'button',
                    variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'icon'
                    size = 'medium',     // 'small', 'medium', 'large'
                    disabled = false,
                    isLoading = false,
                    icon = null,
                    className = '',      // To be able to add outer margins
                    ...props
                }) => {

    const buttonClasses = [
        styles.button,
        styles[variant],
        styles[size],
        isLoading ? styles.loading : '',
        className
    ].join(' ').trim();

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div style={{ transform: 'scale(0.8)' }}>
                    <Spinner />
                </div>
            ) : (
                <>
                    {icon && <span className={styles.iconElem}>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'icon']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    disabled: PropTypes.bool,
    isLoading: PropTypes.bool,
    icon: PropTypes.node,
    className: PropTypes.string,
};

export default Button;