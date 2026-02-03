// src/components/ui/button.jsx
export function Button({ children, type = "button", className = "", ...props }) {
  return (
    <button
      type={type}
      className={`
        w-full px-6 py-3
        bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800
        text-white font-bold uppercase tracking-wider
        rounded-xl
        shadow-md hover:shadow-xl
        transform transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.02]
        focus:outline-none focus:ring-4 focus:ring-blue-300
        active:scale-95
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}