const { calculateScore } = require("../services/feedService");

describe("calculateScore", () => {
    const makeItem = (overrides) => ({
        createdAt: new Date(),
        likes: [],
        views: 0,
        commentsCount: 0,
        ...overrides,
    });

    test("recent content scores higher than old content", () => {
        const recent = makeItem({ createdAt: new Date() });
        const old = makeItem({ createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000) });
        expect(calculateScore(recent)).toBeGreaterThan(calculateScore(old));
    });

    test("more likes increase score", () => {
        const fewLikes = makeItem({ likes: ["a", "b"] });
        const manyLikes = makeItem({ likes: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] });
        expect(calculateScore(manyLikes)).toBeGreaterThan(calculateScore(fewLikes));
    });

    test("more comments increase score", () => {
        const fewComments = makeItem({ commentsCount: 2 });
        const manyComments = makeItem({ commentsCount: 20 });
        expect(calculateScore(manyComments)).toBeGreaterThan(calculateScore(fewComments));
    });

    test("views contribute to score", () => {
        const noViews = makeItem({ views: 0 });
        const withViews = makeItem({ views: 100 });
        expect(calculateScore(withViews)).toBeGreaterThan(calculateScore(noViews));
    });

    test("score never returns NaN or negative", () => {
        const edge = makeItem({ createdAt: new Date(0), likes: [], views: 0, commentsCount: 0 });
        const score = calculateScore(edge);
        expect(score).not.toBeNaN();
        expect(score).toBeGreaterThanOrEqual(0);
    });

    test("trending boost applies to recent content with engagement", () => {
        const trending = makeItem({
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            likes: ["a", "b", "c", "d", "e"],
            commentsCount: 10,
        });
        const stale = makeItem({
            createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
            likes: ["a", "b", "c", "d", "e"],
            commentsCount: 10,
        });
        expect(calculateScore(trending)).toBeGreaterThan(calculateScore(stale));
    });
});
