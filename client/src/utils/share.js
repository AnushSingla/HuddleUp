/**
 * Build shareable URL for a post or video.
 * @param {'post'|'video'} type
 * @param {string} id - post _id or video _id
 * @returns {string} full URL
 */
export function getShareUrl(type, id) {
  const origin = window.location.origin;
  if (type === 'post') return `${origin}/posts?post=${id}`;
  if (type === 'video') return `${origin}/explore?video=${id}`;
  return origin;
}

/**
 * Copy URL to clipboard and show success/error via callbacks.
 * @param {string} url - full URL to copy
 * @param {(msg: string) => void} onSuccess - e.g. toast.success('Link copied!')
 * @param {(msg: string) => void} onError - e.g. toast.error
 */
export async function copyLinkToClipboard(url, onSuccess, onError) {
  try {
    await navigator.clipboard.writeText(url);
    onSuccess?.('Link copied!');
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      onSuccess?.('Link copied!');
    } catch (e) {
      onError?.('Could not copy link');
    }
    document.body.removeChild(textarea);
  }
}

/**
 * Share content: use Web Share API if available, else copy link to clipboard.
 * @param {string} url - full URL to share
 * @param {string} title - title for share dialog
 * @param {string} [text] - optional text for share
 * @param {(msg: string) => void} onCopy - callback when link is copied (e.g. toast)
 * @param {(msg: string) => void} onError - callback on error
 */
export async function shareLink(url, title, text = '', onCopy, onError) {
  const fallbackCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      onCopy?.('Link copied to clipboard');
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        onCopy?.('Link copied to clipboard');
      } catch (e) {
        onError?.('Could not copy link');
      }
      document.body.removeChild(textarea);
    }
  };

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: title || 'HuddleUp',
        text: text || '',
        url,
      });
      onCopy?.('Shared successfully');
    } catch (err) {
      if (err.name === 'AbortError') return;
      await fallbackCopy();
    }
  } else {
    await fallbackCopy();
  }
}
