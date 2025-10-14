import logo from "/orrin-logo.svg";
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import SearchForm from "./SearchForm/SearchForm.jsx";
import "./Header.css";
import {useTranslation} from "react-i18next";


export default function Header({user, onLogout, onSearch, onMenuToggle}) {
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
        if (onSearch) onSearch(query);
        setMobileSearchOpen(false);
    };

    return (
        <header className="header">
            <div className="header__container">
                <div className="header__left">
                    <button
                        className="menu-toggle"
                        type="button"
                        onClick={onMenuToggle}
                        aria-label="Відкрити меню"
                    >
                        <span className="navbar-toggler-icon-custom">
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </button>

                    <div className="logo-wrapper">
                        <img src={logo} alt="Orrin Logo" className="logo" width="49" height="47"/>
                        <span className="site-name">Orrin</span>
                    </div>
                </div>

                <div className="header__search-desktop">
                    <SearchForm onSubmit={handleSearchSubmit}/>
                </div>

                <div className="header__right">
                    <button
                        className="search-toggle"
                        onClick={() => setMobileSearchOpen(true)}
                        aria-label="Відкрити пошук"
                    >
                        <svg className="search-icon" viewBox="0 0 24 24">
                            <path
                                d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                                fill="none" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>



                    {user ? (
                        <>
                            <span className="username">{user.username}</span>
                            <button className="btn-outline-light" onClick={onLogout}>
                                {t('logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <span
                                className="register-text"
                                onClick={() => navigate('/register')}
                            >
                                {t('register')}
                            </span>
                            <button
                                className="btn-primary-custom"
                                onClick={() => navigate('/login')}
                            >
                                {t('login')}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {mobileSearchOpen && (
                <div className="mobile-search open">
                    <div className="mobile-search__container">
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