import styles from './TabNav.module.css';

export default function TabNav({tabs, activeTab, onTabChange, sticky = true, className = ''}) {
    return (
        <nav
            className={`${styles.nav} ${sticky ? styles.sticky : ''} ${className}`}
            role="tablist"
        >
            {tabs.map(({id, label, icon: Icon}) => (
                <button
                    key={id}
                    role="tab"
                    aria-selected={activeTab === id}
                    className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
                    onClick={() => onTabChange(id)}
                >
                    {Icon && <Icon size={15} aria-hidden="true"/>}
                    {label}
                </button>
            ))}
        </nav>
    );
}