import { Outlet } from 'react-router-dom';
import Header from '../components/Layout/Header/Header.jsx';

export default function HeaderOnlyLayout() {
    return (
        <>
            <Header showMenuButton={false} />

            <main style={{ paddingTop: 'var(--header-height, 64px)' }}>
                <Outlet />
            </main>
        </>
    );
}