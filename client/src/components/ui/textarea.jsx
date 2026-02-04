import React from 'react';

const Textarea = ({ value, onChange, placeholder, className = '', ...props }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        w-full min-h-[120px] 
        px-5 py-4
        bg-slate-900/80 text-white placeholder-slate-500
        border border-slate-700 rounded-xl
        backdrop-blur-sm
        resize-y
        focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
        focus:bg-slate-900
        hover:border-slate-600 hover:bg-slate-800/90
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
};

export default Textarea;