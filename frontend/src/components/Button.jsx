import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const baseStyle = "flex items-center justify-center font-bold transition-all duration-200 cursor-pointer outline-none";
  
  // Custom styles mimicking the CSS variables we defined in index.css
  const styles = {
    primary: "bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-2 border-transparent hover:translate-y-[-2px] hover:shadow-md",
    secondary: "bg-[#0f172a] hover:bg-[#1e293b] text-white border-2 border-transparent hover:translate-y-[-2px] hover:shadow-md",
    outline: "bg-transparent hover:bg-black/5 text-[#0f172a] border-2 border-[#e2e8f0]"
  };

  return (
    <button
      type={type}
      className={`
        ${baseStyle} 
        ${styles[variant]} 
        rounded-[12px] px-6 py-4 min-h-[52px] min-w-[52px] text-[1.1rem] 
        ${isLoading ? 'opacity-70 pointer-events-none' : ''} 
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Memproses...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
