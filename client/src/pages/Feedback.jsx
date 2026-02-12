import React, { useState, useRef } from "react";
import {
  User,
  Mail,
  FileText,
  MessageSquare,
  CheckCircle,
  Star,
} from "lucide-react";

const Feedback = () => {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const cardRef = useRef(null);

  // ⭐ Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
    }, 3000);
  };

  // 🧊 3D Tilt Effect
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y - rect.height / 2) / rect.height) * 10;
    const rotateY = ((x - rect.width / 2) / rect.width) * 10;

    card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const resetTilt = () => {
    cardRef.current.style.transform =
      "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden px-6 py-16">

      {/* Floating Gradient Blobs */}
      <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse"></div>

      {/* Glass Neon Card */}
      <div className="relative w-full max-w-xl perspective-1000">

        {/* Neon Border */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 blur opacity-40 animate-[spin_6s_linear_infinite]"></div>

        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          className="relative bg-gray-800/70 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-10 transition-transform duration-200"
          style={{ transformStyle: "preserve-3d" }}
        >

          {/* Header */}
          <h2 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Share Your Feedback
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <InputBox icon={<User className="text-cyan-400" />} placeholder="Your Name" />

            {/* Email */}
            <InputBox icon={<Mail className="text-blue-400" />} placeholder="Your Email" type="email" />

            {/* Subject */}
            <InputBox icon={<FileText className="text-purple-400" />} placeholder="Subject" />

            {/* Message */}
            <div className="group bg-gray-900/70 border border-gray-700 rounded-xl p-4 flex items-start gap-4 transition-all duration-300 hover:border-pink-400 hover:shadow-pink-500/20 hover:shadow-lg">
              <MessageSquare className="text-pink-400 mt-1 group-hover:scale-110 transition" />
              <textarea
                rows={4}
                placeholder="Write your feedback..."
                required
                className="w-full bg-transparent outline-none text-white placeholder-gray-500 resize-none"
              />
            </div>

            {/* ⭐ Rating Stars */}
            <div className="flex justify-center gap-3 mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={30}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer transition-all duration-200 ${
                    (hover || rating) >= star
                      ? "text-yellow-400 fill-yellow-400 scale-125 drop-shadow-lg"
                      : "text-gray-500"
                  }`}
                />
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-lg text-white
              bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600
              hover:from-purple-600 hover:via-blue-600 hover:to-cyan-500
              transition-all duration-500
              transform hover:scale-[1.03]
              shadow-lg hover:shadow-cyan-500/40"
            >
              Send Feedback 🚀
            </button>

          </form>
        </div>
      </div>

      {/* Success Modal */}
      {submitted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 border border-green-500 rounded-2xl p-8 text-center shadow-2xl animate-scaleIn">
            <CheckCircle className="text-green-400 w-14 h-14 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Feedback Sent!
            </h3>
            <p className="text-gray-400">
              You rated us {rating} ⭐ — Thank you! 🚀
            </p>
          </div>
        </div>
      )}

      {/* Custom Animation */}
      <style>
        {`
          @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out forwards;
          }
        `}
      </style>

    </div>
  );
};

// Reusable Input Component
const InputBox = ({ icon, placeholder, type = "text" }) => (
  <div className="group bg-gray-900/70 border border-gray-700 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:border-cyan-400 hover:shadow-cyan-500/20 hover:shadow-lg">
    {icon}
    <input
      type={type}
      placeholder={placeholder}
      required
      className="w-full bg-transparent outline-none text-white placeholder-gray-500"
    />
  </div>
);

export default Feedback;
