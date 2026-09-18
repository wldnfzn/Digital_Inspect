import React from 'react';

type BadgeVariant = 'healthy' | 'good' | 'attention' | 'critical' | 'scheduled' | 'completed' | 'inactive' | 'info' | 'create' | 'update' | 'delete' | 'login';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  healthy:   { bg: 'bg-success-container', text: 'text-on-success-container', border: 'border-success/20', dot: 'bg-success' },
  good:      { bg: 'bg-success-container', text: 'text-on-success-container', border: 'border-success/20', dot: 'bg-success' },
  completed: { bg: 'bg-success-container', text: 'text-on-success-container', border: 'border-success/20', dot: 'bg-success' },
  create:    { bg: 'bg-success-container', text: 'text-on-success-container', border: 'border-success/20', dot: 'bg-success' },
  attention: { bg: 'bg-warning-container', text: 'text-on-warning-container', border: 'border-warning/20', dot: 'bg-warning' },
  critical:  { bg: 'bg-error-container',   text: 'text-on-error-container',   border: 'border-error/20',   dot: 'bg-error' },
  delete:    { bg: 'bg-error-container',   text: 'text-on-error-container',   border: 'border-error/20',   dot: 'bg-error' },
  scheduled: { bg: 'bg-primary-container', text: 'text-on-primary-container', border: 'border-primary/20', dot: 'bg-primary' },
  info:      { bg: 'bg-primary-container', text: 'text-on-primary-container', border: 'border-primary/20', dot: 'bg-primary' },
  update:    { bg: 'bg-primary-container', text: 'text-on-primary-container', border: 'border-primary/20', dot: 'bg-primary' },
  login:     { bg: 'bg-gray-100',          text: 'text-gray-700',             border: 'border-gray-200',    dot: 'bg-gray-500' },
  inactive:  { bg: 'bg-gray-100',          text: 'text-gray-600',             border: 'border-gray-200',    dot: 'bg-gray-400' },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge: React.FC<BadgeProps> = ({ variant, children, dot = false, size = 'md', className = '' }) => {
  const style = variantStyles[variant] || variantStyles.inactive;

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-semibold border
      ${style.bg} ${style.text} ${style.border}
      ${sizeClasses[size]}
      ${className}
    `.trim()}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {children}
    </span>
  );
};
