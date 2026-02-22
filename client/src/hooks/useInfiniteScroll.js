import { useEffect, useRef, useCallback } from "react";

export default function useInfiniteScroll(onLoadMore, { hasMore, isLoading }) {
    const sentinelRef = useRef(null);

    const handleIntersect = useCallback(
        (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                onLoadMore();
            }
        },
        [onLoadMore, hasMore, isLoading]
    );

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(handleIntersect, {
            root: null,
            rootMargin: "200px",
            threshold: 0,
        });

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [handleIntersect]);

    return sentinelRef;
}
