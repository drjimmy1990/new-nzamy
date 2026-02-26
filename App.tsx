import * as React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Services from './components/Services';
import Stats from './components/Stats';
import Clients from './components/Clients';
import Founders from './components/Founders';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CountryProvider } from './contexts/CountryContext';
import { AuthProvider } from './contexts/AuthContext';

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import TeamMemberPage from './components/TeamMemberPage';

// Pages
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import PageRenderer from './pages/PageRenderer';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';

const Layout = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
    <Header />
    <Outlet />
    <Footer />
    <FloatingActions />
  </div>
);

const HomePage = () => (
  <>
    <Hero />
    <Features />
    <Services />
    <Stats />
    <Clients />
    <Founders />
  </>
);

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CountryProvider>
            <LanguageProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/team/:slug" element={<TeamMemberPage />} />

                  {/* Public Content Pages */}
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/page/:slug" element={<PageRenderer />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                </Route>
              </Routes>
            </LanguageProvider>
          </CountryProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;