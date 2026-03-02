import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Explore from './pages/Explore';
import EditVideo from './pages/EditVideo';
import Friends from './pages/Friends';
import Contact from './pages/Contact';
import About from './pages/About';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Feedback from './pages/Feedback';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contributor from './pages/Contributor';
import TermsOfService from './pages/TermsOfService';
import PublicProfile from './pages/PublicProfile';
import Saved from './pages/Saved';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Admin from './pages/Admin';
import LiveMatchRooms from './pages/LiveMatchRooms';
import CommunityGuidelines from './pages/CommunityGuidelines';
import Analytics from './pages/Analytics';
import Search from './pages/Search';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AllPosts from './components/AllPosts';
import CreatePost from './components/CreatePost';
import BackToTopBtn from './components/BackToTopBtn';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';

function AppContent() {
  const location = useLocation();
  const hideLayout = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  // Auth pages: full width, no container constraints
  if (hideLayout) {
    return (
      <div className="min-h-screen dark:bg-zinc-950 bg-transparent">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  // Main app: wrapped in container
  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-transparent flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/edit-video" element={<EditVideo />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/user/:userId" element={<PublicProfile />} />
            <Route path="/posts" element={<AllPosts />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contributors" element={<Contributor />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/community-guidelines" element={<CommunityGuidelines />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/live-match" element={<LiveMatchRooms />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <BackToTopBtn />
    </div>
  );
}

import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <Router>
      <ErrorBoundary
        fallback={({ resetErrorBoundary }) => (
          <ErrorFallback resetErrorBoundary={resetErrorBoundary} />
        )}
      >
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ErrorBoundary>
      <Toaster richColors position="top-center" closeButton />
    </Router>
  );
}