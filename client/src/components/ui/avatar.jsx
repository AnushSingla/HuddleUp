// client/src/components/ui/avatar.jsx

import * as React from "react";

export function Avatar({ className = "", children }) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = "avatar" }) {
  return (
    <img
      className="aspect-square h-full w-full object-cover"
      src={src}
      alt={alt}
    />
  );
}

export function AvatarFallback({ children }) {
  return (
    <span className="flex h-full w-full items-center justify-center bg-gray-300 text-sm font-medium text-gray-600">
      {children}
    </span>
  );
}
