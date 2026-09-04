
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-white hover:text-gray-300">
                    🎬 Verdix
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/movies" className="text-gray-400 hover:text-white transition-colors">
                        Movies
                    </Link>
                    <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Login
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;