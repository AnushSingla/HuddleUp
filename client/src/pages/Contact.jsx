import React, { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Users, AlertCircle, Star, Settings } from "lucide-react";

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
    // TODO: handle form submission (API or email)
    alert("Message sent! (Demo)");
    setForm(initialState);
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 max-w-5xl mx-auto py-16 px-4 md:px-0">
      {/* Form Section */}
      <form
        className="flex-1 bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl shadow-2xl p-10 space-y-6 border border-zinc-200 dark:border-zinc-700"
        onSubmit={handleSubmit}
      >
        <h2 className="text-4xl font-extrabold mb-2 text-zinc-900 dark:text-white tracking-tight">Contact HuddleUp Team</h2>
        <p className="mb-6 text-zinc-600 dark:text-zinc-300 text-base">
          Have questions about HuddleUp, need support, or want to give feedback? Our team is here to help you 24/7. Reach out and we’ll get back to you as soon as possible.
        </p>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">First name</label>
            <input
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition"
              type="text"
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Last name</label>
            <input
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition"
              type="text"
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Email</label>
            <input
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition"
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Phone number</label>
            <input
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition"
              type="tel"
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Message</label>
          <textarea
            className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 min-h-[100px] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition"
            name="message"
            placeholder="Leave us a message..."
            value={form.message}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">What can we help you with?</label>
          <div className="grid grid-cols-2 gap-3">
            {servicesList.map((service) => (
              <label key={service} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-700 transition border border-transparent hover:border-blue-400">
                <input
                  type="checkbox"
                  name="services"
                  value={service}
                  checked={form.services.includes(service)}
                  onChange={handleChange}
                  className="accent-blue-500 w-4 h-4"
                />
                {service === "Technical support" && <Settings className="w-4 h-4 text-blue-400" />}
                {service === "Account & login help" && <Users className="w-4 h-4 text-blue-400" />}
                {service === "Community guidelines" && <Star className="w-4 h-4 text-blue-400" />}
                {service === "Report a bug" && <AlertCircle className="w-4 h-4 text-blue-400" />}
                {service === "Feature request" && <MessageCircle className="w-4 h-4 text-blue-400" />}
                {service === "General feedback" && <Mail className="w-4 h-4 text-blue-400" />}
                <span>{service}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition"
        >
          Send message
        </button>
      </form>

      {/* Contact Info Section */}
      <div className="flex-1 space-y-8 text-zinc-100">
        <div className="bg-gradient-to-br from-blue-900/60 to-zinc-900/80 rounded-2xl shadow-xl p-8 border border-zinc-800">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-400" /> Chat with us</h3>
          <ul className="space-y-2">
            <li><a href="#" className="flex items-center gap-2 underline text-blue-400 hover:text-blue-300"><MessageCircle className="w-4 h-4" /> Start a live chat</a></li>
            <li><a href="mailto:support@huddleup.com" className="flex items-center gap-2 underline text-blue-400 hover:text-blue-300"><Mail className="w-4 h-4" /> Shoot us an email</a></li>
            <li><a href="https://x.com/huddleup" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline text-blue-400 hover:text-blue-300"><Users className="w-4 h-4" /> Message us on X</a></li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-purple-900/60 to-zinc-900/80 rounded-2xl shadow-xl p-8 border border-zinc-800">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><Phone className="w-5 h-5 text-purple-400" /> Call us</h3>
          <p className="mb-2 text-zinc-400">Call our team Mon-Fri from 8am to 5pm.</p>
          <a href="tel:+18001234567" className="flex items-center gap-2 text-purple-300 underline font-medium hover:text-purple-200"><Phone className="w-4 h-4" /> +1 (800) 123-4567</a>
        </div>
        <div className="bg-gradient-to-br from-blue-800/60 to-zinc-900/80 rounded-2xl shadow-xl p-8 border border-zinc-800">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-300" /> Visit us</h3>
          <a href="https://maps.google.com/?q=HuddleUp+HQ,+Dhaka,+Bangladesh" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-300 underline hover:text-blue-200">
            <MapPin className="w-4 h-4" /> HuddleUp
          </a>
        </div>
      </div>
    </div>
  );
}
