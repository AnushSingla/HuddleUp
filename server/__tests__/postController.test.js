/**
 * Unit tests for updatePost content-filter re-application (Issue #210)
 */

// ── Mocks ──────────────────────────────────────────────────
const mockSave = jest.fn();
const mockPopulate = jest.fn();
const mockPostFindById = jest.fn();
const mockReportCreate = jest.fn();

jest.mock("../models/Post", () => ({
    findById: (...args) => mockPostFindById(...args),
}));

jest.mock("../models/Report", () => ({
    create: (...args) => mockReportCreate(...args),
}));

jest.mock("../models/User", () => ({}));
jest.mock("../models/Notification", () => ({}));
jest.mock("../utils/cache", () => ({
    deleteCachePattern: jest.fn().mockResolvedValue(),
}));
jest.mock("../socketEmitter", () => ({ emitFeedEvent: jest.fn() }));
jest.mock("../utils/queryCache", () => ({
    invalidateQueryCache: jest.fn().mockResolvedValue(),
}));
jest.mock("../socketRegistry", () => ({ emitToContentRoom: jest.fn() }));
jest.mock("../utils/logger", () => ({
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
}));

const { updatePost } = require("../controllers/postController");

// ── Helpers ────────────────────────────────────────────────
const USER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

const buildReq = (postId, body) => ({
    params: { postId },
    user: { id: USER_ID },
    body,
});

const buildRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const buildPost = (overrides = {}) => {
    const post = {
        _id: "bbbbbbbbbbbbbbbbbbbbbbbb",
        title: "Original Title",
        content: "Original Content",
        category: "general",
        postedBy: { toString: () => USER_ID },
        flagged: false,
        flagReason: "",
        save: mockSave,
        populate: mockPopulate,
        ...overrides,
    };
    mockSave.mockResolvedValue(post);
    mockPopulate.mockResolvedValue(post);
    return post;
};

// ── Tests ──────────────────────────────────────────────────
describe("updatePost – content filter re-application", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockReportCreate.mockResolvedValue({});
    });

    test("clean edit → flagged stays false, no Report created", async () => {
        const post = buildPost();
        mockPostFindById.mockResolvedValue(post);

        const req = buildReq(post._id, { title: "Nice Title", content: "Good content here" });
        const res = buildRes();

        await updatePost(req, res);

        expect(post.flagged).toBe(false);
        expect(post.flagReason).toBe("");
        expect(mockReportCreate).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("harmful edit → post flagged, Report auto-created", async () => {
        const post = buildPost();
        mockPostFindById.mockResolvedValue(post);

        const req = buildReq(post._id, {
            title: "fuck this",
            content: "some shit content",
        });
        const res = buildRes();

        await updatePost(req, res);

        expect(post.flagged).toBe(true);
        expect(post.flagReason).toContain("Profanity");
        expect(mockReportCreate).toHaveBeenCalledTimes(1);
        expect(mockReportCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                contentType: "post",
                contentId: post._id,
                reason: "spam",
                status: "pending",
                description: expect.stringContaining("Auto-flagged on edit"),
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("previously flagged post edited clean → flag cleared", async () => {
        const post = buildPost({
            flagged: true,
            flagReason: "old issue",
        });
        mockPostFindById.mockResolvedValue(post);

        const req = buildReq(post._id, {
            title: "Nice Title",
            content: "Totally clean content now",
        });
        const res = buildRes();

        await updatePost(req, res);

        expect(post.flagged).toBe(false);
        expect(post.flagReason).toBe("");
        expect(mockReportCreate).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
