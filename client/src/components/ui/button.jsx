// src/components/ui/button.jsx
export function Button({ children, type = "button", className = "", ...props }) {
  return (
    <button
      type={type}
      className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
