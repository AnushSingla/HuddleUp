import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import PageMeta from "@/components/PageMeta";
import {
  Users,
  GitCommit,
  ExternalLink,
  Search,
  RefreshCw,
  AlertCircle,
  Star,
  GitPullRequest,
  Code2,
} from "lucide-react";

const REPO_OWNER = "AnushSingla";
const REPO_NAME = "HuddleUp";
const PER_PAGE = 100;

const Contributor = () => {
  const [contributors, setContributors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [repoStats, setRepoStats] = useState(null);

  const fetchContributors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contribRes, repoRes] = await Promise.all([
        fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=${PER_PAGE}`
        ),
        fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`),
      ]);

      if (!contribRes.ok) throw new Error("Failed to fetch contributors");

      const contribData = await contribRes.json();
      setContributors(contribData);
      setFiltered(contribData);

      if (repoRes.ok) {
        const repoData = await repoRes.json();
        setRepoStats(repoData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(contributors);
    } else {
      setFiltered(
        contributors.filter((c) =>
          c.login.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, contributors]);

  const totalCommits = contributors.reduce(
    (sum, c) => sum + c.contributions,
    0
  );

  const stats = [
    {
      value: contributors.length,
      label: "Contributors",
      color: "var(--accent)",
      icon: Users,
    },
    {
      value: totalCommits.toLocaleString(),
      label: "Total Commits",
      color: "var(--turf-green)",
      icon: GitCommit,
    },
    {
      value: repoStats?.stargazers_count?.toLocaleString() ?? "—",
      label: "GitHub Stars",
      color: "var(--sun-yellow)",
      icon: Star,
    },
    {
      value: repoStats?.forks_count?.toLocaleString() ?? "—",
      label: "Forks",
      color: "var(--clay-red)",
      icon: GitPullRequest,
    },
  ];

  return (
    <PageWrapper>
      <PageMeta title="Contributors" description="Meet the open-source contributors who build HuddleUp." />
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        {/* Hero Section */}
        <section className="px-6 md:px-12 pt-20 pb-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                Our{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Contributors
                </span>
              </h1>
              <p
                className="text-xl md:text-2xl max-w-3xl"
                style={{ color: "var(--text-sub)", lineHeight: "1.6" }}
              >
                The amazing people who build, improve, and power HuddleUp every
                day. Real-time data straight from GitHub.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="px-6 md:px-12 py-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative p-6"
                    style={{
                      background: "var(--bg-surface)",
                      borderLeft: `4px solid ${stat.color}`,
                      borderRadius: "8px",
                    }}
                  >
                    <IconComponent
                      className="w-6 h-6 mb-3"
                      style={{ color: stat.color }}
                      strokeWidth={1.5}
                    />
                    <div
                      className="text-3xl md:text-4xl font-black mb-1"
                      style={{ color: stat.color }}
                    >
                      {loading ? "…" : stat.value}
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-sub)" }}
                    >
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Search & Refresh Bar */}
        <section className="px-6 md:px-12 py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div
              className="relative flex-1 w-full sm:max-w-md"
            >
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search contributors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-base outline-none transition-all"
                style={{
                  background: "var(--bg-surface)",
                  color: "var(--text-main)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-subtle)")
                }
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchContributors}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 font-semibold transition-colors"
              style={{
                background: "var(--accent)",
                color: "var(--text-on-accent)",
                borderRadius: "12px",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <section className="px-6 md:px-12 py-6">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4"
                style={{
                  background: "var(--clay-red-muted)",
                  borderRadius: "12px",
                  border: "1px solid var(--clay-red)",
                }}
              >
                <AlertCircle
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: "var(--clay-red)" }}
                />
                <p style={{ color: "var(--clay-red)" }}>
                  {error}. Please try again later or check your network
                  connection.
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <section className="px-6 md:px-12 py-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-6 animate-pulse"
                    style={{
                      background: "var(--bg-surface)",
                      borderRadius: "16px",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className="w-20 h-20 rounded-full"
                        style={{ background: "var(--bg-elevated)" }}
                      />
                      <div
                        className="h-4 w-24 rounded"
                        style={{ background: "var(--bg-elevated)" }}
                      />
                      <div
                        className="h-3 w-16 rounded"
                        style={{ background: "var(--bg-elevated)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contributors Grid */}
        {!loading && !error && (
          <section className="px-6 md:px-12 py-10">
            <div className="max-w-6xl mx-auto">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <Code2
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <p
                    className="text-xl"
                    style={{ color: "var(--text-sub)" }}
                  >
                    No contributors found matching "{search}"
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filtered.map((contributor, index) => (
                    <motion.a
                      key={contributor.id}
                      href={contributor.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.5) }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="group relative p-6 text-center cursor-pointer transition-all"
                      style={{
                        background: "var(--bg-surface)",
                        borderRadius: "16px",
                        border: "1px solid var(--border-subtle)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 30px rgba(0, 229, 255, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                          "var(--border-subtle)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* Rank badge for top 3 */}
                      {index < 3 && !search && (
                        <div
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                          style={{
                            background:
                              index === 0
                                ? "var(--sun-yellow)"
                                : index === 1
                                ? "var(--ice-white-soft)"
                                : "#CD7F32",
                            color: "var(--bg-primary)",
                          }}
                        >
                          #{index + 1}
                        </div>
                      )}

                      {/* Avatar */}
                      <div className="relative mx-auto mb-4 w-20 h-20">
                        <img
                          src={contributor.avatar_url}
                          alt={contributor.login}
                          className="w-20 h-20 rounded-full object-cover transition-transform group-hover:scale-105"
                          style={{
                            border: "3px solid var(--border-medium)",
                          }}
                          loading="lazy"
                        />
                        <div
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{
                            background: "var(--bg-elevated)",
                            border: "2px solid var(--border-medium)",
                          }}
                        >
                          <ExternalLink
                            className="w-3 h-3"
                            style={{ color: "var(--accent)" }}
                          />
                        </div>
                      </div>

                      {/* Username */}
                      <h3
                        className="text-base font-bold mb-1 group-hover:underline"
                        style={{ color: "var(--text-main)" }}
                      >
                        {contributor.login}
                      </h3>

                      {/* Contributions */}
                      <div
                        className="flex items-center justify-center gap-1.5 text-sm font-medium"
                        style={{ color: "var(--turf-green)" }}
                      >
                        <GitCommit className="w-4 h-4" />
                        {contributor.contributions}{" "}
                        {contributor.contributions === 1
                          ? "commit"
                          : "commits"}
                      </div>

                      {/* Contribution bar */}
                      <div
                        className="mt-3 mx-auto w-3/4 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "var(--bg-elevated)" }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background:
                              "linear-gradient(90deg, var(--accent), var(--turf-green))",
                          }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              (contributor.contributions /
                                (contributors[0]?.contributions || 1)) *
                                100,
                              100
                            )}%`,
                          }}
                          transition={{ delay: 0.3 + index * 0.03, duration: 0.6 }}
                        />
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="px-6 md:px-12 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <p
                className="text-3xl md:text-5xl font-black leading-tight"
                style={{ color: "var(--text-main)" }}
              >
                Want to join the team?
              </p>
              <p
                className="text-3xl md:text-5xl font-black leading-tight mt-2"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Contribute on GitHub
              </p>
              <motion.a
                href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 mt-8 px-8 py-4 font-bold text-lg transition-colors"
                style={{
                  background: "var(--accent)",
                  color: "var(--text-on-accent)",
                  borderRadius: "16px",
                  textDecoration: "none",
                }}
              >
                <ExternalLink className="w-5 h-5" />
                View Repository
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default Contributor;;