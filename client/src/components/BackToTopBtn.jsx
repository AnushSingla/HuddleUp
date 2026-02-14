import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    visible && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-24 right-6 md:bottom-8 flex items-center gap-2 px-3 py-3 rounded-full 
                   bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-400 
                   text-white shadow-lg backdrop-blur-md 
                   transition-all duration-300 ease-in-out 
                   hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-purple-500 
                   z-40 cursor-pointer"
        aria-label="Back to top"
      >
        <ChevronUp strokeWidth={3} absoluteStrokeWidth className="w-6 h-6 hover:scale-110 hover:animate-pulse"/>
      </button>
    )
  );
}