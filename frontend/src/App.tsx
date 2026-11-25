import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import MoviePage from './pages/MoviePage';
import MovieDetailPage from './pages/MovieDetailPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StyleguidePage from './pages/StyleguidePage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { GuestRoute } from './components/auth/GuestRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<LandingPage />} />
          {/* Public: browsing the catalog needs no account; ranking a film will. */}
          <Route path="/movies" element={<MoviePage />} />
          {/* Public too: a film page only reads. Viewing never stores the film; reviewing does. */}
          <Route path="/movies/:tmdbId" element={<MovieDetailPage />} />
          {/* Public: searching only reads TMDB through the backend's cache. */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/styleguide" element={<StyleguidePage />} />
          {/* Signed-out only: a signed-in user is sent on instead of seeing these */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          {/* Pages that need a signed-in user go inside, e.g.
              <Route path="/watchlist" element={<WatchlistPage />} /> */}
          <Route element={<ProtectedRoute />}>
          </Route>
          {/* Catch-all: React Router ranks routes by specificity, so "*" only wins when nothing else matches */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
