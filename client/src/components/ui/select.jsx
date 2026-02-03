import React from 'react';

export function Select({ children, value, onValueChange, className = "", ...props }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="
          w-full appearance-none
          px-5 py-3 pr-10
          bg-slate-900/80 text-white
          border border-slate-700 rounded-xl
          backdrop-blur-sm
          cursor-pointer
          focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
          hover:border-slate-600 hover:bg-slate-800/90
          transition-all duration-300 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        {...props}
      >
        {children}
      </select>
      
      {/* Custom chevron icon */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 transition-transform duration-200" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export function SelectTrigger({ children, className = "", ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }) {
  return (
    <option value="" disabled hidden>
      {placeholder}
    </option>
  );
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem({ value, children, disabled = false }) {
  return (
    <option 
      value={value} 
      disabled={disabled}
      className="bg-slate-900 text-white py-2"
    >
      {children}
    </option>
  );
}