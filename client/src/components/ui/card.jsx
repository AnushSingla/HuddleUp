// src/components/ui/card.jsx
import clsx from 'clsx';

export function Card({ children, className }) {
  return (
    <div className={`rounded-xl bg-slate-900 p-6 shadow-xl shadow-black/20 ring-1 ring-white/10 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={clsx('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h2 className={clsx('text-xl font-bold text-white', className)}>{children}</h2>;
}

export function CardDescription({ children, className }) {
  return <p className={clsx('text-sm text-slate-400', className)}>{children}</p>;
}

export function CardContent({ children, className }) {
  return <div className={clsx('mt-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div className={clsx('mt-6 border-t border-slate-800 pt-4 text-sm text-slate-500', className)}>
      {children}
    </div>
  );
}