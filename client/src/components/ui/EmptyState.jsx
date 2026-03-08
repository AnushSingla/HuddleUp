import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable empty state: icon + title + description + optional CTA.
 * Use when a list (videos, posts, comments, search results) is empty.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  className = '',
}) {
  return (
    <div
      className={`text-center py-12 px-6 rounded-xl ${className}`}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {Icon && (
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-muted)',
          }}
        >
          <Icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
      )}
      <h3
        className="text-xl font-bold mb-2"
        style={{ color: 'var(--text-main)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-base mb-6 max-w-md mx-auto"
          style={{ color: 'var(--text-sub)' }}
        >
          {description}
        </p>
      )}
      {actionLabel && (actionHref || actionOnClick) && (
        <>
          {actionHref ? (
            <Link to={actionHref}>
              <button
                type="button"
                className="px-6 py-3 font-semibold rounded-lg transition-all hover:opacity-90"
                style={{
                  background: 'var(--turf-green)',
                  color: 'var(--bg-primary)',
                }}
              >
                {actionLabel}
              </button>
            </Link>
          ) : (
            <button
              type="button"
              onClick={actionOnClick}
              className="px-6 py-3 font-semibold rounded-lg transition-all hover:opacity-90"
              style={{
                background: 'var(--turf-green)',
                color: 'var(--bg-primary)',
              }}
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
