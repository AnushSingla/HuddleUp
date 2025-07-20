import React from 'react';

export function Select({ children, value, onValueChange, ...props }) {
return (
<div className="relative">
<select
value={value}
onChange={(e) => onValueChange(e.target.value)}
className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-300"
{...props}
>
{children}
</select>
</div>
);
}

export function SelectTrigger({ children, ...props }) {
return (
<div {...props}>
{children}
</div>
);
}

export function SelectValue({ placeholder }) {
return (
<option value="" disabled hidden>
{placeholder}
</option>
);
}

export function SelectContent({ children }) {
return <>{children}</>;
}

export function SelectItem({ value, children }) {
return (
<option value={value}>
{children}
</option>
);
}