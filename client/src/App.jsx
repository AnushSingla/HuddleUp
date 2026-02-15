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
import Feedback from './pages/Feedback';


// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AllPosts from './components/AllPosts';
import CreatePost from './components/CreatePost';
import BackToTopBtn from './components/BackToTopBtn';

function AppContent() {
  const location = useLocation();
  const hideLayout = location.pathname === '/login' || location.pathname === '/register';

  // Auth pages: full width, no container constraints
  if (hideLayout) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  // Main app: wrapped in container
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/edit-video" element={<EditVideo />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/posts" element={<AllPosts />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/feedback" element={<Feedback />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
      <BackToTopBtn />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
      <Toaster richColors position="top-center" />
    </Router>
  );
}