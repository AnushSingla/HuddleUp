// src/components/ui/card.jsx
import clsx from 'clsx';

export function Card({ children, className }) {
  return (
    <div className={`rounded-xl dark:bg-slate-900 bg-white p-6 shadow-xl dark:shadow-black/20 shadow-slate-200/60 dark:ring-1 ring-1 dark:ring-white/10 ring-slate-200/80 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={clsx('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h2 className={clsx('text-xl font-bold dark:text-white text-slate-900', className)}>{children}</h2>;
}

export function CardDescription({ children, className }) {
  return <p className={clsx('text-sm dark:text-slate-400 text-slate-600', className)}>{children}</p>;
}

export function CardContent({ children, className }) {
  return <div className={clsx('mt-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div className={clsx('mt-6 border-t dark:border-slate-800 border-slate-200 pt-4 text-sm dark:text-slate-500 text-slate-500', className)}>
      {children}
    </div>
  );
}