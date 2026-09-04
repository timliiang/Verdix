
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';

function Layout() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <main className="max-w-6xl mx-auto px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
