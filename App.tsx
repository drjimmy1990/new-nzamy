import * as React from 'react';
import { Suspense } from 'react';
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

// Lazy-loaded pages (code-splitting)
const TeamMemberPage = React.lazy(() => import('./components/TeamMemberPage'));
const BlogList = React.lazy(() => import('./pages/BlogList'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const PageRenderer = React.lazy(() => import('./pages/PageRenderer'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Community = React.lazy(() => import('./pages/Community'));

// Dashboard
import RequireAuth from './components/auth/RequireAuth';
import DashboardLayout from './components/dashboard/DashboardLayout';

// Lazy-loaded dashboards
const IndividualDashboard = React.lazy(() => import('./pages/dashboard/seeker/IndividualDashboard'));
const CompanyDashboard = React.lazy(() => import('./pages/dashboard/seeker/CompanyDashboard'));
const GovernmentDashboard = React.lazy(() => import('./pages/dashboard/seeker/GovernmentDashboard'));
const NgoDashboard = React.lazy(() => import('./pages/dashboard/seeker/NgoDashboard'));
const LawFirmDashboard = React.lazy(() => import('./pages/dashboard/provider/LawFirmDashboard'));
const LawyerDashboard = React.lazy(() => import('./pages/dashboard/provider/LawyerDashboard'));
const TraineeDashboard = React.lazy(() => import('./pages/dashboard/provider/TraineeDashboard'));
const NotaryDashboard = React.lazy(() => import('./pages/dashboard/provider/NotaryDashboard'));
const MarriageDashboard = React.lazy(() => import('./pages/dashboard/provider/MarriageDashboard'));
const ArbitratorDashboard = React.lazy(() => import('./pages/dashboard/provider/ArbitratorDashboard'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-[#C8A762] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Public Layout with Header + Footer
const PublicLayout = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
    <Header />
    <main>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
    <FloatingActions />
  </div>
);

// Home Page
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

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <CountryProvider>
          <AuthProvider>
            <Router>
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
                  <Route path="/community" element={<Community />} />
                </Route>

                {/* ── Dashboard Routes (authenticated, no Header/Footer) ── */}
                <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                  {/* Seeker Dashboards */}
                  <Route path="/dashboard/seeker/individual" element={<Suspense fallback={<PageLoader />}><IndividualDashboard /></Suspense>} />
                  <Route path="/dashboard/seeker/company" element={<Suspense fallback={<PageLoader />}><CompanyDashboard /></Suspense>} />
                  <Route path="/dashboard/seeker/government" element={<Suspense fallback={<PageLoader />}><GovernmentDashboard /></Suspense>} />
                  <Route path="/dashboard/seeker/ngo" element={<Suspense fallback={<PageLoader />}><NgoDashboard /></Suspense>} />

                  {/* Provider Dashboards */}
                  <Route path="/dashboard/provider/independent_lawyer" element={<Suspense fallback={<PageLoader />}><LawyerDashboard /></Suspense>} />
                  <Route path="/dashboard/provider/law_firm" element={<Suspense fallback={<PageLoader />}><LawFirmDashboard /></Suspense>} />
                  <Route path="/dashboard/provider/trainee_lawyer" element={<Suspense fallback={<PageLoader />}><TraineeDashboard /></Suspense>} />
                  <Route path="/dashboard/provider/notary" element={<Suspense fallback={<PageLoader />}><NotaryDashboard /></Suspense>} />
                  <Route path="/dashboard/provider/marriage_official" element={<Suspense fallback={<PageLoader />}><MarriageDashboard /></Suspense>} />
                  <Route path="/dashboard/provider/arbitrator" element={<Suspense fallback={<PageLoader />}><ArbitratorDashboard /></Suspense>} />
                </Route>
              </Routes>
            </Router>
          </AuthProvider>
        </CountryProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;