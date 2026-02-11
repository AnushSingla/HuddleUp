import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Explore from './pages/Explore';
import EditVideo from './pages/EditVideo';
import Friends from './pages/Friends';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AllPosts from './components/AllPosts';
import CreatePost from './components/CreatePost';

function AppContent() {
  const location = useLocation();
  const hideLayout = location.pathname === '/login' || location.pathname === '/register';

  // Auth pages: full width, no container constraints
  if (hideLayout) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    );
  }

  // Main app: wrapped in container
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/edit-video" element={<EditVideo />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/posts" element={<AllPosts />} />
            <Route path="/create-post" element={<CreatePost />} />
          </Routes>
        </div>
      </main>
      <Footer />
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