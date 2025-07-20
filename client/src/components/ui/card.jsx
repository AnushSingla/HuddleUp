// src/components/ui/card.jsx
import clsx from 'clsx';

export function Card({ children, className }) {
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="mb-2">{children}</div>;
}

export function CardTitle({ children }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function CardDescription({ children }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}

export function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}

export const CardFooter = ({ children, className }) => (
  <div className={clsx('mt-4 border-t pt-2 text-sm text-muted-foreground', className)}>
    {children}
  </div> )