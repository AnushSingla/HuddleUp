// client/src/utils/url.js
/**
 * Utility to construct asset URLs (videos, images, etc.)
 * based on the API base URL.
 */
export const getAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    const apiUrl = import.meta.env.VITE_API_URL ;
    // Extracts the protocol + domain + port (e.g., http://localhost:5000)
    const baseUrl = apiUrl.replace(/\/api$/, '');

    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
