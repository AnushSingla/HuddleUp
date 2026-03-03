/**
 * Moderation System Tests
 * Tests content filter service, report creation, and ban check middleware.
 */

const { filterContent, filterMultipleFields, checkProfanity, checkSpam } = require('../services/contentFilterService');

// ─── Content Filter Service Tests ────────────────────────────────────────────

describe('Content Filter Service', () => {
    describe('checkProfanity', () => {
        test('should detect high severity profanity', () => {
            const result = checkProfanity('This is a shit post');
            expect(result.found).toBe(true);
            expect(result.severity).toBe('high');
            expect(result.matches.length).toBeGreaterThan(0);
        });

        test('should detect medium severity profanity', () => {
            const result = checkProfanity('What the hell is going on');
            expect(result.found).toBe(true);
            expect(result.severity).toBe('medium');
        });

        test('should return clean for normal text', () => {
            const result = checkProfanity('This is a great post about sports');
            expect(result.found).toBe(false);
            expect(result.matches.length).toBe(0);
        });

        test('should detect obfuscated profanity', () => {
            const result = checkProfanity('f u c k this');
            expect(result.found).toBe(true);
        });
    });

    describe('checkSpam', () => {
        test('should detect excessive capitalization', () => {
            const result = checkSpam('THIS IS ALL CAPITALIZED TEXT FOR TESTING');
            expect(result.isSpam).toBe(true);
            expect(result.reasons).toContain('Excessive capitalization detected');
        });

        test('should detect repeated characters', () => {
            const result = checkSpam('Hellooooooo everyone');
            expect(result.isSpam).toBe(true);
            expect(result.reasons).toContain('Repeated characters detected');
        });

        test('should detect URL flooding', () => {
            const result = checkSpam('Visit http://spam.com http://spam2.com http://spam3.com http://spam4.com');
            expect(result.isSpam).toBe(true);
            expect(result.reasons).toContain('URL flooding detected');
        });

        test('should pass clean text', () => {
            const result = checkSpam('This is a normal message about the game yesterday');
            expect(result.isSpam).toBe(false);
        });

        test('should detect too-short content', () => {
            const result = checkSpam('a');
            expect(result.isSpam).toBe(true);
        });
    });

    describe('filterContent', () => {
        test('should return clean for normal text', () => {
            const result = filterContent('Great match analysis! The team played really well.');
            expect(result.isClean).toBe(true);
            expect(result.flagged).toBe(false);
            expect(result.reasons.length).toBe(0);
        });

        test('should flag content with profanity', () => {
            const result = filterContent('This is fucking terrible');
            expect(result.isClean).toBe(false);
            expect(result.flagged).toBe(true);
            expect(result.severity).toBe('high');
        });

        test('should handle null/undefined input', () => {
            const result = filterContent(null);
            expect(result.isClean).toBe(true);
        });

        test('should handle empty string', () => {
            const result = filterContent('');
            expect(result.isClean).toBe(true);
        });
    });

    describe('filterMultipleFields', () => {
        test('should check multiple fields', () => {
            const result = filterMultipleFields({
                title: 'Clean title',
                content: 'This is shit content'
            });
            expect(result.flagged).toBe(true);
            expect(result.fieldResults.title.isClean).toBe(true);
            expect(result.fieldResults.content.isClean).toBe(false);
        });

        test('should report worst severity across fields', () => {
            const result = filterMultipleFields({
                title: 'damn',
                content: 'fuck this'
            });
            expect(result.severity).toBe('high');
        });

        test('should pass clean fields', () => {
            const result = filterMultipleFields({
                title: 'Great game recap',
                content: 'The team performed amazingly well in the finals.'
            });
            expect(result.isClean).toBe(true);
        });
    });
});

// ─── Ban Check Middleware Tests ───────────────────────────────────────────────

describe('Ban Check Middleware', () => {
    const { banCheck } = require('../middleware/banCheck');

    // Mock User model
    jest.mock('../models/User', () => ({
        findById: jest.fn()
    }));
    const User = require('../models/User');

    const mockReq = (userId) => ({ user: { id: userId } });
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should pass through for non-banned user', async () => {
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ isBanned: false })
        });
        const req = mockReq('user123');
        const res = mockRes();
        await banCheck(req, res, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });

    test('should block permanently banned user', async () => {
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isBanned: true,
                bannedUntil: null,
                banReason: 'Spam'
            })
        });
        const req = mockReq('user123');
        const res = mockRes();
        await banCheck(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('should block temporarily suspended user', async () => {
        const futureDate = new Date(Date.now() + 86400000); // tomorrow
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isBanned: true,
                bannedUntil: futureDate,
                banReason: 'Harassment'
            })
        });
        const req = mockReq('user123');
        const res = mockRes();
        await banCheck(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('should auto-unban expired suspension', async () => {
        const pastDate = new Date(Date.now() - 86400000); // yesterday
        const mockUser = {
            isBanned: true,
            bannedUntil: pastDate,
            banReason: 'Temp ban',
            save: jest.fn().mockResolvedValue(true)
        };
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        const req = mockReq('user123');
        const res = mockRes();
        await banCheck(req, res, mockNext);
        expect(mockUser.isBanned).toBe(false);
        expect(mockUser.save).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });

    test('should pass through if no user in request', async () => {
        const req = {};
        const res = mockRes();
        await banCheck(req, res, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });
});
