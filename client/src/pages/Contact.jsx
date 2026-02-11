import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Users,
  AlertCircle,
  Star,
  Settings,
} from "lucide-react";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
  services: [],
};

const servicesList = [
  "Technical support",
  "Account & login help",
  "Community guidelines",
  "Report a bug",
  "Feature request",
  "General feedback",
];

export default function Contact() {
  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        services: checked
          ? [...prev.services, value]
          : prev.services.filter((s) => s !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! 🚀 (Demo)");
    setForm(initialState);
  };

  return (
    <div className="flex flex-col md:flex-row gap-12 max-w-6xl mx-auto py-20 px-4">
      
      {/* ================= FORM SECTION ================= */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 
        border border-zinc-200 dark:border-zinc-700 
        rounded-3xl shadow-2xl p-10 space-y-6
        transition-all duration-500 hover:shadow-blue-500/20"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight
  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
  bg-clip-text text-transparent
  transition-all duration-500 ease-out
  hover:scale-105
  hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600
  hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]
  cursor-default">
          Contact HuddleUp Team
        </h2>

        <p className="text-zinc-600 dark:text-zinc-300">
          Have questions about HuddleUp, need support, or want to give feedback? Our team is here to help you 24/7. Reach out and we’ll get back to you as soon as possible.
        </p>

        {/* INPUT ROW */}
        <div className="flex gap-4">
          {["firstName", "lastName"].map((field, i) => (
            <div key={i} className="flex-1">
              <label className="text-sm font-medium tracking-tight
  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
  bg-clip-text text-transparent
  transition-all duration-500 ease-out
  hover:scale-105
  hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600
  hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]
  cursor-default">
                {field === "firstName" ? "First Name" : "Last Name"}
              </label>
              <input
                type="text"
                name={field}
                required
                value={form[field]}
                onChange={handleChange}
                placeholder={field === "firstName" ? "John" : "Doe"}
                className="w-full mt-1 px-4 py-2 rounded-xl 
                bg-white/80 dark:bg-zinc-800/80 
                border border-zinc-300 dark:border-zinc-700
                transition-all duration-300
                hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/20
                focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>

        {/* EMAIL + PHONE */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium tracking-tight
  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
  bg-clip-text text-transparent
  transition-all duration-500 ease-out
  hover:scale-105
  hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600
  hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]
  cursor-default">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full mt-1 px-4 py-2 rounded-xl 
              bg-white/80 dark:bg-zinc-800/80 
              border border-zinc-300 dark:border-zinc-700
              transition-all duration-300
              hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/20
              focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium tracking-tight
  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
  bg-clip-text text-transparent
  transition-all duration-500 ease-out
  hover:scale-105
  hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600
  hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]
  cursor-default">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 000 000 0000"
              className="w-full mt-1 px-4 py-2 rounded-xl 
              bg-white/80 dark:bg-zinc-800/80 
              border border-zinc-300 dark:border-zinc-700
              transition-all duration-300
              hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/20
              focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* MESSAGE */}
        <div>
          <label className="text-sm font-medium tracking-tight
  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
  bg-clip-text text-transparent
  transition-all duration-500 ease-out
  hover:scale-105
  hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600
  hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]
  cursor-default">
            Message
          </label>
          <textarea
            name="message"
            required
            value={form.message}
            onChange={handleChange}
            placeholder="Write your message..."
            className="w-full mt-1 px-4 py-3 min-h-[120px] rounded-xl 
            bg-white/80 dark:bg-zinc-800/80 
            border border-zinc-300 dark:border-zinc-700
            transition-all duration-300
            hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/20
            focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* SERVICES */}
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-3 block">
            What can we help you with?
          </label>

          <div className="grid grid-cols-2 gap-3">
            {servicesList.map((service) => (
              <label
                key={service}
                className="group flex items-center gap-2 
                bg-zinc-100/80 dark:bg-zinc-800/80 
                px-3 py-2 rounded-xl cursor-pointer
                transition-all duration-300
                hover:-translate-y-1 hover:shadow-lg
                hover:shadow-blue-500/20 hover:border-blue-500
                border border-transparent"
              >
                <input
                  type="checkbox"
                  name="services"
                  value={service}
                  checked={form.services.includes(service)}
                  onChange={handleChange}
                  className="accent-blue-500"
                />

                {service === "Technical support" && (
                  <Settings className="w-4 h-4 text-blue-400 group-hover:scale-125 transition" />
                )}
                {service === "Account & login help" && (
                  <Users className="w-4 h-4 text-blue-400 group-hover:scale-125 transition" />
                )}
                {service === "Community guidelines" && (
                  <Star className="w-4 h-4 text-blue-400 group-hover:scale-125 transition" />
                )}
                {service === "Report a bug" && (
                  <AlertCircle className="w-4 h-4 text-blue-400 group-hover:scale-125 transition" />
                )}
                {service === "Feature request" && (
                  <MessageCircle className="w-4 h-4 text-blue-400 group-hover:scale-125 transition" />
                )}
                {service === "General feedback" && (
                  <Mail className="w-4 h-4 text-blue-400 group-hover:scale-125 transition" />
                )}

                <span className="text-sm">{service}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full py-3 rounded-2xl text-lg font-semibold text-white
          bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
          transition-all duration-300
          hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40
          hover:from-purple-600 hover:to-blue-600
          active:scale-95"
        >
          Send Message 🚀
        </button>
      </form>

      {/* ================= CONTACT INFO ================= */}
      <div className="flex-1 space-y-8">

        {/* CHAT CARD */}
        <div className="group p-8 rounded-3xl bg-gradient-to-br from-blue-900/60 to-zinc-900/80 
        border border-zinc-800 shadow-xl
        transition-all duration-300 hover:-translate-y-2 hover:shadow-blue-500/30">

          <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
            <MessageCircle className="w-5 h-5 text-blue-400 group-hover:scale-110 transition" />
            Chat with us
          </h3>

          <div className="mt-4 space-y-2 text-blue-300">
            <a href="#" className="block hover:text-fuchsia-400 transition">
              Start live chat
            </a>
            <a href="mailto:support@huddleup.com" className="block hover:text-fuchsia-400 transition">
              support@huddleup.com
            </a>
          </div>
        </div>

        {/* CALL CARD */}
        <div className="group p-8 rounded-3xl bg-gradient-to-br from-purple-900/60 to-zinc-900/80 
        border border-zinc-800 shadow-xl
        transition-all duration-300 hover:-translate-y-2 hover:shadow-purple-500/30">

          <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Phone className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
            Call us
          </h3>

          <p className="text-zinc-400 mt-3">Call our team Mon-Fri from 8am to 5pm</p>
          <a href="tel:+18001234567" className="text-purple-300 hover:text-fuchsia-400 transition">
            +1 (800) 123-4567
          </a>
        </div>

      </div>
    </div>
  );
}
