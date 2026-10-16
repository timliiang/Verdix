import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import MoviePage from './pages/MoviePage';
import LoginPage from './pages/LoginPage';
import StyleguidePage from './pages/StyleguidePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<LandingPage />} />
          <Route path="/styleguide" element={<StyleguidePage />} />
          <Route element={<Layout />}>
            <Route path="/movies" element={<MoviePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
