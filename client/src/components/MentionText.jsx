import React from 'react';
import { Link } from 'react-router-dom';

// URL pattern: http:// or https://, then non-whitespace (exclude angle brackets for safety)
const URL_REGEX = /(https?:\/\/[^\s<>]+)/g;

// Trim trailing punctuation from URL for href (e.g. "https://example.com." -> "https://example.com")
const cleanUrlHref = (url) => (url || '').replace(/[.,;?!)]+$/, '');

/**
 * Renders a segment that may contain @mentions and #hashtags (no URLs).
 */
function renderMentionAndHashtagSegment(segment, keyPrefix) {
    if (!segment) return null;
    const regex = /(@(\w+))|(#(\w+))/g;
    const parts = segment.split(regex);
    return (
        <>
            {parts.map((part, index) => {
                const mod = index % 5;
                const key = `${keyPrefix}-${index}`;
                if (mod === 0) return <span key={key}>{part}</span>;
                if (mod === 1 && part) {
                    const username = parts[index + 1];
                    return (
                        <Link
                            key={key}
                            to={`/user/${encodeURIComponent(username)}`}
                            className="text-primary font-bold hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </Link>
                    );
                }
                if (mod === 3 && part) {
                    const tag = parts[index + 1];
                    return (
                        <Link
                            key={key}
                            to={`/explore?search=${encodeURIComponent(tag)}`}
                            className="text-emerald-400 font-bold hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </Link>
                    );
                }
                return null;
            })}
        </>
    );
}

/**
 * MentionText component
 * - Converts raw http(s) URLs into clickable links (target="_blank", rel="noopener noreferrer").
 * - Wraps @username and #hashtag with in-app Link components.
 */
const MentionText = ({ text }) => {
    if (!text) return null;

    const segments = text.split(URL_REGEX);

    return (
        <>
            {segments.map((part, index) => {
                const isUrl = part && /^https?:\/\//.test(part);
                if (isUrl) {
                    const href = cleanUrlHref(part);
                    return (
                        <a
                            key={`url-${index}`}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 underline break-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </a>
                    );
                }
                return (
                    <React.Fragment key={`seg-${index}`}>
                        {renderMentionAndHashtagSegment(part, `seg-${index}`)}
                    </React.Fragment>
                );
            })}
        </>
    );
};

export default MentionText;
