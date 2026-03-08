import React, { useEffect, useState, useRef } from "react";
import { socket } from "../lib/socket";
import PageMeta from "@/components/PageMeta";
import MentionText from "@/components/MentionText";

const mockMatch = {
  id: 1,
  teams: "India vs Australia",
  status: "Live",
  viewers: 128,
  format: "ODI",
  innings: 1,
  currentOver: "23.4",
  score: "186/3",
};

export default function LiveMatchRooms() {
  // Mock player stats
  const [playerStats] = useState([
    { name: "Rohit Sharma", runs: 52, balls: 38, fours: 6, sixes: 2, strikeRate: 136.8 },
    { name: "Virat Kohli", runs: 41, balls: 29, fours: 4, sixes: 1, strikeRate: 141.4 },
    { name: "KL Rahul", runs: 18, balls: 22, fours: 2, sixes: 0, strikeRate: 81.8 },
    { name: "Pat Cummins", wickets: 2, overs: 6, runsGiven: 32, economy: 5.33 },
  ]);

  // Emoji reactions for chat
  const emojiList = ["👍", "😂", "🔥", "👏", "🏏", "😮", "❤️"];
  const [reactions, setReactions] = useState({});

  const addReaction = (msgIdx, emoji) => {
    setReactions((prev) => {
      const msgReactions = prev[msgIdx] || {};
      return {
        ...prev,
        [msgIdx]: {
          ...msgReactions,
          [emoji]: (msgReactions[emoji] || 0) + 1,
        },
      };
    });
  };
  const [messages, setMessages] = useState([
    { user: "System", text: "Welcome to the live match room!", time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  const [poll, setPoll] = useState({
    question: "Was that LBW?",
    options: ["Out", "Not Out"],
    votes: [12, 7],
  });
  const [userVote, setUserVote] = useState(null);

  // Match Events / Auto-generated match thread (Cricket)
  const [matchEvents, setMatchEvents] = useState([
    { id: 1, type: "toss", text: "India won the toss and chose to bat first", time: "TOSS", team: "India", timestamp: new Date(Date.now() - 120 * 60000) },
    { id: 2, type: "start", text: "First innings has started!", time: "0.0", team: null, timestamp: new Date(Date.now() - 110 * 60000) },
    { id: 3, type: "four", text: "Rohit Sharma hits a FOUR!", time: "5.2", team: "India", timestamp: new Date(Date.now() - 95 * 60000) },
    { id: 4, type: "six", text: "Virat Kohli hits a massive SIX!", time: "12.5", team: "India", timestamp: new Date(Date.now() - 68 * 60000) },
    { id: 5, type: "wicket", text: "KL Rahul caught behind! WICKET", time: "18.3", team: "India", timestamp: new Date(Date.now() - 37 * 60000) },
    { id: 6, type: "fifty", text: "Rohit Sharma scores his 50!", time: "21.2", team: "India", timestamp: new Date(Date.now() - 16 * 60000) },
  ]);

  // Socket
  useEffect(() => {
    socket.connect();
    socket.emit("join_match", mockMatch.id);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, { ...msg, time: new Date() }]);
    });

    socket.on("typing", () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    });

    // Listen for match events
    socket.on("match_event", (event) => {
      setMatchEvents((prev) => [{
        ...event,
        id: Date.now(),
        timestamp: new Date()
      }, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { matchId: mockMatch.id, user: "You", text: input };
    setMessages((prev) => [...prev, { ...msg, time: new Date() }]);
    socket.emit("send_message", msg);
    setInput("");
  };

  const vote = (idx) => {
    if (userVote !== null) return;
    const newVotes = [...poll.votes];
    newVotes[idx] += 1;
    setPoll({ ...poll, votes: newVotes });
    setUserVote(idx);
  };

  const totalVotes = poll.votes.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
      <PageMeta title="Live match" description="Watch live match rooms and chat with fans on HuddleUp." />
      <div className="max-w-6xl mx-auto rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl p-6 flex flex-col md:flex-row gap-6">

        {/* Left Section */}
        <div className="flex-1 space-y-6">

          {/* Match Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <h2 className="text-2xl font-bold tracking-wide">
                  {mockMatch.teams}
                </h2>
                <span className="bg-red-600 text-xs px-2 py-1 rounded-md font-semibold">
                  LIVE
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                👀 {mockMatch.viewers} watching now
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="bg-orange-500/30 text-orange-400 px-2 py-0.5 rounded font-semibold">
                  {mockMatch.format}
                </span>
                <span className="text-gray-300">
                  🏏 {mockMatch.score}
                </span>
                <span className="text-gray-400">
                  Over: {mockMatch.currentOver}
                </span>
              </div>
            </div>
          </div>

          {/* Player Stats */}
          <div className="bg-green-900/20 rounded-xl p-4 mt-4 border border-green-700/20 shadow">
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">Player Stats <span className="text-green-400">🏏</span></h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {playerStats.map((p, idx) => (
                <div key={idx} className="bg-green-700/10 rounded-lg p-3 flex flex-col gap-1">
                  <span className="font-bold text-green-300 text-base">{p.name}</span>
                  {p.runs !== undefined ? (
                    <span className="text-sm text-white">Runs: <span className="font-semibold text-yellow-300">{p.runs}</span> | Balls: {p.balls} | 4s: {p.fours} | 6s: {p.sixes} | SR: {p.strikeRate}</span>
                  ) : (
                    <span className="text-sm text-white">Wickets: <span className="font-semibold text-red-400">{p.wickets}</span> | Overs: {p.overs} | Runs Given: {p.runsGiven} | Econ: {p.economy}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Auto-generated Match Thread */}
          <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
            <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
              📋 <span>Match Thread</span>
              <span className="text-xs bg-green-600/30 text-green-400 px-2 py-0.5 rounded-full font-normal">
                Auto-updating
              </span>
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {matchEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
                >
                  {/* Event Icon */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0
                    ${event.type === 'four' ? 'bg-blue-500/30 text-blue-400' : ''}
                    ${event.type === 'six' ? 'bg-green-500/30 text-green-400' : ''}
                    ${event.type === 'wicket' ? 'bg-red-500/30 text-red-400' : ''}
                    ${event.type === 'fifty' ? 'bg-yellow-500/30 text-yellow-400' : ''}
                    ${event.type === 'hundred' ? 'bg-purple-500/30 text-purple-400' : ''}
                    ${event.type === 'start' ? 'bg-indigo-500/30 text-indigo-400' : ''}
                    ${event.type === 'toss' ? 'bg-orange-500/30 text-orange-400' : ''}
                    ${event.type === 'over' ? 'bg-cyan-500/30 text-cyan-400' : ''}
                    ${event.type === 'wide' ? 'bg-pink-500/30 text-pink-400' : ''}
                    ${event.type === 'noBall' ? 'bg-amber-500/30 text-amber-400' : ''}
                  `}>
                    {event.type === 'four' && '4️⃣'}
                    {event.type === 'six' && '6️⃣'}
                    {event.type === 'wicket' && '🪃'}
                    {event.type === 'fifty' && '5️⃣0️⃣'}
                    {event.type === 'hundred' && '💯'}
                    {event.type === 'start' && '🏏'}
                    {event.type === 'toss' && '🪙'}
                    {event.type === 'over' && '🎯'}
                    {event.type === 'wide' && '〰️'}
                    {event.type === 'noBall' && '⭕'}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${event.team === 'India' ? 'bg-orange-500/30 text-orange-400' : ''}
                        ${event.team === 'Australia' ? 'bg-yellow-500/30 text-yellow-400' : ''}
                        ${!event.team ? 'bg-gray-500/30 text-gray-400' : ''}
                      `}>
                        {event.team || 'Match'}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {event.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 mt-1 truncate">
                      {event.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Poll */}
          <div className="bg-gradient-to-br from-green-900 via-green-700 to-yellow-100 rounded-2xl p-6 border border-green-700/30 shadow-xl">
            <h3 className="font-bold mb-6 text-xl flex items-center gap-3">
              🏏 <span>{poll.question}</span> <span className="text-yellow-500 text-2xl">🏆</span>
            </h3>

            <div className="space-y-4">
              {poll.options.map((opt, idx) => {
                const percent = totalVotes
                  ? ((poll.votes[idx] / totalVotes) * 100).toFixed(0)
                  : 0;

                // Cricket icons for options
                const icon = idx === 0 ? "🟢" : "🔴";
                const selected = userVote === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => vote(idx)}
                    disabled={userVote !== null}
                    className={`relative w-full flex items-center mb-2 p-4 rounded-2xl bg-gradient-to-r from-green-600 via-green-400 to-yellow-200 hover:from-green-700 hover:via-green-500 hover:to-yellow-300 transition-all duration-300 shadow-lg overflow-hidden group border border-green-800/20 ${selected ? 'ring-2 ring-yellow-400 scale-105' : ''}`}
                  >
                    <div
                      className="absolute left-0 top-0 h-full bg-yellow-400/20 transition-all duration-500 rounded-2xl"
                      style={{ width: `${percent}%` }}
                    />
                    <div className="relative flex items-center gap-3 font-semibold text-lg flex-1">
                      <span className="text-2xl">{icon}</span>
                      <span>{opt}</span>
                      {selected && <span className="ml-2 text-green-700 text-xl">✔️</span>}
                    </div>
                    <span className="relative z-10 bg-white/80 text-green-700 font-bold px-3 py-1 rounded-full shadow-md text-base ml-4">
                      {percent}%
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-gray-700 font-medium flex items-center gap-2">
              <span>Votes:</span>
              <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full">{totalVotes}</span>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-white/10 rounded-2xl p-4 border border-white/10">

          <h3 className="text-lg font-semibold mb-3">💬 Live Chat</h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.user === "You" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[70%] shadow-lg transition-all duration-300 hover:scale-105 ${msg.user === "You"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-gray-900"
                    }`}
                >
                  <div className="text-xs opacity-70">
                    {msg.user} • {msg.time.toLocaleTimeString()}
                  </div>
                  <MentionText text={msg.text} />
                  {/* Emoji Reactions */}
                  <div className="mt-2 flex gap-2 items-center">
                    {emojiList.map((emoji) => (
                      <button
                        key={emoji}
                        className="text-lg hover:scale-125 transition-all duration-200"
                        onClick={() => addReaction(i, emoji)}
                        disabled={userVote !== null}
                        style={{ opacity: 0.8 }}
                      >
                        {emoji}
                        {reactions[i] && reactions[i][emoji] ? (
                          <span className="ml-1 text-xs font-bold text-green-500">{reactions[i][emoji]}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="text-sm text-gray-400 italic">
                Someone is typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 sm:gap-3 mt-4 items-center overflow-hidden">
            <input
              className="flex-1 min-w-0 bg-white/20 border border-white/20 rounded-xl px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                socket.emit("typing");
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              className="flex-shrink-0 px-4 sm:px-6 py-2 rounded-xl font-semibold whitespace-nowrap bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
