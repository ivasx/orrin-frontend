import logo from "/orrin-logo.svg";
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import SearchForm from "./SearchForm/SearchForm.jsx";
import {useTranslation} from "react-i18next";
import Button from "../../UI/Button/Button";
import styles from "./Header.module.css";
import {logger} from '../../../utils/logger.js';
import {Search} from 'lucide-react';

export default function Header({user, onLogout, onMenuToggle, showMenuButton = true}) {
    const {t} = useTranslation();
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.overflow = mobileSearchOpen ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [mobileSearchOpen]);

    const handleSearchSubmit = (query) => {
        logger.log("Search submitted with query:", query);
        setMobileSearchOpen(false);

        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.left}>
                    {showMenuButton && (
                        <button
                            className={styles.menuToggle}
                            type="button"
                            onClick={onMenuToggle}
                            aria-label={t('open_menu')}
                        >
                            <span className={styles.navbarTogglerIcon}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button>
                    )}

                    <div
                        className={styles.logoWrapper}
                        onClick={() => navigate('/')}
                    >
                        <img src={logo} alt="Orrin Logo" className={styles.logo} width="49" height="47"/>
                        <span className={styles.siteName}>Orrin</span>
                    </div>
                </div>

                <div className={styles.searchDesktop}>
                    <SearchForm onSubmit={handleSearchSubmit}/>
                </div>

                <div className={styles.right}>
                    <button
                        className={styles.searchToggle}
                        onClick={() => setMobileSearchOpen(true)}
                        aria-label={t('open_search')}
                    >
                        <Search/>
                    </button>

                    {user ? (
                        <>
                            <span className={styles.username}>{user.username}</span>
                            <Button
                                variant="outline"
                                className={styles.logoutBtn}
                                onClick={onLogout}
                            >
                                {t('logout')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                className={styles.registerBtn}
                                onClick={() => navigate('/register')}
                            >
                                {t('register')}
                            </Button>

                            <Button
                                variant="primary"
                                className={styles.loginBtn}
                                onClick={() => navigate('/login')}
                            >
                                {t('login')}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {mobileSearchOpen && (
                <div className={`${styles.mobileSearch} ${styles.mobileSearchOpen}`}>
                    <div className={styles.mobileSearchContainer}>
                        <SearchForm
                            onSubmit={handleSearchSubmit}
                            onBack={() => setMobileSearchOpen(false)}
                        />
                    </div>
                </div>
            )}
        </header>
    );
}