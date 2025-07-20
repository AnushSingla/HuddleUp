// src/components/ui/input.jsx
export function Input({ type = "text", className = "", ...props }) {
  return (
    <input
      type={type}
      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
