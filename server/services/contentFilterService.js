/**
 * Content Filter Service
 * Provides automated profanity and spam detection for content moderation.
 */

// Profanity word list with severity levels
const PROFANITY_LIST = {
    high: [
        'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy',
        'cunt', 'nigger', 'nigga', 'faggot', 'retard', 'whore', 'slut'
    ],
    medium: [
        'damn', 'hell', 'ass', 'crap', 'piss', 'cock', 'bollocks',
        'wanker', 'douche', 'twat', 'prick'
    ],
    low: [
        'idiot', 'stupid', 'dumb', 'moron', 'loser', 'suck', 'screw'
    ]
};

// Spam patterns
const SPAM_PATTERNS = {
    excessiveCaps: /[A-Z]{10,}/,
    repeatedChars: /(.)\1{5,}/,
    urlFlooding: /(https?:\/\/[^\s]+\s*){4,}/i,
    emailPattern: /[\w.+-]+@[\w-]+\.[\w.]+/gi,
    phonePattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    repeatedWords: /\b(\w+)\b(?:\s+\1\b){3,}/i
};

/**
 * Normalize text for comparison (handles common obfuscation)
 */
const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/[0@]/g, 'o')
        .replace(/[1!|]/g, 'i')
        .replace(/[3]/g, 'e')
        .replace(/[4@]/g, 'a')
        .replace(/[5$]/g, 's')
        .replace(/[7]/g, 't')
        .replace(/[8]/g, 'b')
        .replace(/[\s._\-*]+/g, '')
        .trim();
};

/**
 * Check text for profanity
 * @param {string} text - Text to check
 * @returns {{ found: boolean, severity: string, matches: string[] }}
 */
const checkProfanity = (text) => {
    const normalized = normalizeText(text);
    const words = text.toLowerCase().split(/\s+/);
    const matches = [];
    let maxSeverity = null;

    for (const [severity, wordList] of Object.entries(PROFANITY_LIST)) {
        for (const word of wordList) {
            // Check exact word match
            if (words.some(w => w.replace(/[^a-zA-Z]/g, '') === word)) {
                matches.push(word);
                if (!maxSeverity || severity === 'high' || (severity === 'medium' && maxSeverity === 'low')) {
                    maxSeverity = severity;
                }
            }
            // Check normalized text for obfuscated profanity
            if (normalized.includes(word.replace(/\s/g, ''))) {
                if (!matches.includes(word)) {
                    matches.push(word);
                    if (!maxSeverity || severity === 'high' || (severity === 'medium' && maxSeverity === 'low')) {
                        maxSeverity = severity;
                    }
                }
            }
        }
    }

    return {
        found: matches.length > 0,
        severity: maxSeverity,
        matches
    };
};

/**
 * Check text for spam patterns
 * @param {string} text - Text to check
 * @returns {{ isSpam: boolean, reasons: string[] }}
 */
const checkSpam = (text) => {
    const reasons = [];

    if (SPAM_PATTERNS.excessiveCaps.test(text)) {
        reasons.push("Excessive capitalization detected");
    }

    if (SPAM_PATTERNS.repeatedChars.test(text)) {
        reasons.push("Repeated characters detected");
    }

    if (SPAM_PATTERNS.urlFlooding.test(text)) {
        reasons.push("URL flooding detected");
    }

    if (SPAM_PATTERNS.repeatedWords.test(text)) {
        reasons.push("Repeated words/phrases detected");
    }

    // Check for very short or empty content
    if (text.trim().length < 2) {
        reasons.push("Content too short");
    }

    // Check for excessive special characters
    const specialCharRatio = (text.replace(/[a-zA-Z0-9\s]/g, '').length) / text.length;
    if (text.length > 10 && specialCharRatio > 0.5) {
        reasons.push("Excessive special characters detected");
    }

    return {
        isSpam: reasons.length > 0,
        reasons
    };
};

/**
 * Main content filter function - checks text for profanity and spam
 * @param {string} text - Text to filter
 * @returns {{ isClean: boolean, flagged: boolean, reasons: string[], severity: string|null }}
 */
const filterContent = (text) => {
    if (!text || typeof text !== 'string') {
        return { isClean: true, flagged: false, reasons: [], severity: null };
    }

    const profanityResult = checkProfanity(text);
    const spamResult = checkSpam(text);

    const reasons = [];
    let severity = null;

    if (profanityResult.found) {
        reasons.push(`Profanity detected: ${profanityResult.matches.length} match(es)`);
        severity = profanityResult.severity;
    }

    if (spamResult.isSpam) {
        reasons.push(...spamResult.reasons);
        if (!severity) severity = 'medium';
    }

    const flagged = reasons.length > 0;

    return {
        isClean: !flagged,
        flagged,
        reasons,
        severity
    };
};

/**
 * Filter multiple text fields at once (e.g., title + content)
 * @param {Object} fields - Object with field names as keys and text as values
 * @returns {{ isClean: boolean, flagged: boolean, reasons: string[], severity: string|null, fieldResults: Object }}
 */
const filterMultipleFields = (fields) => {
    const fieldResults = {};
    let worstSeverity = null;
    const allReasons = [];
    let anyFlagged = false;

    for (const [fieldName, text] of Object.entries(fields)) {
        const result = filterContent(text);
        fieldResults[fieldName] = result;

        if (result.flagged) {
            anyFlagged = true;
            allReasons.push(`[${fieldName}]: ${result.reasons.join(', ')}`);
            if (result.severity === 'high' ||
                (result.severity === 'medium' && worstSeverity !== 'high') ||
                (result.severity === 'low' && !worstSeverity)) {
                worstSeverity = result.severity;
            }
        }
    }

    return {
        isClean: !anyFlagged,
        flagged: anyFlagged,
        reasons: allReasons,
        severity: worstSeverity,
        fieldResults
    };
};

module.exports = {
    filterContent,
    filterMultipleFields,
    checkProfanity,
    checkSpam,
    normalizeText
};
