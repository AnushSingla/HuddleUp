import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from "@/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Trophy, Users, Zap } from "lucide-react";
import { toast } from 'sonner';

const features = [
  { icon: Trophy, text: "Follow live match scores & highlights" },
  { icon: Users,  text: "Connect with sports fans worldwide" },
  { icon: Zap,    text: "Share and discuss moments in real time" },
];

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("auth/login", form);
      localStorage.setItem("token", res.data.token);
      toast.success("Welcome back to HuddleUp!");
      navigate("/");
    } catch (err) {
      const errorMsg =
        typeof err.response?.data === 'string'
          ? err.response.data
          : (err.response?.data?.message || "Login failed. Invalid credentials.");
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#080a14" }}>

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0c0e1f 0%, #0f1528 40%, #0b1933 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Glow orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[340px] h-[340px] rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)" }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
               style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-wide">HuddleUp</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-8 max-w-sm">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                 style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              10,000+ fans online now
            </div>
            <h2 className="text-[2.6rem] font-extrabold text-white leading-[1.15] tracking-tight">
              Your sports<br />
              community{" "}
              <span style={{ background: "linear-gradient(90deg,#00e5ff,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                awaits.
              </span>
            </h2>
            <p className="text-gray-400 text-[0.92rem] leading-relaxed">
              Join thousands of fans who discuss, share, and celebrate
              the sports moments that matter most.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-gray-700 text-xs">
          © {new Date().getFullYear()} HuddleUp · All rights reserved
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        style={{ background: "#080a14" }}
      >
        {/* Glass card */}
        <div
          className="w-full max-w-[400px] rounded-2xl p-8 space-y-6"
          style={{
            background: "rgba(20,24,40,0.85)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                 style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">HuddleUp</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h1>
            <p className="text-gray-500 text-sm">Sign in to continue to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider"
                     style={{ color: "#6b7280" }}>
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                      style={{ color: "#9ca3af" }} />
                <Input
                  id="email" type="email" placeholder="you@example.com" autoComplete="email"
                  className="w-full pl-10 pr-4 h-11 rounded-xl text-sm
                             text-white placeholder:text-gray-600
                             focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider"
                       style={{ color: "#6b7280" }}>
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-medium hover:underline"
                  style={{ color: "#60a5fa" }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                      style={{ color: "#9ca3af" }} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 h-11 rounded-xl text-sm
                             text-white placeholder:text-gray-600
                             focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 focus:outline-none
                             transition-colors duration-150"
                  style={{ color: "#9ca3af" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white
                         disabled:opacity-50 transition-all duration-200 mt-1"
              style={{
                background: isLoading
                  ? "#1d4ed8"
                  : "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)",
                boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs" style={{ color: "#374151" }}>or</span>
            <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Register CTA */}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full h-11 rounded-xl text-sm font-semibold
                       text-gray-300 hover:text-white
                       transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
          >
            Create a new account
          </button>

          {/* Legal */}
          <p className="text-center text-[11px]" style={{ color: "#374151" }}>
            By signing in you agree to our{" "}
            <button onClick={() => navigate("/terms")}
                    className="underline hover:text-blue-400 transition-colors"
                    style={{ color: "#4b5563" }}>Terms</button>
            {" "}&{" "}
            <button onClick={() => navigate("/privacy")}
                    className="underline hover:text-blue-400 transition-colors"
                    style={{ color: "#4b5563" }}>Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
}
