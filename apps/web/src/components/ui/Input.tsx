import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`
            h-11 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900
            focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all
            placeholder:text-gray-400
            ${icon ? 'pl-10 pr-3' : 'px-3'}
            ${error ? 'border-error focus:ring-error/20 focus:border-error' : ''}
            ${className}
          `.trim()}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
};

export const Select: React.FC<SelectProps> = ({ label, children, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`
          h-11 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 px-3
          focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all
          cursor-pointer appearance-none
          ${error ? 'border-error focus:ring-error/20 focus:border-error' : ''}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
};
