import React from 'react';

const Input = ({ 
  label, 
  id, 
  type = 'text', 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-sm ${className}`}>
      {label && (
        <label htmlFor={id} className="font-semibold text-[#0f172a] dark:text-[#f8fafc] text-[1rem]">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`
          w-full p-4 text-[1.1rem] rounded-[12px] bg-white dark:bg-[#0f172a] 
          border-2 transition-all duration-200 min-h-[52px]
          ${error ? 'border-[#ef4444]' : 'border-[#e2e8f0] dark:border-[#1e293b]'}
          focus:outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.2)]
        `}
        {...props}
      />
      {error && (
        <span className="text-[#ef4444] text-sm animate-fade-in font-medium">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
