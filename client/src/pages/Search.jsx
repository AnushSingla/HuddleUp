import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  Search,
  Video,
  Users,
  Hash,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  Eye,
  Calendar,
  Loader2,
  AlertCircle,
  PlayCircle,
  UserCircle2,
} from "lucide-react";
import { searchContent } from "@/api";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "all",      label: "All",      icon: Search },
  { id: "videos",   label: "Videos",   icon: Video },
  { id: "users",    label: "Creators", icon: Users },
  { id: "hashtags", label: "Hashtags", icon: Hash },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Recent" },
  { value: "date",      label: "Latest" },
  { value: "views",     label: "Most Viewed" },
];

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

// Escape all special regex metacharacters in a user-supplied string
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function VideoResultCard({ video, query }) {
  const navigate = useNavigate();
  const highlight = (text = "") => {
    const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-cyan-500/30 text-cyan-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate(`/explore?video=${video._id}`)}
      className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all duration-200"
    >
      {/* Thumbnail placeholder */}
      <div className="flex-shrink-0 w-28 h-16 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
        {video.thumbnailUrl ? (
          <img
            src={`${API_BASE}${video.thumbnailUrl}`}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <PlayCircle className="w-8 h-8 text-zinc-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">{highlight(video.title)}</p>
        {video.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
            {highlight(video.description)}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-zinc-500 text-xs">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {video.views?.toLocaleString() ?? 0}
          </span>
          <span>by {video.postedBy?.username ?? "unknown"}</span>
          {video.category && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              {video.category}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function UserResultCard({ user, query }) {
  const navigate = useNavigate();
  const highlight = (text = "") => {
    const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-purple-500/30 text-purple-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate(`/user/${user._id}`)}
      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        {user.username?.[0]?.toUpperCase() ?? <UserCircle2 />}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-white text-sm">{highlight(user.username)}</p>
        {user.bio && (
          <p className="text-xs text-zinc-400 truncate">{highlight(user.bio)}</p>
        )}
      </div>
    </motion.div>
  );
}

function HashtagResultCard({ tag, query, onTagClick }) {
  const highlight = (text = "") => {
    const clean = text.replace(/^#/, "");
    const cleanQ = query.replace(/^#/, "");
    if (!cleanQ) return clean;
    const parts = clean.split(new RegExp(`(${escapeRegex(cleanQ)})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === cleanQ.toLowerCase() ? (
        <mark key={i} className="bg-pink-500/30 text-pink-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => onTagClick(tag.tag)}
      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/40 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
          <Hash className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-white text-sm">#{highlight(tag.tag)}</p>
          <p className="text-xs text-zinc-400">{tag.count} video{tag.count !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ query }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-16 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Search className="w-10 h-10 text-zinc-600" />
      </div>
      <h3 className="text-lg font-semibold text-white">No results for "{query}"</h3>
      <p className="text-sm text-zinc-400 mt-2 max-w-md">
        Try different keywords, check your spelling, or search for something else.
      </p>
      <p className="text-xs text-zinc-600 mt-4">
        You might be looking for: videos, creators, or trending hashtags
      </p>
    </motion.div>
  );
}

function Pagination({ page, total, limit, onPage }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="text-zinc-400 hover:text-white"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              p === page
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg"
                : "text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {p}
          </button>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="text-zinc-400 hover:text-white"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") || "";
  const tabParam = searchParams.get("tab") || "all";
  const pageParam = parseInt(searchParams.get("page") || "1");
  const sortParam = searchParams.get("sort") || "relevance";

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localQuery, setLocalQuery] = useState(q);

  const doSearch = useCallback(
    async (query, tab, page, sort) => {
      if (!query.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const data = await searchContent({ q: query, type: tab, page, limit: 10, sortBy: sort });
        setResults(data);
      } catch {
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Re-run search when URL params change
  useEffect(() => {
    if (!q) return;
    setLocalQuery(q);
    doSearch(q, tabParam, pageParam, sortParam);
  }, [q, tabParam, pageParam, sortParam, doSearch]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  };

  const handleLocalSearch = (e) => {
    e.preventDefault();
    if (!localQuery.trim()) return;
    saveToHistory(localQuery.trim());
    const next = new URLSearchParams();
    next.set("q", localQuery.trim());
    next.set("tab", "all");
    next.set("page", "1");
    setSearchParams(next);
  };

  // Save to local storage search history
  const saveToHistory = (term) => {
    try {
      const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      const updated = [term, ...history.filter((h) => h !== term)].slice(0, 10);
      localStorage.setItem("searchHistory", JSON.stringify(updated));
    } catch (err) { console.error("search history save", err); }
  };

  const handleTagClick = (tag) => {
    const cleanTag = tag.replace(/^#/, "");
    setLocalQuery(cleanTag);
    saveToHistory(cleanTag);
    const next = new URLSearchParams();
    next.set("q", cleanTag);
    next.set("tab", "hashtags");
    next.set("page", "1");
    setSearchParams(next);
  };

  const hasAnyResults =
    results &&
    ((results.videos?.length ?? 0) > 0 ||
      (results.users?.length ?? 0) > 0 ||
      (results.hashtags?.length ?? 0) > 0);

  return (
    <div className="max-w-4xl mx-auto px-2 py-6">
      {/* ── Header search bar ───────────────────────────── */}
      <form onSubmit={handleLocalSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
          <input
            autoFocus
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search videos, creators, hashtags…"
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>
        <Button
          type="submit"
          className="rounded-2xl px-6 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 font-semibold shadow-lg"
        >
          Search
        </Button>
      </form>

      {q && (
        <>
          {/* ── Tabs + Filters row ─────────────────────────── */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
              {TABS.map((tab) => {
                const TabIcon = tab.icon;
                return (
                <button
                  key={tab.id}
                  onClick={() => setParam("tab", tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tabParam === tab.id
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort by (video tab only) */}
              {(tabParam === "videos" || tabParam === "all") && (
                <select
                  value={sortParam}
                  onChange={(e) => setParam("sort", e.target.value)}
                  className="text-sm bg-white/5 border border-white/10 text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/60"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-zinc-900">
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* ── Query label ────────────────────────────────── */}
          {!loading && results && (
            <p className="text-xs text-zinc-500 mb-4">
              {hasAnyResults
                ? `Showing results for "${q}"`
                : `No results for "${q}"`}
            </p>
          )}

          {/* ── Loading ────────────────────────────────────── */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          )}

          {/* ── Error ──────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Results ────────────────────────────────────── */}
          {!loading && results && (
            <AnimatePresence mode="wait">
              {!hasAnyResults ? (
                <EmptyState key="empty" query={q} />
              ) : (
                <motion.div
                  key={`${tabParam}-${pageParam}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Videos section */}
                  {(tabParam === "all" || tabParam === "videos") &&
                    (results.videos?.length ?? 0) > 0 && (
                      <section>
                        {tabParam === "all" && (
                          <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                              <Video className="w-4 h-4" /> Videos
                            </h2>
                            {results.videoTotal > 6 && (
                              <button
                                onClick={() => setParam("tab", "videos")}
                                className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                              >
                                See all {results.videoTotal} →
                              </button>
                            )}
                          </div>
                        )}
                        <div className="space-y-3">
                          {results.videos.map((v) => (
                            <VideoResultCard key={v._id} video={v} query={q} />
                          ))}
                        </div>
                        {tabParam === "videos" && (
                          <Pagination
                            page={pageParam}
                            total={results.videoTotal}
                            limit={10}
                            onPage={(p) => setParam("page", p)}
                          />
                        )}
                      </section>
                    )}

                  {/* Users section */}
                  {(tabParam === "all" || tabParam === "users") &&
                    (results.users?.length ?? 0) > 0 && (
                      <section>
                        {tabParam === "all" && (
                          <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                              <Users className="w-4 h-4" /> Creators
                            </h2>
                            {results.userTotal > 6 && (
                              <button
                                onClick={() => setParam("tab", "users")}
                                className="text-xs text-purple-400 hover:text-purple-300 transition"
                              >
                                See all {results.userTotal} →
                              </button>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {results.users.map((u) => (
                            <UserResultCard key={u._id} user={u} query={q} />
                          ))}
                        </div>
                        {tabParam === "users" && (
                          <Pagination
                            page={pageParam}
                            total={results.userTotal}
                            limit={10}
                            onPage={(p) => setParam("page", p)}
                          />
                        )}
                      </section>
                    )}

                  {/* Hashtags section */}
                  {(tabParam === "all" || tabParam === "hashtags") &&
                    (results.hashtags?.length ?? 0) > 0 && (
                      <section>
                        {tabParam === "all" && (
                          <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                              <Hash className="w-4 h-4" /> Hashtags
                            </h2>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {results.hashtags.map((t) => (
                            <HashtagResultCard
                              key={t.tag}
                              tag={t}
                              query={q}
                              onTagClick={handleTagClick}
                            />
                          ))}
                        </div>
                      </section>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
      )}

      {/* ── Empty initial state (no query yet) ────────────── */}
      {!q && (
        <SearchLanding />
      )}
    </div>
  );
}

function SearchLanding() {
  const navigate = useNavigate();
  const history = (() => {
    try {
      return JSON.parse(localStorage.getItem("searchHistory") || "[]");
    } catch {
      return [];
    }
  })();

  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-500/20 flex items-center justify-center mb-6">
        <Search className="w-10 h-10 text-cyan-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Search HuddleUp</h2>
      <p className="text-zinc-400 text-sm mb-8">
        Find videos, creators, and hashtags
      </p>
      {history.length > 0 && (
        <div className="max-w-sm mx-auto">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Recent searches</p>
          <div className="flex flex-wrap justify-center gap-2">
            {history.map((h) => (
              <button
                key={h}
                onClick={() => navigate(`/search?q=${encodeURIComponent(h)}`)}
                className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
