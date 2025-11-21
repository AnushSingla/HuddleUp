import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import { Toaster } from "@/components/ui/sonner";
import Navbar from './components/Navbar';
import Upload from './pages/Upload';
import Explore from './pages/Explore';
import AllPosts from "./components/AllPosts";
import CreatePost from "./components/CreatePost";
import Friends from './pages/Friends';
import Footer from "./components/Footer";

function AppContent() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/posts" element={<AllPosts />} />
          <Route path="/create-post" element={<CreatePost />} />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <>
      <Router>
        <AppContent />
      </Router>
      <Toaster richColors position="top-center" />
    </>
  );
}
