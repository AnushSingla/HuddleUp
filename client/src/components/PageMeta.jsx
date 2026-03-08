import { useEffect } from 'react';

const SITE_NAME = 'HuddleUp';
const DEFAULT_DESCRIPTION = 'Sports moments, debate, and community. Share highlights and connect with fans.';

/**
 * Sets page-specific document title and meta tags for SEO and link previews.
 * Use on each route so shared links and search results show the right context.
 *
 * @param {string} [title] - Page title (will be suffixed with " – HuddleUp")
 * @param {string} [description] - Meta description and og:description
 * @param {string} [image] - Full URL for og:image / twitter:image (optional)
 * @param {boolean} [noIndex] - If true, adds robots noindex,nofollow
 */
export function PageMeta({ title, description = DEFAULT_DESCRIPTION, image, noIndex = false }) {
  const fullTitle = title ? `${title} – ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESCRIPTION;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', desc);

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', desc, true);
    setMeta('og:type', 'website', true);
    if (image) {
      setMeta('og:image', image, true);
    }

    // Twitter Card
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    if (image) {
      setMeta('twitter:image', image);
    }

    if (noIndex) {
      setMeta('robots', 'noindex,nofollow');
    }

    return () => {
      // Reset to default on unmount (optional; next page will set its own)
      document.title = SITE_NAME;
    };
  }, [fullTitle, desc, image, noIndex]);

  return null;
}

export default PageMeta;
