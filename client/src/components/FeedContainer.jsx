import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, TrendingUp, Users, Clock, Sparkles, Loader2 } from "lucide-react";
import { API } from "@/api";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useFeedUpdates from "@/hooks/useFeedUpdates";

const FEED_TABS = [
    { key: "trending", label: "Trending", icon: TrendingUp },
    { key: "latest", label: "Latest", icon: Clock },
    { key: "for-you", label: "For You", icon: Sparkles },
    { key: "following", label: "Following", icon: Users },
];

export default function FeedContainer({ renderItem, contentType, category }) {
    const [activeTab, setActiveTab] = useState("trending");
    const [items, setItems] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const { newItemsCount, clearNewItems } = useFeedUpdates();

    const fetchFeed = useCallback(
        async (feedType, nextCursor = null, append = false) => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (nextCursor) params.set("cursor", nextCursor);
                if (category) params.set("category", category);
                if (contentType) params.set("contentType", contentType);
                params.set("limit", "20");

                const res = await API.get(`/feed/${feedType}?${params.toString()}`);
                const { data, nextCursor: newCursor, hasMore: more } = res.data;

                setItems((prev) => (append ? [...prev, ...data] : data));
                setCursor(newCursor);
                setHasMore(more);
            } catch (err) {
                if (err.response?.status === 401 && (feedType === "for-you" || feedType === "following")) {
                    setItems([]);
                    setHasMore(false);
                } else {
                    console.error("Feed fetch error:", err);
                }
            } finally {
                setIsLoading(false);
                setInitialLoad(false);
            }
        },
        [category, contentType]
    );

    useEffect(() => {
        setItems([]);
        setCursor(null);
        setHasMore(true);
        setInitialLoad(true);
        fetchFeed(activeTab);
    }, [activeTab, fetchFeed]);

    const loadMore = useCallback(() => {
        if (cursor && hasMore && !isLoading) {
            fetchFeed(activeTab, cursor, true);
        }
    }, [activeTab, cursor, hasMore, isLoading, fetchFeed]);

    const sentinelRef = useInfiniteScroll(loadMore, { hasMore, isLoading });

    const handleRefresh = () => {
        setCursor(null);
        setHasMore(true);
        clearNewItems();
        fetchFeed(activeTab);
    };

    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <div>
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "none" }}>
                {FEED_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    const needsAuth = tab.key === "for-you" || tab.key === "following";

                    if (needsAuth && !isLoggedIn) return null;

                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all"
                            style={{
                                background: isActive ? "var(--turf-green)" : "var(--bg-surface)",
                                color: isActive ? "var(--bg-primary)" : "var(--text-sub)",
                                border: `2px solid ${isActive ? "var(--turf-green)" : "var(--border-subtle)"}`,
                                transform: isActive ? "scale(1.05)" : "scale(1)",
                            }}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence>
                {newItemsCount > 0 && (
                    <motion.button
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onClick={handleRefresh}
                        className="w-full mb-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                        style={{
                            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))",
                            border: "1px solid var(--turf-green)",
                            color: "var(--turf-green)",
                        }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        {newItemsCount} new {newItemsCount === 1 ? "post" : "posts"} available
                    </motion.button>
                )}
            </AnimatePresence>

            {initialLoad ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl animate-pulse"
                            style={{
                                background: "var(--bg-surface)",
                                height: "200px",
                                border: "1px solid var(--border-subtle)",
                            }}
                        />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div
                    className="text-center py-16 rounded-xl"
                    style={{
                        background: "var(--bg-surface)",
                        border: "2px dashed var(--border-medium)",
                    }}
                >
                    <p className="text-lg font-medium" style={{ color: "var(--text-sub)" }}>
                        {activeTab === "following"
                            ? "Follow people to see their content here"
                            : "No content found"}
                    </p>
                </div>
            ) : (
                <div>
                    {items.map((item, index) => (
                        <div key={`${item._id}-${index}`}>{renderItem(item)}</div>
                    ))}
                </div>
            )}

            {isLoading && !initialLoad && (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--turf-green)" }} />
                </div>
            )}

            <div ref={sentinelRef} style={{ height: "1px" }} />
        </div>
    );
}
