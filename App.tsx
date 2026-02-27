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
import Signup from './pages/Signup';

// Dashboard
import RequireAuth from './components/auth/RequireAuth';
import DashboardLayout from './components/dashboard/DashboardLayout';

// Seeker Dashboards
import IndividualDashboard from './pages/dashboard/seeker/IndividualDashboard';
import CompanyDashboard from './pages/dashboard/seeker/CompanyDashboard';
import GovernmentDashboard from './pages/dashboard/seeker/GovernmentDashboard';
import NgoDashboard from './pages/dashboard/seeker/NgoDashboard';

// Provider Dashboards
import LawFirmDashboard from './pages/dashboard/provider/LawFirmDashboard';
import LawyerDashboard from './pages/dashboard/provider/LawyerDashboard';
import TraineeDashboard from './pages/dashboard/provider/TraineeDashboard';
import NotaryDashboard from './pages/dashboard/provider/NotaryDashboard';
import MarriageDashboard from './pages/dashboard/provider/MarriageDashboard';
import ArbitratorDashboard from './pages/dashboard/provider/ArbitratorDashboard';

// Public Layout with Header + Footer
const PublicLayout = () => (
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
                {/* ── Public Routes (with Header + Footer) ── */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/team/:slug" element={<TeamMemberPage />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/page/:slug" element={<PageRenderer />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>

                {/* ── Dashboard Routes (authenticated, no Header/Footer) ── */}
                <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                  {/* Seeker Dashboards */}
                  <Route path="/dashboard/seeker/individual/*" element={<IndividualDashboard />} />
                  <Route path="/dashboard/seeker/company/*" element={<CompanyDashboard />} />
                  <Route path="/dashboard/seeker/government/*" element={<GovernmentDashboard />} />
                  <Route path="/dashboard/seeker/ngo/*" element={<NgoDashboard />} />

                  {/* Provider Dashboards */}
                  <Route path="/dashboard/provider/law_firm/*" element={<LawFirmDashboard />} />
                  <Route path="/dashboard/provider/independent_lawyer/*" element={<LawyerDashboard />} />
                  <Route path="/dashboard/provider/trainee_lawyer/*" element={<TraineeDashboard />} />
                  <Route path="/dashboard/provider/notary/*" element={<NotaryDashboard />} />
                  <Route path="/dashboard/provider/marriage_official/*" element={<MarriageDashboard />} />
                  <Route path="/dashboard/provider/arbitrator/*" element={<ArbitratorDashboard />} />
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