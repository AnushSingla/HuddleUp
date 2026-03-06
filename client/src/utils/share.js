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

/**
 * Share to Twitter/X
 * @param {string} url - video URL
 * @param {string} title - video title
 * @param {string} [description] - video description
 */
export function shareToTwitter(url, title, description = '') {
  const text = `${title}${description ? '\n\n' + description.substring(0, 100) : ''}\n\n`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank', 'width=550,height=420');
}

/**
 * Share to Facebook
 * @param {string} url - video URL
 */
export function shareToFacebook(url) {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'width=550,height=420');
}

/**
 * Share to WhatsApp
 * @param {string} url - video URL
 * @param {string} title - video title
 */
export function shareToWhatsApp(url, title) {
  const text = `Check out: ${title}\n${url}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Share to LinkedIn
 * @param {string} url - video URL
 * @param {string} title - video title
 */
export function shareToLinkedIn(url, title) {
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedinUrl, '_blank', 'width=550,height=420');
}

/**
 * Share via Email
 * @param {string} url - video URL
 * @param {string} title - video title
 * @param {string} [description] - video description
 */
export function shareViaEmail(url, title, description = '') {
  const subject = `Check out this video: ${title}`;
  const body = `${description}\n\nWatch here: ${url}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}
