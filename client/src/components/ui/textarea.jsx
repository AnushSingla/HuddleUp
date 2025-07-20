import React from 'react';

const Textarea = ({ value, onChange, placeholder, className = '', ...props }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border border-blue-200 focus:ring-green-300 min-h-[120px] p-3 rounded-lg outline-none focus:border-green-400 ${className}`}
      {...props}
    />
  );
};

export default Textarea;
