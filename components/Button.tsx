import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-200 focus:outline-none focus-visible:ring-4 disabled:opacity-45 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-[#0f766e] text-white shadow-[0_10px_24px_rgba(15,118,110,0.22)] hover:bg-[#0b615b] hover:-translate-y-0.5 focus-visible:ring-teal-200",
    secondary: "bg-white text-[#17324d] border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-200",
    danger: "bg-rose-600 text-white shadow-[0_10px_24px_rgba(225,29,72,0.18)] hover:bg-rose-700 hover:-translate-y-0.5 focus-visible:ring-rose-200"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

