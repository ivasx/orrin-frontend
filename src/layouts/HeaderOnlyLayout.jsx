import {Outlet} from 'react-router-dom';
import Header from '../components/Layout/Header/Header.jsx';


export default function HeaderOnlyLayout() {
    return (
        <div className="AppContainer">
            <Header/>
            <main className="main-wrapper main-wrapper--full-page">
                <Outlet/>
            </main>
        </div>
    );
}