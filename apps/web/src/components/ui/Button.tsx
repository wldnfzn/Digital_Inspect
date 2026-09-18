import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary hover:bg-blue-700 text-white shadow-sm',
  secondary: 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm',
  destructive: 'bg-error hover:bg-red-700 text-white shadow-sm',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  outline: 'bg-transparent border border-primary text-primary hover:bg-primary/5',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-lg',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-[14px]',
  md: 'text-[18px]',
  lg: 'text-[20px]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium transition-all cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className={`material-symbols-outlined animate-spin ${iconSizeClasses[size]}`}>progress_activity</span>
      ) : (
        icon && iconPosition === 'left' && (
          <span className={`material-symbols-outlined ${iconSizeClasses[size]}`}>{icon}</span>
        )
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className={`material-symbols-outlined ${iconSizeClasses[size]}`}>{icon}</span>
      )}
    </button>
  );
};
