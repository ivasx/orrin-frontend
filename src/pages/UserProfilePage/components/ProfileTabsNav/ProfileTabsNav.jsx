import styles from './ProfileTabsNav.module.css';

export const ProfileTabsNav = ({ tabs, activeTab, onTabChange }) => {
    if (!tabs || tabs.length === 0) return null;

    return (
        <nav className={styles.tabsNav} aria-label="Profile navigation">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                    onClick={() => onTabChange(tab.id)}
                    aria-selected={activeTab === tab.id}
                    role="tab"
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
};